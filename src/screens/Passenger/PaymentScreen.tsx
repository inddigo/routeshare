// src/screens/Passenger/PaymentScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { reservationService } from '../../services/reservationService';

const PaymentScreen = ({ route, navigation }: any) => {
  const { viaje, monto } = route.params;
  const [loading, setLoading] = useState(false);

  const comision = monto * 0.07;
  const total = monto; // El pasajero paga el monto total, la comisión se descuenta al conductor

  const handlePayment = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Llamar al servicio que crea la reserva, retiene pago en Escrow y genera PIN
      const { success, data, error } = await reservationService.createReservation(viaje.id, user.id, monto);

      if (!success) {
        Alert.alert('Error', error || 'No se pudo procesar el pago.');
        setLoading(false);
        return;
      }

      // Éxito
      Alert.alert(
        '¡Pago Exitoso!',
        `Tu reserva ha sido confirmada.\n\nTu PIN de abordaje es: ${data.pin}\n\nEl dinero está seguro en custodia (Escrow) hasta que confirmes la llegada.`,
        [{ text: 'Ver mis reservas', onPress: () => navigation.navigate('MyReservations') }]
      );
    } catch (err: any) {
      Alert.alert('Error', 'Hubo un problema de conexión.');
      setLoading(false);
    }
  }, [viaje.id, monto, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmar Pago y Reserva</Text>
      <Text style={styles.subtitle}>El pago se retendrá de forma segura (Sistema Escrow).</Text>

      <View style={styles.receiptCard}>
        <View style={styles.row}>
          <Text style={styles.label}>Tarifa de Viaje</Text>
          <Text style={styles.value}>${monto}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Comisión (pagada por conductor)</Text>
          <Text style={styles.valueWarning}>-${Math.round(comision)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total a Pagar</Text>
          <Text style={styles.totalValue}>${total}</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>🛡️</Text>
        <Text style={styles.infoText}>
          Tu dinero solo será liberado al conductor cuando confirmes tu llegada al destino. 
          Si el conductor no llega (No-Show), se te reembolsará el 100% automáticamente.
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.payButton, loading && styles.payButtonDisabled]} 
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payButtonText}>Confirmar y Pagar ${total}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  receiptCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 2, marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label: { fontSize: 15, color: '#666' },
  value: { fontSize: 15, fontWeight: '600', color: '#333' },
  valueWarning: { fontSize: 15, fontWeight: '600', color: '#f57c00' },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 12 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: '#00529b' },
  infoBox: { flexDirection: 'row', backgroundColor: '#e8f4fd', padding: 16, borderRadius: 12, marginBottom: 30 },
  infoIcon: { fontSize: 24, marginRight: 12 },
  infoText: { flex: 1, fontSize: 13, color: '#00529b', lineHeight: 20 },
  payButton: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 12, alignItems: 'center' },
  payButtonDisabled: { backgroundColor: '#a5d6a7' },
  payButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default React.memo(PaymentScreen);
