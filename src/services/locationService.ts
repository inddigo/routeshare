// src/services/locationService.ts
// Comparte la ubicación del conductor en tiempo real con el pasajero usando
// Supabase Realtime Broadcast (canal `ride:<tripId>`), sin necesidad de tablas
// ni migraciones. El pasajero se suscribe al mismo canal para ver el marcador
// en vivo y el estado "Conductor en camino".
import { Platform, PermissionsAndroid, NativeModules } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { logger } from './logger';

// Módulo nativo (Android): foreground service que mantiene viva la ubicación
// con la pantalla apagada o la app minimizada. Ausente en iOS/tests -> opcional.
const { LocationService } = NativeModules as {
  LocationService?: { startService: () => Promise<boolean>; stopService: () => Promise<boolean> };
};

const startForegroundService = async () => {
  if (Platform.OS !== 'android' || !LocationService) return;
  try {
    await LocationService.startService();
  } catch (error) {
    logger.warn('No se pudo iniciar el foreground service de ubicación', error);
  }
};

const stopForegroundService = async () => {
  if (Platform.OS !== 'android' || !LocationService) return;
  try {
    await LocationService.stopService();
  } catch (error) {
    logger.warn('No se pudo detener el foreground service de ubicación', error);
  }
};

export interface DriverLocation {
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
  status: 'en_camino';
  at: string;
}

export const rideChannelName = (tripId: string) => `ride:${tripId}`;

// Pide permisos de ubicación, incluido segundo plano en Android 10+.
const requestLocationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const auth = await Geolocation.requestAuthorization('always');
    return auth === 'granted';
  }

  const fine = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Ubicación',
      message: 'RouteShare comparte tu ubicación con el pasajero mientras vas en camino.',
      buttonPositive: 'Permitir',
      buttonNegative: 'Cancelar',
    },
  );
  if (fine !== PermissionsAndroid.RESULTS.GRANTED) return false;

  // Android 13+ (API 33) exige el permiso de notificaciones para poder mostrar
  // la notificación del foreground service. Sin él, el servicio puede no
  // arrancar de forma fiable. No bloqueante.
  const postNotif = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
  if (Number(Platform.Version) >= 33 && postNotif) {
    try {
      await PermissionsAndroid.request(postNotif);
    } catch {
      // ignorar: si se niega, el envío en primer plano sigue funcionando.
    }
  }

  // Android 10+ (API 29) exige solicitar el permiso de segundo plano aparte.
  if (Number(Platform.Version) >= 29) {
    const bg = PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION;
    if (bg) {
      // No bloqueante: si el usuario lo niega, igual funciona en primer plano.
      try {
        await PermissionsAndroid.request(bg, {
          title: 'Ubicación en segundo plano',
          message:
            'Permite "Todo el tiempo" para seguir compartiendo tu ubicación con la pantalla apagada o la app minimizada.',
          buttonPositive: 'Permitir',
          buttonNegative: 'Ahora no',
        });
      } catch {
        // ignorar
      }
    }
  }
  return true;
};

export interface LocationSharingHandle {
  stop: () => void;
}

/**
 * Inicia el envío continuo de la ubicación del conductor por el canal del viaje.
 * Devuelve null si no hay permisos. Llama a handle.stop() al terminar el viaje.
 */
export const startSharingLocation = async (
  tripId: string,
  onError?: (message: string) => void,
): Promise<LocationSharingHandle | null> => {
  const ok = await requestLocationPermissions();
  if (!ok) {
    onError?.('Permiso de ubicación denegado.');
    return null;
  }

  // Arranca el foreground service para mantener el tracking en segundo plano.
  await startForegroundService();

  let subscribed = false;
  const channel: RealtimeChannel = supabase.channel(rideChannelName(tripId), {
    config: { broadcast: { self: false } },
  });
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') subscribed = true;
  });

  let watchId: number;
  try {
    watchId = Geolocation.watchPosition(
      (pos) => {
        if (!subscribed) return;
        const payload: DriverLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading ?? null,
          speed: pos.coords.speed ?? null,
          status: 'en_camino',
          at: new Date().toISOString(),
        };
        channel.send({ type: 'broadcast', event: 'driver_location', payload });
      },
      (err) => {
        logger.error('Error en watchPosition', err);
        onError?.(err.message);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 15, // metros entre actualizaciones
        interval: 5000,
        fastestInterval: 3000,
        // Mantiene las actualizaciones con la app en segundo plano (Android).
        // Para fiabilidad con la pantalla apagada se recomienda además un
        // foreground service nativo (ver notas de despliegue).
        forceRequestLocation: true,
        showsBackgroundLocationIndicator: true,
      },
    );
  } catch (error: any) {
    // Si el módulo nativo falla al iniciar el watch, limpiamos y avisamos sin
    // tumbar la app.
    logger.error('No se pudo iniciar watchPosition', error);
    supabase.removeChannel(channel);
    stopForegroundService();
    onError?.('No se pudo iniciar el seguimiento de ubicación.');
    return null;
  }

  return {
    stop: () => {
      Geolocation.clearWatch(watchId);
      supabase.removeChannel(channel);
      stopForegroundService();
    },
  };
};
