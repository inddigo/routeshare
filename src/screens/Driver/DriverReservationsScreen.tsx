// src/screens/Driver/DriverReservationsScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { driverService } from '../../services/driverService';

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
          <Text style={[styles.statusValue, !isPending && { color: '#2e7d32' }]}>{item.estado.toUpperCase()}</Text>
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
        <ActivityIndicator size="large" color="#00529b" style={{marginTop: 20}} />
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pasajeroName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  ratingBadge: { backgroundColor: '#fff3e0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  ratingText: { color: '#f57c00', fontSize: 12, fontWeight: 'bold' },
  viajeText: { fontSize: 14, color: '#666', marginBottom: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  statusLabel: { fontSize: 13, color: '#999', marginRight: 8 },
  statusValue: { fontSize: 13, fontWeight: 'bold', color: '#f57c00' },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  rejectBtn: { borderColor: '#d32f2f', backgroundColor: '#fff' },
  rejectText: { color: '#d32f2f', fontWeight: 'bold' },
  acceptBtn: { borderColor: '#2e7d32', backgroundColor: '#2e7d32' },
  acceptText: { color: '#fff', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' }
});

export default React.memo(DriverReservationsScreen);
