import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Leaf, ShieldCheck } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RouteTimeline from '../components/RouteTimeline';
import { supabase } from '../services/supabase';
import { getUserTrips, getDriverTrips } from '../services/tripsService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TripsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Reservas como pasajero + viajes propios como conductor
          const [res, driverRes] = await Promise.all([
            getUserTrips(user.id),
            getDriverTrips(user.id),
          ]);
          const passengerItems = (res.success ? res.data || [] : []).map((r: any) => ({
            ...r,
            isDriver: false,
          }));
          const driverItems = (driverRes.success ? driverRes.data || [] : []).map((t: any) => ({
            id: `driver-${t.id}`,
            status: 'CONDUCTOR',
            Trip: t,
            isDriver: true,
          }));
          setTrips([...passengerItems, ...driverItems]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const upcomingTrips = trips.filter(t => t.Trip?.status === 'SCHEDULED' || t.Trip?.status === 'IN_PROGRESS');
  const historyTrips = trips.filter(t => t.Trip?.status === 'COMPLETED' || t.Trip?.status === 'CANCELLED');

  const totalCo2 = historyTrips.length * 5.5;

  return (
    <View style={styles.container}>
      {/* Header & Tabs */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xl }]}>
        <Text style={styles.headerTitle}>Mis viajes</Text>
        
        {/* Segmented Control */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity 
            style={[styles.segmentButton, activeTab === 'upcoming' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('upcoming')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'upcoming' && styles.segmentTextActive]}>
              Próximos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segmentButton, activeTab === 'history' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('history')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'history' && styles.segmentTextActive]}>
              Historial
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Global Impact Banner */}
        <View style={[styles.impactBanner, SHADOWS.subtle]}>
          <View style={styles.impactIconContainer}>
            <Leaf color={COLORS.accent} size={20} strokeWidth={2.5} />
          </View>
          <Text style={styles.impactText}>
            Impacto total: <Text style={styles.impactTextBold}>{totalCo2} kg de CO2 ahorrados</Text>
          </Text>
        </View>

        {/* Tab Content */}
        {activeTab === 'upcoming' ? (
          <View style={styles.tabContent}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
            ) : upcomingTrips.length > 0 ? (
              upcomingTrips.map((reserva) => (
                <TripCard 
                  key={reserva.id}
                  date={new Date(reserva.Trip?.departure_datetime).toLocaleString()}
                  status={reserva.status}
                  origin={reserva.Trip?.origin_name || "Origen"}
                  destination={reserva.Trip?.destination_name || "Destino"}
                  onPress={() => {
                    if (reserva.Trip?.id) {
                      navigation.navigate('ActiveRide', {
                        viajeId: reserva.Trip.id,
                        reservaId: reserva.isDriver ? undefined : reserva.id,
                      });
                    }
                  }}
                />
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateTitle}>No tienes viajes próximos.</Text>
                <Text style={styles.emptyStateSubtitle}>Busca un viaje o ofrece uno para empezar.</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.tabContent}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
            ) : historyTrips.length > 0 ? (
              historyTrips.map((reserva) => (
                <TripCard 
                  key={reserva.id}
                  date={new Date(reserva.Trip?.departure_datetime).toLocaleString()}
                  status={reserva.status}
                  origin={reserva.Trip?.origin_name || "Origen"}
                  destination={reserva.Trip?.destination_name || "Destino"}
                  onPress={() => {}}
                />
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateTitle}>No hay viajes en tu historial.</Text>
                <Text style={styles.emptyStateSubtitle}>Tus viajes pasados aparecerán aquí.</Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// Sub-component: TripCard
function TripCard({ date, status, origin, destination, onPress }: any) {
  return (
    <View style={styles.tripCard}>
      {/* Card Header */}
      <View style={styles.tripCardHeader}>
        <Text style={styles.tripCardDate}>{date}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>{status}</Text>
        </View>
      </View>

      {/* Route Visualization */}
      <View style={styles.routeContainer}>
        <RouteTimeline origin={origin} destination={destination} />
      </View>

      {/* Escrow Row */}
      <View style={styles.escrowRow}>
        <ShieldCheck color={COLORS.primary} size={20} strokeWidth={2.5} />
        <Text style={styles.escrowText}>Pago en custodia</Text>
      </View>

      {/* Action Button */}
      <TouchableOpacity style={styles.actionButton} onPress={onPress}>
        <Text style={styles.actionButtonText}>Ver detalles</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingIndicator: {
    marginTop: 40,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: SPACING.xl,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGrey,
    borderRadius: RADIUS.md,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.textWhite,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING.section,
  },
  impactBanner: {
    backgroundColor: COLORS.lightGrey,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.xl,
  },
  impactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  impactText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONTS.sm,
  },
  impactTextBold: {
    fontWeight: FONTS.bold,
  },
  tabContent: {
    paddingBottom: SPACING.xxl,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: SPACING.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
  },
  emptyStateTitle: {
    color: COLORS.textSecondary,
    fontWeight: FONTS.bold,
    fontSize: FONTS.sm,
  },
  emptyStateSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    marginTop: SPACING.xs,
  },
  tripCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  tripCardDate: {
    color: COLORS.textPrimary,
    fontWeight: FONTS.bold,
    fontSize: FONTS.lg,
    letterSpacing: -0.5,
  },
  statusBadge: {
    backgroundColor: '#e6f4ea',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  statusBadgeText: {
    color: '#137333',
    fontWeight: FONTS.bold,
    fontSize: FONTS.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  routeContainer: {
    marginBottom: SPACING.xl,
  },
  escrowRow: {
    backgroundColor: COLORS.lightGrey,
    borderRadius: RADIUS.md,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.xl,
  },
  escrowText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    color: COLORS.textWhite,
    fontWeight: FONTS.bold,
    fontSize: FONTS.sm,
  },
});
