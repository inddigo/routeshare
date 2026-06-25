// src/services/pushService.ts
// Registro del dispositivo en FCM y guardado del token en DeviceToken.
// El envío ocurre en el servidor: trigger notificar_booking -> Edge Function
// push-booking (FCM HTTP v1).
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { supabase } from './supabase';
import { logger } from './logger';

let tokenRefreshSubscribed = false;

export const pushService = {
  // Pide permiso, obtiene el token FCM y lo guarda asociado al usuario actual.
  registerDevice: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Android 13+ exige el permiso POST_NOTIFICATIONS en runtime.
      if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          logger.warn('Permiso de notificaciones denegado');
          return;
        }
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (!enabled) return;

      const token = await messaging().getToken();
      if (token) {
        await pushService.saveToken(user.id, token);
      }

      // FCM puede rotar el token: mantenerlo sincronizado (listener único).
      if (!tokenRefreshSubscribed) {
        tokenRefreshSubscribed = true;
        messaging().onTokenRefresh(async (newToken) => {
          const { data: { user: current } } = await supabase.auth.getUser();
          if (current) await pushService.saveToken(current.id, newToken);
        });
      }
    } catch (error) {
      logger.error('Error registrando dispositivo para push', error);
    }
  },

  saveToken: async (userId: string, token: string) => {
    const { error } = await supabase
      .from('DeviceToken')
      .upsert(
        {
          token,
          user_id: userId,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'token' },
      );
    if (error) logger.error('Error guardando DeviceToken', error);
  },

  // Notificaciones con la app en primer plano (FCM no las muestra solo).
  listenForeground: () => {
    return messaging().onMessage(async (remoteMessage) => {
      const title = remoteMessage.notification?.title;
      const body = remoteMessage.notification?.body;
      if (title || body) {
        Alert.alert(title || 'RouteShare', body || '');
      }
    });
  },
};
