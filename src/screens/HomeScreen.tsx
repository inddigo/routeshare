import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Search, PlusCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageWithFallback from '../components/ImageWithFallback';
import { WebView } from 'react-native-webview';
import { supabase } from '../services/supabase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const getMapHTML = (routes: any[]) => {
  // Coordenadas válidas de los orígenes de viajes activos.
  const points = routes
    .filter((r) => typeof r.origin_lat === 'number' && typeof r.origin_lng === 'number')
    .map((r) => [r.origin_lat, r.origin_lng]);
  const pointsJson = JSON.stringify(points);
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { padding: 0; margin: 0; }
            html, body, #map { height: 100%; width: 100%; }
            .leaflet-control-container { display: none; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map', { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false }).setView([-33.0245, -71.5518], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);

            var pts = ${pointsJson};
            // Usamos circleMarker (SVG): siempre renderiza, a diferencia de
            // L.marker, cuyos íconos en PNG no cargan de forma fiable en WebView.
            var layer = L.layerGroup().addTo(map);
            pts.forEach(function (p) {
                L.circleMarker(p, {
                    radius: 7,
                    color: '#ffffff',
                    weight: 2,
                    fillColor: '#2563eb',
                    fillOpacity: 1,
                }).addTo(layer);
            });

            // Encuadrar el mapa a los marcadores disponibles.
            if (pts.length === 1) {
                map.setView(pts[0], 14);
            } else if (pts.length > 1) {
                map.fitBounds(pts, { padding: [30, 30], maxZoom: 15 });
            }
        </script>
    </body>
    </html>
  `;
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  
  const [userName, setUserName] = useState('Usuario');
  const [userAvatar, setUserAvatar] = useState('https://images.unsplash.com/photo-1620400975473-777541fd7add?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwbWFsZSUyMHN0dWRlbnQlMjBjYXN1YWwlMjBwcm9maWxlfGVufDF8fHx8MTc4MDYyODU3NXww&ixlib=rb-4.1.0&q=80&w=1080');
  const [activeRoutes, setActiveRoutes] = useState<any[]>([]);
  const [featuredTrip, setFeaturedTrip] = useState<any>(null);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('User')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserName(profile.full_name || 'Usuario');
          if (profile.avatar_url) setUserAvatar(profile.avatar_url);
        }

        // Fetch user's trips
        const { data: userTripsData } = await supabase
          .from('Booking')
          .select(`
            id,
            status,
            Trip (
              id,
              departure_datetime,
              status,
              origin_lat,
              origin_lng,
              destination_lat,
              destination_lng,
              origin_name,
              destination_name,
              Driver:User!Trip_driver_id_fkey (full_name, avatar_url)
            )
          `)
          .eq('passenger_id', user.id);

        if (userTripsData && userTripsData.length > 0) {
          // Find next scheduled
          const upcoming = userTripsData.find((r: any) => {
            const viaje = Array.isArray(r.Trip) ? r.Trip[0] : r.Trip;
            return viaje?.status === 'SCHEDULED' || viaje?.status === 'IN_PROGRESS';
          });
          if (upcoming) {
            const v = Array.isArray(upcoming.Trip) ? upcoming.Trip[0] : upcoming.Trip;
            setFeaturedTrip({ ...upcoming, Trip: v });
          } else {
            // Otherwise, last completed/cancelled
            const first = userTripsData[0];
            const v = Array.isArray((first as any).Trip) ? (first as any).Trip[0] : (first as any).Trip;
            setFeaturedTrip({ ...first, Trip: v });
          }
        }
      }

      // Fetch all active platform routes
      const { data: allTrips } = await supabase
        .from('Trip')
        .select('id, origin_lat, origin_lng')
        .eq('status', 'SCHEDULED');

      if (allTrips) {
        setActiveRoutes(allTrips.filter((t: any) => t.origin_lat));
      }
    } catch (error) {
      console.error('Error buscando viajes:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACING.xxxl }}>
        
        {/* Header Section */}
        <View style={[styles.header, { paddingTop: insets.top + SPACING.xl }]}>
          {/* Subtle decorative background shape */}
          <View style={styles.headerDecoration} />
          
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greetingTitle}>Bienvenido, {userName}</Text>
              <Text style={styles.greetingSubtitle}>¿A dónde vamos hoy?</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}>
              <ImageWithFallback 
                src={userAvatar}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.mainContent}>
          
          {/* Main Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('MainTabs', { screen: 'Search' })}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, { backgroundColor: COLORS.primaryLight }]}>
                <Search color={COLORS.primary} size={20} strokeWidth={2.5} />
              </View>
              <Text style={styles.actionText}>Encontrar viaje</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('OfferRide')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, { backgroundColor: COLORS.accentLight }]}>
                <PlusCircle color={COLORS.accent} size={20} strokeWidth={2.5} />
              </View>
              <Text style={styles.actionText}>Ofrecer viaje</Text>
            </TouchableOpacity>
          </View>

          {/* Next Trip Card */}
          {featuredTrip ? (
            <View style={[styles.card, SHADOWS.subtle]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {featuredTrip.Trip?.status === 'SCHEDULED' || featuredTrip.Trip?.status === 'IN_PROGRESS' ? 'Tu Próximo Viaje' : 'Tu Último Viaje'}
                </Text>
                <View style={[styles.badge, featuredTrip.Trip?.status !== 'SCHEDULED' && { backgroundColor: COLORS.lightGrey }]}>
                  <Text style={[styles.badgeText, featuredTrip.Trip?.status !== 'SCHEDULED' && { color: COLORS.textSecondary }]}>
                    {new Date(featuredTrip.Trip?.departure_datetime).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.cardBody}>
                <View style={styles.timelineContainer}>
                  <View style={styles.timelineLine} />
                  
                  <View style={styles.timelinePoint}>
                    <View style={styles.timelineDotOrigin} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelinePointTitle}>{featuredTrip.Trip?.origin_name || 'Origen'}</Text>
                      <Text style={styles.timelinePointSubtext}>Punto de encuentro</Text>
                    </View>
                  </View>
                  
                  <View style={styles.timelinePoint}>
                    <View style={styles.timelineDotDestination} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelinePointTitle}>{featuredTrip.Trip?.destination_name || 'Destino'}</Text>
                      <Text style={styles.timelinePointSubtext}>Punto de llegada</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.driverSection}>
                  <View style={styles.driverInfo}>
                    <ImageWithFallback 
                      src={featuredTrip.Trip?.Driver?.avatar_url || "https://images.unsplash.com/photo-1620400975473-777541fd7add?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwbWFsZSUyMHN0dWRlbnQlMjBjYXN1YWwlMjBwcm9maWxlfGVufDF8fHx8MTc4MDYyODU3NXww&ixlib=rb-4.1.0&q=80&w=1080"}
                      style={styles.driverAvatar}
                    />
                    <View>
                      <Text style={styles.driverName}>{featuredTrip.Trip?.Driver?.full_name || 'Conductor'}</Text>
                      <Text style={styles.carInfo}>Conductor de RouteShare</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.detailsButton}
                    onPress={() => navigation.navigate('TripDetails', { viajeId: featuredTrip.Trip?.id } as any)}
                  >
                    <Text style={styles.detailsButtonText}>Ver detalles</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={[styles.card, SHADOWS.subtle, styles.emptyRecentCard]}>
              <Text style={{ fontSize: FONTS.md, color: COLORS.textSecondary, marginBottom: SPACING.sm }}>No tienes viajes recientes</Text>
              <Text style={{ fontSize: FONTS.xs, color: COLORS.textSecondary }}>Busca un viaje para empezar a moverte.</Text>
            </View>
          )}

          {/* Map View */}
          <View style={[styles.card, SHADOWS.subtle]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Rutas Universitarias Activas</Text>
              <TouchableOpacity>
                <Text style={styles.refreshText}>Actualizar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mapContainer}>
              <WebView
                source={{ html: getMapHTML(activeRoutes) }}
                style={styles.webview}
                scrollEnabled={false}
                pointerEvents="none"
              />
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyRecentCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    position: 'relative',
    overflow: 'hidden',
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.textWhite,
    opacity: 0.1,
    transform: [{ translateX: 50 }, { translateY: -50 }],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  greetingTitle: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.semibold,
    color: COLORS.textWhite,
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: FONTS.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  mainContent: {
    paddingHorizontal: SPACING.xl,
    marginTop: -SPACING.xl,
    zIndex: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sm,
    fontWeight: FONTS.medium,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontWeight: FONTS.semibold,
    fontSize: FONTS.md,
  },
  badge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    color: '#b38113', // Darker gold for text
    fontSize: FONTS.xs,
    fontWeight: FONTS.semibold,
  },
  refreshText: {
    color: COLORS.primary,
    fontSize: FONTS.xs,
    fontWeight: FONTS.medium,
  },
  cardBody: {
    padding: SPACING.xl,
  },
  timelineContainer: {
    paddingLeft: SPACING.sm,
    position: 'relative',
    marginBottom: SPACING.xl,
  },
  timelineLine: {
    position: 'absolute',
    left: 13,
    top: 12,
    bottom: 12,
    width: 2,
    backgroundColor: COLORS.border,
    borderRadius: 1,
  },
  timelinePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  timelineDotOrigin: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    borderWidth: 2,
    borderColor: COLORS.surface,
    zIndex: 10,
  },
  timelineDotDestination: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    marginTop: 6,
    borderWidth: 2,
    borderColor: COLORS.surface,
    zIndex: 10,
  },
  timelineContent: {
    marginLeft: SPACING.lg,
  },
  timelinePointTitle: {
    color: COLORS.textPrimary,
    fontWeight: FONTS.medium,
    fontSize: FONTS.sm,
  },
  timelinePointSubtext: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    marginTop: 2,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: SPACING.md,
  },
  driverName: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sm,
    fontWeight: FONTS.medium,
  },
  carInfo: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    marginTop: 2,
  },
  detailsButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  detailsButtonText: {
    color: COLORS.textWhite,
    fontSize: FONTS.xs,
    fontWeight: FONTS.medium,
  },
  mapContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.lightGrey,
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  mapMarker: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
    padding: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mapMarkerAccent: {
    position: 'absolute',
    backgroundColor: COLORS.accent,
    padding: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
