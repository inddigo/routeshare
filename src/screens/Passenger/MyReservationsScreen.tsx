// src/screens/Passenger/MyReservationsScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { reservationService } from '../../services/reservationService';

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
      case 'confirmada': return '#e8f5e9';
      case 'pendiente': return '#fff3e0';
      case 'cancelada': case 'rechazada': return '#ffebee';
      default: return '#f5f5f5';
    }
  };

  const getStatusTextColor = (estado: string) => {
    switch (estado) {
      case 'confirmada': return '#2e7d32';
      case 'pendiente': return '#f57c00';
      case 'cancelada': case 'rechazada': return '#d32f2f';
      default: return '#666';
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
    return <ActivityIndicator size="large" color="#00529b" style={styles.loader} />;
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loader: { flex: 1, justifyContent: 'center' },
  listContainer: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  fecha: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  conductor: { fontSize: 14, color: '#666', marginBottom: 4 },
  ruta: { fontSize: 14, color: '#666' },
  pinContainer: { backgroundColor: '#e6f0fa', borderRadius: 8, padding: 12, marginTop: 12, alignItems: 'center' },
  pinLabel: { fontSize: 12, color: '#00529b', marginBottom: 4 },
  pinCode: { fontSize: 24, fontWeight: 'bold', color: '#00529b', letterSpacing: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
  pagoStatus: { fontSize: 13, color: '#999', textTransform: 'capitalize' },
  actionText: { fontSize: 13, color: '#00529b', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#999' }
});

export default React.memo(MyReservationsScreen);
