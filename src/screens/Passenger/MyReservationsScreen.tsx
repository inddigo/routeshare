// src/screens/Passenger/MyReservationsScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { reservationService } from '../../services/reservationService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const MyReservationsScreen = ({ navigation }: any) => {
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReservas = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { success, data } = await reservationService.getMyReservations(user.id);
    if (success && data) {
      setReservas(data);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchReservas();
    
    // Refresh when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      setLoading(true);
      fetchReservas();
    });
    return unsubscribe;
  }, [fetchReservas, navigation]);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'confirmada': return COLORS.statusBadgeGreen;
      case 'pendiente': return 'rgba(245, 166, 35, 0.15)';
      case 'cancelada': case 'rechazada': return '#FDECEA';
      default: return COLORS.lightGrey;
    }
  };

  const getStatusTextColor = (estado: string) => {
    switch (estado) {
      case 'confirmada': return COLORS.statusTextGreen;
      case 'pendiente': return COLORS.warning;
      case 'cancelada': case 'rechazada': return COLORS.danger;
      default: return COLORS.textSecondary;
    }
  };

  const renderReserva = ({ item }: { item: any }) => {
    const viaje = item.viajes;
    const ruta = viaje.rutas;
    const conductor = item.usuarios;
    
    const fecha = new Date(viaje.fecha_hora).toLocaleDateString('es-CL', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const isClickable = item.estado === 'confirmada' && (viaje.estado === 'programado' || viaje.estado === 'activo');

    return (
      <TouchableOpacity 
        style={styles.card}
        disabled={!isClickable}
        onPress={() => navigation.navigate('ActiveTrip', { reserva: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.fecha}>{fecha}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}>
            <Text style={[styles.statusText, { color: getStatusTextColor(item.estado) }]}>
              {item.estado}
            </Text>
          </View>
        </View>

        <Text style={styles.conductor}>Conductor: {conductor.nombre}</Text>
        <Text style={styles.ruta}>Destino: {ruta.destino_lat.toFixed(3)}, {ruta.destino_lng.toFixed(3)}</Text>

        {(item.estado === 'confirmada' || item.estado === 'pendiente') && (
          <View style={styles.pinContainer}>
            <Text style={styles.pinLabel}>PIN de Abordaje:</Text>
            <Text style={styles.pinCode}>{item.pin}</Text>
          </View>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.pagoStatus}>Pago: {item.estado_pago}</Text>
          {isClickable && <Text style={styles.actionText}>Ver viaje en curso →</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.accent} style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reservas}
        keyExtractor={(item) => item.id}
        renderItem={renderReserva}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReservas(); }} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No tienes reservas aún.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGrey },
  loader: { flex: 1, justifyContent: 'center' },
  listContainer: { padding: SPACING.lg },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.card },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  fecha: { fontSize: FONTS.lg, fontWeight: FONTS.bold, color: COLORS.textPrimary },
  statusBadge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.pill },
  statusText: { fontSize: FONTS.xs, fontWeight: FONTS.bold, textTransform: 'uppercase' },
  conductor: { fontSize: FONTS.md, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  ruta: { fontSize: FONTS.md, color: COLORS.textSecondary },
  pinContainer: { backgroundColor: COLORS.statusBadgeGreen, borderRadius: RADIUS.sm, padding: SPACING.md, marginTop: SPACING.md, alignItems: 'center' },
  pinLabel: { fontSize: FONTS.xs, color: COLORS.accentDark, marginBottom: SPACING.xs },
  pinCode: { fontSize: FONTS.xxl, fontWeight: FONTS.heavy, color: COLORS.accentDark, letterSpacing: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: SPACING.md },
  pagoStatus: { fontSize: FONTS.sm, color: COLORS.textMuted, textTransform: 'capitalize' },
  actionText: { fontSize: FONTS.sm, color: COLORS.accentDark, fontWeight: FONTS.bold },
  emptyText: { textAlign: 'center', marginTop: SPACING.section, fontSize: FONTS.lg, color: COLORS.textMuted }
});

export default React.memo(MyReservationsScreen);
