// src/screens/Driver/DriverReservationsScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { driverService } from '../../services/driverService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const DriverReservationsScreen = () => {
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservas = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: cond } = await supabase.from('conductores').select('id').eq('usuario_id', user.id).single();
    if (!cond) {
      setLoading(false);
      return;
    }

    const { success, data } = await driverService.getDriverReservations(cond.id);
    if (success && data) {
      setReservas(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  const handleAction = async (reservaId: string, action: 'accept' | 'reject') => {
    const title = action === 'accept' ? 'Aceptar Reserva' : 'Rechazar Reserva';
    const msg = action === 'accept' 
      ? '¿Confirmas a este pasajero para tu viaje?' 
      : '¿Estás seguro? Se reembolsará el dinero al pasajero.';

    Alert.alert(title, msg, [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sí, continuar', 
        style: action === 'reject' ? 'destructive' : 'default',
        onPress: async () => {
          setLoading(true);
          let success = false;
          if (action === 'accept') {
            const res = await driverService.acceptReservation(reservaId);
            success = res.success;
          } else {
            const res = await driverService.rejectReservation(reservaId);
            success = res.success;
          }

          if (success) fetchReservas();
          else {
            Alert.alert('Error', 'No se pudo procesar la acción.');
            setLoading(false);
          }
        }
      }
    ]);
  };

  const renderReserva = ({ item }: { item: any }) => {
    const pasajero = item.usuarios;
    const ruta = item.viajes.rutas;
    const isPending = item.estado === 'pendiente';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.pasajeroName}>{pasajero.nombre} {pasajero.apellido_paterno}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {pasajero.reputacion_promedio?.toFixed(1) || '5.0'}</Text>
          </View>
        </View>

        <Text style={styles.viajeText}>Hacia: {ruta.destino_lat.toFixed(3)}, {ruta.destino_lng.toFixed(3)}</Text>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Estado:</Text>
          <Text style={[styles.statusValue, !isPending && { color: COLORS.successGreen }]}>{item.estado.toUpperCase()}</Text>
        </View>

        {isPending && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleAction(item.id, 'reject')}>
              <Text style={styles.rejectText}>Rechazar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleAction(item.id, 'accept')}>
              <Text style={styles.acceptText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={(item) => item.id}
          renderItem={renderReserva}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No tienes reservas pendientes ni confirmadas.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGrey },
  list: { padding: SPACING.lg },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.card },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  pasajeroName: { fontSize: FONTS.lg, fontWeight: FONTS.bold, color: COLORS.textPrimary },
  ratingBadge: { backgroundColor: 'rgba(245, 166, 35, 0.15)', paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: RADIUS.pill },
  ratingText: { color: COLORS.warning, fontSize: FONTS.xs, fontWeight: FONTS.bold },
  viajeText: { fontSize: FONTS.md, color: COLORS.textSecondary, marginBottom: SPACING.md },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg, paddingBottom: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  statusLabel: { fontSize: FONTS.sm, color: COLORS.textMuted, marginRight: SPACING.sm },
  statusValue: { fontSize: FONTS.sm, fontWeight: FONTS.bold, color: COLORS.warning },
  actionRow: { flexDirection: 'row', gap: SPACING.md },
  actionBtn: { flex: 1, padding: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center', borderWidth: 1.5 },
  rejectBtn: { borderColor: COLORS.danger, backgroundColor: COLORS.surface },
  rejectText: { color: COLORS.danger, fontWeight: FONTS.bold },
  acceptBtn: { borderColor: COLORS.buttonPrimary, backgroundColor: COLORS.buttonPrimary },
  acceptText: { color: COLORS.buttonPrimaryText, fontWeight: FONTS.bold },
  empty: { textAlign: 'center', marginTop: SPACING.section, color: COLORS.textMuted }
});

export default React.memo(DriverReservationsScreen);
