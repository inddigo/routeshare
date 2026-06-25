import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Phone, MessageCircle, AlertTriangle, X, Shield, CheckCircle, Navigation } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageWithFallback from '../components/ImageWithFallback';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import { supabase } from '../services/supabase';
import { getRouteCoordinates } from '../services/orsService';
import { driverService } from '../services/driverService';
import { paymentService } from '../services/paymentService';
import {
  startSharingLocation,
  rideChannelName,
  DriverLocation,
  LocationSharingHandle,
} from '../services/locationService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ActiveRideRouteProp = RouteProp<RootStackParamList, 'ActiveRide'>;

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Viaje programado',
  IN_PROGRESS: 'Viaje en curso',
  COMPLETED: 'Viaje finalizado',
  CANCELLED: 'Viaje cancelado',
};

const STATUS_SUBTEXT: Record<string, string> = {
  SCHEDULED: 'El conductor está en camino al punto de encuentro',
  IN_PROGRESS: 'El viaje está en curso hacia el destino',
  COMPLETED: 'El viaje terminó. ¡Gracias por viajar con RouteShare!',
  CANCELLED: 'Este viaje fue cancelado',
};

export default function ActiveRideScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ActiveRideRouteProp>();
  const insets = useSafeAreaInsets();
  const { viajeId, reservaId } = route.params || ({} as any);

  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<any>(null);
  const [isDriver, setIsDriver] = useState(false);
  const [routeCoords, setRouteCoords] = useState<{latitude: number, longitude: number}[]>([]);

  // Vista pasajero
  const [pin, setPin] = useState<string[]>(['-', '-', '-', '-']);

  // Vista conductor
  const [bookings, setBookings] = useState<any[]>([]);
  const [pinInputs, setPinInputs] = useState<Record<string, string>>({});
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const sharingHandle = useRef<LocationSharingHandle | null>(null);

  // Ubicación en vivo del conductor (la ve el pasajero).
  const [driverPos, setDriverPos] = useState<DriverLocation | null>(null);

  const fetchAll = useCallback(async () => {
    if (!viajeId) {
      setLoading(false);
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Datos reales del viaje + conductor
      const { data: tripData, error: tripError } = await supabase
        .from('Trip')
        .select('*, Driver:User!Trip_driver_id_fkey (full_name, avatar_url, phone)')
        .eq('id', viajeId)
        .single();
      if (tripError) throw tripError;
      setTrip(tripData);

      const amDriver = !!user && tripData.driver_id === user.id;
      setIsDriver(amDriver);

      // Ruta real en el mapa
      if (tripData.origin_lat && tripData.destination_lat) {
        const coords = await getRouteCoordinates(
          tripData.origin_lat,
          tripData.origin_lng,
          tripData.destination_lat,
          tripData.destination_lng
        );
        setRouteCoords(
          coords && coords.length > 0
            ? coords
            : [
                { latitude: tripData.origin_lat, longitude: tripData.origin_lng },
                { latitude: tripData.destination_lat, longitude: tripData.destination_lng },
              ]
        );
      }

      if (amDriver) {
        // Conductor: reservas activas del viaje para validar abordaje
        const { data: bookingData } = await supabase
          .from('Booking')
          .select(`
            id, status, payment_status,
            Passenger:User!Booking_passenger_id_fkey (full_name, avatar_url)
          `)
          .eq('trip_id', viajeId)
          .in('status', ['REQUESTED', 'CONFIRMED']);
        setBookings(bookingData || []);
      } else if (reservaId) {
        // Pasajero: su PIN real (la columna está protegida; se consulta via RPC)
        const { data: pinData, error: pinError } = await supabase.rpc('obtener_pin_abordaje', {
          p_reserva_id: reservaId,
        });
        if (!pinError && typeof pinData === 'string') {
          setPin(pinData.split(''));
        }
      }
    } catch (error) {
      console.error('Error cargando viaje activo:', error);
    } finally {
      setLoading(false);
    }
  }, [viajeId, reservaId]);

  useEffect(() => {
    fetchAll();

    // Realtime: cambios de estado de ESTE viaje
    const channel = supabase
      .channel(`realtime_active_ride_${viajeId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'Trip', filter: `id=eq.${viajeId}` },
        (payload) => {
          setTrip((prev: any) => (prev ? { ...prev, ...payload.new } : payload.new));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [viajeId, fetchAll]);

  // Pasajero: escuchar la ubicación en vivo que transmite el conductor.
  useEffect(() => {
    if (isDriver || !viajeId) return;
    const channel = supabase
      .channel(rideChannelName(viajeId))
      .on('broadcast', { event: 'driver_location' }, ({ payload }) => {
        setDriverPos(payload as DriverLocation);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isDriver, viajeId]);

  // Conductor: detener el envío de ubicación al salir de la pantalla.
  useEffect(() => {
    return () => {
      sharingHandle.current?.stop();
      sharingHandle.current = null;
    };
  }, []);

  const toggleSharing = async () => {
    try {
      if (sharing) {
        sharingHandle.current?.stop();
        sharingHandle.current = null;
        setSharing(false);
        return;
      }
      const handle = await startSharingLocation(viajeId, (msg) =>
        Alert.alert('Ubicación', msg),
      );
      if (handle) {
        sharingHandle.current = handle;
        setSharing(true);
      }
    } catch (e: any) {
      setSharing(false);
      Alert.alert('Ubicación', e?.message || 'No se pudo iniciar el compartir de ubicación.');
    }
  };

  const handleAccept = async (bookingId: string) => {
    setActioningId(bookingId);
    try {
      const res = await driverService.acceptReservation(bookingId);
      if (!res.success) {
        Alert.alert('Error', res.error || 'No se pudo aceptar la reserva.');
        return;
      }
      Alert.alert('Reserva aceptada', 'El pasajero verá que confirmaste su cupo.');
      fetchAll();
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    setActioningId(bookingId);
    try {
      const res = await driverService.rejectReservation(bookingId);
      if (!res.success) {
        Alert.alert('Error', res.error || 'No se pudo rechazar la reserva.');
        return;
      }
      Alert.alert('Reserva rechazada', 'Se liberó el asiento y se reembolsó el pago retenido.');
      fetchAll();
    } finally {
      setActioningId(null);
    }
  };

  const handleValidatePin = async (bookingId: string) => {
    const pinValue = pinInputs[bookingId] || '';
    if (pinValue.length !== 4) {
      Alert.alert('PIN incompleto', 'Ingresa los 4 dígitos del PIN del pasajero.');
      return;
    }
    setValidatingId(bookingId);
    try {
      const res = await driverService.validatePin(bookingId, pinValue);
      if (!res.success) {
        Alert.alert('Error', res.error || 'No se pudo validar el PIN.');
        return;
      }
      if (!res.isValid) {
        Alert.alert('PIN incorrecto', 'El PIN no coincide. Verifica con el pasajero e intenta de nuevo.');
        return;
      }

      // PIN correcto = inicio del viaje para este pasajero. Modelo Uber: se
      // cobra la tarjeta guardada del pasajero AHORA (no al reservar). Si el
      // cobro falla, NO se confirma el abordaje.
      const charge = await paymentService.chargeTrip(bookingId);
      if (!charge.success) {
        Alert.alert(
          'Cobro rechazado',
          `${charge.error || 'No se pudo cobrar la tarjeta del pasajero.'}\n\nNo inicies el viaje hasta resolver el pago.`,
        );
        return;
      }

      await driverService.acceptReservation(bookingId);
      Alert.alert(
        '✅ Abordaje validado',
        charge.data?.already_paid
          ? 'El pasajero ya tenía el viaje pagado. Abordaje confirmado.'
          : 'PIN correcto y pago realizado con la tarjeta del pasajero.',
      );
      fetchAll();
    } finally {
      setValidatingId(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.statusSub}>No se encontró información del viaje.</Text>
        <TouchableOpacity style={[styles.circleButton, SHADOWS.subtle, { marginTop: SPACING.xl }]} onPress={() => navigation.goBack()}>
          <X color={COLORS.textPrimary} size={24} />
        </TouchableOpacity>
      </View>
    );
  }

  // Coordenadas seguras: si el viaje no tiene lat/lng válidas, react-native-maps
  // crashea de forma NATIVA al recibir NaN en initialRegion o en un Marker.
  // Por eso saneamos a número y caemos a un centro por defecto (Gran Valparaíso).
  const DEFAULT_LAT = -33.0472;
  const DEFAULT_LNG = -71.6127;
  const toNum = (v: any, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };
  const hasOrigin =
    Number.isFinite(Number(trip.origin_lat)) && Number.isFinite(Number(trip.origin_lng));
  const hasDestination =
    Number.isFinite(Number(trip.destination_lat)) && Number.isFinite(Number(trip.destination_lng));

  const oLat = toNum(trip.origin_lat, DEFAULT_LAT);
  const oLng = toNum(trip.origin_lng, DEFAULT_LNG);
  const dLat = toNum(trip.destination_lat, oLat);
  const dLng = toNum(trip.destination_lng, oLng);

  const originCoord = { latitude: oLat, longitude: oLng };
  const destinationCoord = { latitude: dLat, longitude: dLng };
  const mapRegion = {
    latitude: (oLat + dLat) / 2,
    longitude: (oLng + dLng) / 2,
    latitudeDelta: Math.max(Math.abs(oLat - dLat) * 2, 0.03),
    longitudeDelta: Math.max(Math.abs(oLng - dLng) * 2, 0.03),
  };

  // Pasajero recibiendo ubicación en vivo y el viaje aún no inició => "en camino".
  const enRoute = !isDriver && !!driverPos && trip.status === 'SCHEDULED';

  return (
    <View style={styles.container}>

      {/* Fullscreen Map */}
      <View style={StyleSheet.absoluteFill}>
        <MapView
          provider={PROVIDER_DEFAULT}
          mapType="none"
          style={StyleSheet.absoluteFill}
          initialRegion={mapRegion}
        >
          <UrlTile
            urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
          />
          {hasOrigin && (
            <Marker coordinate={originCoord} title={trip.origin_name}>
              <View style={styles.originMarker} />
            </Marker>
          )}
          {hasDestination && (
            <Marker coordinate={destinationCoord} title={trip.destination_name}>
              <View style={styles.destinationMarker} />
            </Marker>
          )}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor={COLORS.primary}
              strokeWidth={4}
            />
          )}
          {driverPos && (
            <Marker
              coordinate={{ latitude: driverPos.lat, longitude: driverPos.lng }}
              title="Conductor"
              description="Ubicación en vivo"
              anchor={{ x: 0.5, y: 0.5 }}
              flat
            >
              <View style={styles.driverLiveMarker} />
            </Marker>
          )}
        </MapView>
      </View>

      {/* Top Floating Controls */}
      <View style={[styles.topControls, { paddingTop: insets.top || SPACING.xl }]}>
        <TouchableOpacity
          style={[styles.circleButton, SHADOWS.subtle]}
          onPress={() => navigation.goBack()}
        >
          <X color={COLORS.textPrimary} size={24} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.sosButton, SHADOWS.subtle]}>
          <AlertTriangle color={COLORS.dangerRed} size={20} strokeWidth={2.5} />
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, SPACING.xl) }, SHADOWS.bottomSheet]}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

          {/* Status Header */}
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>
              {enRoute ? 'Conductor en camino' : STATUS_LABELS[trip.status] || trip.status}
            </Text>
            <Text style={styles.statusSub}>
              {enRoute
                ? 'Tu conductor se dirige al punto de encuentro'
                : STATUS_SUBTEXT[trip.status] || ''}
            </Text>
          </View>

          {isDriver ? (
            /* ===== Vista CONDUCTOR: solicitudes, ubicación y abordaje ===== */
            <View style={styles.pinSection}>
              <TouchableOpacity
                style={[styles.shareLocationButton, sharing && styles.shareLocationButtonActive]}
                onPress={toggleSharing}
              >
                <Navigation
                  color={sharing ? COLORS.textWhite : COLORS.primary}
                  size={20}
                  strokeWidth={2.5}
                />
                <Text style={[styles.shareLocationText, sharing && styles.shareLocationTextActive]}>
                  {sharing ? 'Compartiendo ubicación…' : 'Voy en camino (compartir ubicación)'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.pinLabel}>Solicitudes y Abordaje</Text>
              {bookings.length === 0 ? (
                <Text style={styles.pinHelpText}>Aún no hay reservas activas en este viaje.</Text>
              ) : (
                bookings.map(booking => (
                  <View key={booking.id} style={styles.passengerValidationCard}>
                    <View style={styles.passengerRow}>
                      <ImageWithFallback
                        src={booking.Passenger?.avatar_url || 'https://images.unsplash.com/photo-1539125530496-3ca408f9c2d9?fm=jpg&q=80&w=200'}
                        style={styles.passengerAvatar}
                      />
                      <View style={styles.passengerInfo}>
                        <Text style={styles.driverName}>{booking.Passenger?.full_name || 'Pasajero'}</Text>
                        <Text style={styles.vehicleInfo}>
                          {booking.payment_status === 'PAID' || booking.payment_status === 'RELEASED'
                            ? 'Pago realizado ✓'
                            : booking.payment_status === 'ESCROW'
                              ? 'Pago en custodia'
                              : 'Se cobra al iniciar el viaje'}
                        </Text>
                      </View>
                      {(booking.payment_status === 'PAID' || booking.payment_status === 'RELEASED') && (
                        <CheckCircle color={COLORS.primary} size={22} />
                      )}
                    </View>

                    {/* Solicitud pendiente: aceptar o rechazar */}
                    {booking.status === 'REQUESTED' && (
                      <View style={styles.pinEntryRow}>
                        <TouchableOpacity
                          style={[styles.validateButton, styles.rejectButton]}
                          onPress={() => handleReject(booking.id)}
                          disabled={actioningId === booking.id}
                        >
                          {actioningId === booking.id ? (
                            <ActivityIndicator color={COLORS.dangerRed} size="small" />
                          ) : (
                            <Text style={styles.rejectButtonText}>Rechazar</Text>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.validateButton, styles.acceptButton]}
                          onPress={() => handleAccept(booking.id)}
                          disabled={actioningId === booking.id}
                        >
                          {actioningId === booking.id ? (
                            <ActivityIndicator color={COLORS.textWhite} size="small" />
                          ) : (
                            <Text style={styles.validateButtonText}>Aceptar</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Reserva confirmada y sin cobrar aún: validar PIN -> cobra la tarjeta */}
                    {booking.status === 'CONFIRMED' &&
                      booking.payment_status !== 'RELEASED' &&
                      booking.payment_status !== 'PAID' && (
                      <View style={styles.pinEntryRow}>
                        <TextInput
                          style={styles.pinTextInput}
                          value={pinInputs[booking.id] || ''}
                          onChangeText={(text) =>
                            setPinInputs(prev => ({ ...prev, [booking.id]: text.replace(/[^0-9]/g, '').slice(0, 4) }))
                          }
                          placeholder="• • • •"
                          placeholderTextColor={COLORS.textSecondary}
                          keyboardType="number-pad"
                          maxLength={4}
                        />
                        <TouchableOpacity
                          style={styles.validateButton}
                          onPress={() => handleValidatePin(booking.id)}
                          disabled={validatingId === booking.id}
                        >
                          {validatingId === booking.id ? (
                            <ActivityIndicator color={COLORS.textWhite} size="small" />
                          ) : (
                            <Text style={styles.validateButtonText}>Validar</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))
              )}
              <Text style={styles.pinHelpText}>Pide al pasajero su PIN de abordaje. Al validarlo, el pago en custodia se libera a tu saldo.</Text>
            </View>
          ) : (
            /* ===== Vista PASAJERO: mostrar PIN real ===== */
            <View style={styles.pinSection}>
              <Text style={styles.pinLabel}>PIN de Abordaje</Text>
              <View style={styles.pinBoxesContainer}>
                {pin.map((digit, index) => (
                  <View key={index} style={styles.pinBox}>
                    <Text style={styles.pinDigit}>{digit}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.pinHelpText}>Dile este PIN al conductor para validar tu abordaje</Text>
            </View>
          )}

          {/* Driver Info (solo vista pasajero) */}
          {!isDriver && (
            <View style={styles.driverInfoContainer}>
              <View style={styles.driverProfile}>
                <ImageWithFallback
                  src={trip.Driver?.avatar_url || 'https://images.unsplash.com/photo-1620400975473-777541fd7add?fm=jpg&q=80&w=200'}
                  style={styles.driverAvatar}
                />
                <View>
                  <Text style={styles.driverName}>{trip.Driver?.full_name || 'Conductor'}</Text>
                  <Text style={styles.vehicleInfo}>{trip.origin_name} → {trip.destination_name}</Text>
                </View>
              </View>

              <View style={styles.driverActions}>
                <TouchableOpacity style={styles.actionIconButton}>
                  <MessageCircle color={COLORS.primary} size={20} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionIconButton}>
                  <Phone color={COLORS.primary} size={20} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Share Route */}
          <TouchableOpacity style={styles.shareRouteButton}>
            <Shield color={COLORS.textPrimary} size={20} />
            <Text style={styles.shareRouteText}>Compartir estado del viaje</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  originMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  destinationMarker: {
    width: 16,
    height: 16,
    backgroundColor: COLORS.textPrimary,
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    height: 44,
    borderRadius: 22,
    gap: SPACING.sm,
  },
  sosText: {
    color: COLORS.dangerRed,
    fontWeight: FONTS.bold,
    fontSize: FONTS.sm,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '62%',
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  statusHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
  statusSub: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  pinSection: {
    backgroundColor: COLORS.lightGrey,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  pinLabel: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pinBoxesContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  pinBox: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  pinDigit: {
    fontSize: 32,
    fontWeight: FONTS.heavy,
    color: COLORS.primary,
  },
  pinHelpText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  passengerValidationCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerInfo: {
    flex: 1,
  },
  passengerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.md,
  },
  pinEntryRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  pinTextInput: {
    flex: 1,
    backgroundColor: COLORS.lightGrey,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    height: 48,
    fontSize: 20,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: 8,
    textAlign: 'center',
  },
  validateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    height: 48,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validateButtonText: {
    color: COLORS.textWhite,
    fontWeight: FONTS.bold,
    fontSize: FONTS.sm,
  },
  acceptButton: {
    flex: 1,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.dangerRed,
  },
  rejectButtonText: {
    color: COLORS.dangerRed,
    fontWeight: FONTS.bold,
    fontSize: FONTS.sm,
  },
  driverLiveMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.accent,
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  shareLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    width: '100%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  shareLocationButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  shareLocationText: {
    color: COLORS.primary,
    fontWeight: FONTS.bold,
    fontSize: FONTS.sm,
  },
  shareLocationTextActive: {
    color: COLORS.textWhite,
  },
  driverInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.xl,
  },
  driverProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SPACING.md,
  },
  driverName: {
    fontSize: FONTS.md,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  vehicleInfo: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  driverActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  shareRouteText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
});
