import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Calendar, Clock, ShieldCheck, Star } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import ScreenHeader from '../components/ScreenHeader';
import PrimaryButton from '../components/PrimaryButton';
import ImageWithFallback from '../components/ImageWithFallback';
import RouteTimeline from '../components/RouteTimeline';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import { supabase } from '../services/supabase';
import { reservationService } from '../services/reservationService';
import { getRouteCoordinates } from '../services/orsService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TripDetailsRouteProp = RouteProp<RootStackParamList, 'TripDetails'>;

export default function TripDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TripDetailsRouteProp>();

  const { viajeId } = route.params || { viajeId: null };
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [tripData, setTripData] = useState<any>(null);
  const [routeCoords, setRouteCoords] = useState<{latitude: number, longitude: number}[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!viajeId) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('Trip')
          .select(`
            *,
            Driver:User!Trip_driver_id_fkey (full_name, avatar_url)
          `)
          .eq('id', viajeId)
          .single();
        if (data) {
          setTripData(data);

          // Fetch real route coordinates if origin and destination exist
          if (data.origin_lat && data.destination_lat) {
            const coords = await getRouteCoordinates(
              data.origin_lat,
              data.origin_lng,
              data.destination_lat,
              data.destination_lng
            );
            if (coords && coords.length > 0) {
              setRouteCoords(coords);
            } else {
              // Fallback to straight line
              setRouteCoords([
                { latitude: data.origin_lat, longitude: data.origin_lng },
                { latitude: data.destination_lat, longitude: data.destination_lng }
              ]);
            }
          }
        }
        if (error) console.error(error);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [viajeId]);

  const handleReserve = async () => {
    if (!viajeId) return;
    setReserving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Error", "Debes iniciar sesión para reservar.");
        setReserving(false);
        return;
      }
      const res = await reservationService.createReservation(viajeId, user.id);
      if (res.success) {
        Alert.alert("Éxito", "Viaje reservado correctamente");
        navigation.navigate('MainTabs', { screen: 'Trips' });
      } else {
        Alert.alert("Error", res.error || "No se pudo reservar el viaje");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
    setReserving(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!tripData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: COLORS.textSecondary }}>No se encontró información del viaje.</Text>
        <PrimaryButton title="Volver" onPress={() => navigation.goBack()} style={styles.backButton} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Detalles del viaje" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Map Header */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_DEFAULT}
            mapType="none"
            style={styles.map}
            initialRegion={{
              latitude: -33.0245,
              longitude: -71.5518,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <UrlTile
              urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
            />
            {/* Origin */}
            <Marker coordinate={{ latitude: tripData?.origin_lat || -33.0245, longitude: tripData?.origin_lng || -71.5518 }}>
              <View style={styles.originMarker} />
            </Marker>
            {/* Destination */}
            <Marker coordinate={{ latitude: tripData?.destination_lat || -33.0345, longitude: tripData?.destination_lng || -71.5418 }}>
              <View style={styles.destinationMarker} />
            </Marker>
            {routeCoords.length > 0 && (
              <Polyline 
                coordinates={routeCoords}
                strokeColor={COLORS.primary}
                strokeWidth={4}
              />
            )}
          </MapView>
        </View>

        {/* Driver Card (Floating) */}
        <View style={styles.driverCardWrapper}>
          <View style={[styles.driverCard, SHADOWS.card]}>
            <View style={styles.driverCardLeft}>
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1620400975473-777541fd7add?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwbWFsZSUyMHN0dWRlbnQlMjBjYXN1YWwlMjBwcm9maWxlfGVufDF8fHx8MTc4MDYyODU3NXww&ixlib=rb-4.1.0&q=80&w=1080"
                style={styles.driverAvatar}
              />
              <View>
                <Text style={styles.driverName}>{tripData.Driver?.full_name || 'Conductor'}</Text>
                <View style={styles.ratingRow}>
                  <Star color={COLORS.accent} size={14} fill={COLORS.accent} />
                  <Text style={styles.ratingText}>5.0 (Nuevos viajes)</Text>
                </View>
              </View>
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleText}>Vehículo Estándar</Text>
              <View style={styles.plateBadge}>
                <Text style={styles.plateText}>ABC-12</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.contentPadding}>
          {/* Trip Info Grid */}
          <View style={styles.gridContainer}>
            <View style={[styles.gridItem, SHADOWS.subtle]}>
              <Calendar color={COLORS.primary} size={20} />
              <Text style={styles.gridItemLabel}>FECHA</Text>
              <Text style={styles.gridItemValue}>{new Date(tripData.departure_datetime).toLocaleDateString()}</Text>
            </View>
            <View style={[styles.gridItem, SHADOWS.subtle]}>
              <Clock color={COLORS.primary} size={20} />
              <Text style={styles.gridItemLabel}>HORA</Text>
              <Text style={styles.gridItemValue}>{new Date(tripData.departure_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
            </View>
            <View style={[styles.gridItem, SHADOWS.subtle]}>
              <Text style={styles.detailIconText}>💺</Text>
              <Text style={styles.gridItemLabel}>DISPONIBLE</Text>
              <Text style={styles.gridItemValue}>{tripData.available_seats}</Text>
            </View>
          </View>

          {/* Route Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ruta del viaje</Text>
            <View style={styles.routeContainer}>
              <RouteTimeline
                origin={tripData.origin_name || "Punto de Origen"}
                originSubtext=""
                destination={tripData.destination_name || "Punto de Llegada"}
                destinationSubtext=""
              />
            </View>
          </View>

          {/* Escrow Banner */}
          <View style={styles.escrowBanner}>
            <View style={styles.escrowHeaderRow}>
              <ShieldCheck color={COLORS.primary} size={24} strokeWidth={2.5} />
              <Text style={styles.escrowTitle}>Aporte sugerido: ${(tripData.suggested_price_clp || 1500).toLocaleString('es-CL')}</Text>
            </View>
            <Text style={styles.escrowSub}>No se cobra nada al solicitar el viaje. Se cobra a tu tarjeta guardada solo cuando el conductor valida tu abordaje (inicio del viaje).</Text>
          </View>

          {/* Confirmed Passengers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pasajeros confirmados</Text>
            <View style={styles.passengersRow}>
              <View style={styles.passengerAvatarContainer}>
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1539125530496-3ca408f9c2d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbGUlMjBjb2xsZWdlJTIwc3R1ZGVudCUyMHByb2ZpbGUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3ODA2MzAxNDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  style={styles.passengerAvatar}
                />
              </View>
              <View style={styles.passengerAvatarContainer}>
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1620400975473-777541fd7add?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwbWFsZSUyMHN0dWRlbnQlMjBjYXN1YWwlMjBwcm9maWxlfGVufDF8fHx8MTc4MDYyODU3NXww&ixlib=rb-4.1.0&q=80&w=1080"
                  style={styles.passengerAvatar}
                />
              </View>
              <View style={[styles.passengerAvatarContainer, styles.passengerAvatarEmpty]}>
                <Text style={styles.passengerAvatarEmptyText}>1</Text>
              </View>
            </View>
          </View>

        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {currentUserId === tripData.driver_id ? (
          <PrimaryButton 
            title="Tu viaje"
            onPress={() => {}} 
            variant="outline"
            disabled={true}
          />
        ) : (
          <PrimaryButton 
            title={reserving ? "Procesando..." : `Solicitar viaje • $${(tripData.suggested_price_clp || 1500).toLocaleString('es-CL')}`}
            onPress={handleReserve} 
            variant="secondary"
            disabled={reserving}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.section,
  },
  mapContainer: {
    height: 200,
    backgroundColor: COLORS.lightGrey,
  },
  map: {
    width: '100%',
    height: '100%',
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
  driverCardWrapper: {
    paddingHorizontal: SPACING.xl,
    marginTop: -40,
    marginBottom: SPACING.xl,
  },
  driverCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  driverCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  ratingText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  vehicleInfo: {
    alignItems: 'flex-end',
  },
  vehicleText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.medium,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  plateBadge: {
    backgroundColor: COLORS.lightGrey,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  plateText: {
    fontSize: 10,
    fontWeight: FONTS.bold,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  contentPadding: {
    paddingHorizontal: SPACING.xl,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  gridItem: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  gridItemLabel: {
    fontSize: 10,
    fontWeight: FONTS.bold,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  gridItemValue: {
    fontSize: FONTS.md,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  detailIconText: {
    fontSize: 18,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  routeContainer: {
    backgroundColor: COLORS.lightGrey,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  escrowBanner: {
    backgroundColor: COLORS.lightGrey,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.xxl,
  },
  escrowHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  escrowTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
  escrowSub: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  passengersRow: {
    flexDirection: 'row',
    gap: -12, // Overlap effect
    paddingLeft: 12,
  },
  passengerAvatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: COLORS.surface,
    backgroundColor: COLORS.lightGrey,
    overflow: 'hidden',
  },
  passengerAvatar: {
    width: '100%',
    height: '100%',
  },
  passengerAvatarEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderColor: COLORS.borderGrey,
    borderWidth: 2,
    marginLeft: 12, // Don't overlap the empty one
  },
  passengerAvatarEmptyText: {
    color: COLORS.textSecondary,
    fontWeight: FONTS.bold,
  },
  footer: {
    padding: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xl,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});
