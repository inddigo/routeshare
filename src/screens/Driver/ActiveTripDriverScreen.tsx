// src/screens/Driver/ActiveTripDriverScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { driverService } from '../../services/driverService';

const ActiveTripDriverScreen = ({ navigation }: any) => {
  const [viaje, setViaje] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const loadActiveTrip = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: cond } = await supabase.from('conductores').select('id').eq('usuario_id', user.id).single();
    if (!cond) return;

    // Buscar el viaje activo o el próximo programado
    const { data, error } = await supabase
      .from('viajes')
      .select('*, rutas(*)')
      .eq('conductor_id', cond.id)
      .in('estado', ['programado', 'activo'])
      .order('fecha_hora', { ascending: true })
      .limit(1)
      .single();

    if (!error && data) setViaje(data);
    setLoading(false);
  };

  useEffect(() => {
    loadActiveTrip();
  }, []);

  const handleStart = async () => {
    setProcessing(true);
    const { success } = await driverService.startTrip(viaje.id);
    if (success) {
      setViaje({...viaje, estado: 'activo'});
      Alert.alert('Viaje Iniciado', 'Conduce con cuidado.');
    }
    setProcessing(false);
  };

  const handleFinish = () => {
    Alert.alert(
      'Finalizar Viaje',
      '¿Llegaste al destino? Al finalizar, se liberarán los pagos (Escrow) de los pasajeros.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, Finalizar', 
          onPress: async () => {
            setProcessing(true);
            const { success } = await driverService.finishTrip(viaje.id);
            if (success) {
              Alert.alert('Viaje Completado', 'Fondos liberados exitosamente.');
              navigation.navigate('RatePassenger', { viajeId: viaje.id });
            }
            setProcessing(false);
          }
        }
      ]
    );
  };

  if (loading) return <ActivityIndicator size="large" color="#00529b" style={styles.loader} />;

  if (!viaje) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🚗</Text>
        <Text style={styles.emptyText}>No tienes viajes programados ni activos.</Text>
      </View>
    );
  }

  const isActivo = viaje.estado === 'activo';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.headerTitle}>Mi Viaje Actual</Text>
        <Text style={styles.statusText}>Estado: {viaje.estado.toUpperCase()}</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.infoLabel}>Destino:</Text>
        <Text style={styles.infoValue}>{viaje.rutas.destino_lat.toFixed(4)}, {viaje.rutas.destino_lng.toFixed(4)}</Text>
        
        <Text style={styles.infoLabel}>Asientos Libres:</Text>
        <Text style={styles.infoValue}>{viaje.asientos_disponibles}</Text>
      </View>

      <View style={styles.actionsContainer}>
        {!isActivo ? (
          <TouchableOpacity style={[styles.btn, styles.startBtn]} onPress={handleStart} disabled={processing}>
            <Text style={styles.btnText}>Iniciar Viaje Ahora</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.btn, styles.finishBtn]} onPress={handleFinish} disabled={processing}>
            <Text style={styles.btnText}>Finalizar Viaje (Liberar Pagos)</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          {isActivo 
            ? 'Los pasajeros pueden ver que estás en camino. Cuando llegues, finaliza el viaje para recibir tu dinero.'
            : 'Inicia el viaje cuando arranques el vehículo. Los pasajeros serán notificados.'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  loader: { flex: 1, justifyContent: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#00529b', marginBottom: 4 },
  statusText: { fontSize: 14, color: '#f57c00', fontWeight: 'bold', marginBottom: 16 },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginBottom: 16 },
  infoLabel: { fontSize: 13, color: '#999', marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  actionsContainer: { marginTop: 30 },
  btn: { padding: 18, borderRadius: 12, alignItems: 'center' },
  startBtn: { backgroundColor: '#00529b' },
  finishBtn: { backgroundColor: '#d32f2f' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  infoBox: { marginTop: 30, backgroundColor: '#e8f4fd', padding: 16, borderRadius: 8 },
  infoText: { color: '#00529b', textAlign: 'center', lineHeight: 20 }
});

export default React.memo(ActiveTripDriverScreen);
