// src/screens/Passenger/ActiveTripScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { noShowService } from '../../services/noShowService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

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
        <Text style={[styles.statusValue, isCompleted && { color: COLORS.successGreen }]}>
          {viaje.estado.toUpperCase()}
        </Text>
      </View>

      {!isCompleted && viaje.estado === 'programado' && (
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Tolerancia de espera:</Text>
          <Text style={[styles.timerValue, isNoShow && { color: COLORS.danger }]}>
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
  container: { flex: 1, backgroundColor: COLORS.lightGrey, padding: SPACING.lg },
  title: { fontSize: FONTS.hero, fontWeight: FONTS.heavy, color: COLORS.textPrimary, marginBottom: SPACING.xl },
  statusCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl, marginBottom: SPACING.lg, alignItems: 'center', ...SHADOWS.card },
  statusLabel: { fontSize: FONTS.lg, color: COLORS.textSecondary },
  statusValue: { fontSize: 28, fontWeight: FONTS.heavy, color: COLORS.textPrimary, marginTop: SPACING.sm },
  timerCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center', ...SHADOWS.card },
  timerLabel: { fontSize: FONTS.md, color: COLORS.textSecondary },
  timerValue: { fontSize: 48, fontWeight: FONTS.heavy, color: COLORS.textPrimary, marginVertical: SPACING.md, fontVariant: ['tabular-nums'] },
  infoText: { fontSize: FONTS.sm, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.md },
  noShowContainer: { alignItems: 'center', width: '100%', marginTop: SPACING.md },
  warningText: { color: COLORS.danger, fontWeight: FONTS.bold, marginBottom: SPACING.md },
  refundButton: { backgroundColor: '#FDECEA', padding: SPACING.lg, borderRadius: RADIUS.md, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#F5C6C2' },
  refundText: { color: COLORS.danger, fontWeight: FONTS.bold, fontSize: FONTS.lg },
  completedCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xxl, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.card },
  completedTitle: { fontSize: FONTS.xxl, fontWeight: FONTS.heavy, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  completedSub: { fontSize: FONTS.md, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl },
  rateButton: { backgroundColor: COLORS.buttonPrimary, padding: SPACING.lg, borderRadius: RADIUS.md, width: '100%', alignItems: 'center' },
  rateButtonText: { color: COLORS.buttonPrimaryText, fontWeight: FONTS.bold, fontSize: FONTS.lg }
});

export default React.memo(ActiveTripScreen);
