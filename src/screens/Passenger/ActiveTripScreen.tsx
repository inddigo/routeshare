// src/screens/Passenger/ActiveTripScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { noShowService } from '../../services/noShowService';

const ActiveTripScreen = ({ route, navigation }: any) => {
  const { reserva } = route.params;
  const viaje = reserva.viajes;
  
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isNoShow, setIsNoShow] = useState(false);

  useEffect(() => {
    // Timer para No-Show (10 minutos de tolerancia)
    const updateTimer = () => {
      const { isNoShow, remainingMs } = noShowService.checkNoShow(viaje.fecha_hora);
      setTimeRemaining(remainingMs);
      setIsNoShow(isNoShow);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [viaje.fecha_hora]);

  const handleNoShow = async () => {
    Alert.alert(
      'Solicitar Reembolso',
      '¿Estás seguro? Se cancelará el viaje y se reembolsará tu dinero.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, Reembolsar', 
          style: 'destructive',
          onPress: async () => {
            const { success } = await noShowService.processNoShow(reserva.id, viaje.id);
            if (success) {
              Alert.alert('Reembolso exitoso', 'Tu dinero ha sido devuelto por inasistencia del conductor.');
              navigation.goBack();
            } else {
              Alert.alert('Error', 'Hubo un problema procesando el reembolso.');
            }
          }
        }
      ]
    );
  };

  const isCompleted = viaje.estado === 'completado';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estado del Viaje</Text>
      
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Estado actual:</Text>
        <Text style={[styles.statusValue, isCompleted && { color: '#2e7d32' }]}>
          {viaje.estado.toUpperCase()}
        </Text>
      </View>

      {!isCompleted && viaje.estado === 'programado' && (
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Tolerancia de espera:</Text>
          <Text style={[styles.timerValue, isNoShow && { color: '#d32f2f' }]}>
            {noShowService.formatTimeRemaining(timeRemaining)}
          </Text>
          
          {isNoShow ? (
            <View style={styles.noShowContainer}>
              <Text style={styles.warningText}>El conductor no se ha presentado.</Text>
              <TouchableOpacity style={styles.refundButton} onPress={handleNoShow}>
                <Text style={styles.refundText}>Solicitar Reembolso (No-Show)</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.infoText}>Tienes derecho a reembolso si el conductor retrasa más de 10 min.</Text>
          )}
        </View>
      )}

      {isCompleted && (
        <View style={styles.completedCard}>
          <Text style={styles.completedTitle}>¡Viaje Finalizado!</Text>
          <Text style={styles.completedSub}>Tu pago retenido ha sido liberado al conductor.</Text>
          <TouchableOpacity 
            style={styles.rateButton}
            onPress={() => navigation.navigate('RateDriver', { viajeId: viaje.id, conductorId: viaje.conductor_id })}
          >
            <Text style={styles.rateButtonText}>Calificar Conductor</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  statusCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 16, alignItems: 'center', elevation: 2 },
  statusLabel: { fontSize: 16, color: '#666' },
  statusValue: { fontSize: 28, fontWeight: 'bold', color: '#00529b', marginTop: 8 },
  timerCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', elevation: 2 },
  timerLabel: { fontSize: 14, color: '#666' },
  timerValue: { fontSize: 48, fontWeight: 'bold', color: '#333', marginVertical: 10, fontVariant: ['tabular-nums'] },
  infoText: { fontSize: 13, color: '#999', textAlign: 'center', marginTop: 10 },
  noShowContainer: { alignItems: 'center', width: '100%', marginTop: 10 },
  warningText: { color: '#d32f2f', fontWeight: 'bold', marginBottom: 12 },
  refundButton: { backgroundColor: '#ffebee', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  refundText: { color: '#d32f2f', fontWeight: 'bold', fontSize: 16 },
  completedCard: { backgroundColor: '#e8f5e9', borderRadius: 12, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#c8e6c9' },
  completedTitle: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32', marginBottom: 8 },
  completedSub: { fontSize: 14, color: '#2e7d32', textAlign: 'center', marginBottom: 20 },
  rateButton: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  rateButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default React.memo(ActiveTripScreen);
