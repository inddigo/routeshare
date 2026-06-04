// src/screens/Driver/PinValidationScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { driverService } from '../../services/driverService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const PinValidationScreen = () => {
  const [pasajeros, setPasajeros] = useState<any[]>([]);
  const [pins, setPins] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: cond } = await supabase.from('conductores').select('id').eq('usuario_id', user.id).single();
    if (!cond) return;

    // Obtener reservas confirmadas de viajes programados o activos
    const { success, data } = await driverService.getDriverReservations(cond.id);
    if (success && data) {
      const confirmados = data.filter((r: any) => 
        r.estado === 'confirmada' && (r.viajes.estado === 'programado' || r.viajes.estado === 'activo')
      );
      setPasajeros(confirmados);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleValidate = async (reserva: any) => {
    const pin = pins[reserva.id];
    if (!pin || pin.length !== 3) {
      Alert.alert('Error', 'El PIN debe tener 3 dígitos.');
      return;
    }

    const { success, isValid } = await driverService.validatePin(reserva.id, pin);
    if (success && isValid) {
      Alert.alert('¡Validado!', `El pasajero ${reserva.usuarios.nombre} ha abordado.`);
      // Opcional: Podríamos actualizar el estado de la reserva a "abordado" en la BD
      // Por ahora limpiamos el input para indicar éxito visual
      setPins({...pins, [reserva.id]: 'OK'});
    } else {
      Alert.alert('PIN Incorrecto', 'El PIN ingresado no coincide con el del pasajero.');
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isOk = pins[item.id] === 'OK';

    return (
      <View style={styles.card}>
        <View style={styles.infoCol}>
          <Text style={styles.name}>{item.usuarios.nombre} {item.usuarios.apellido_paterno}</Text>
          <Text style={styles.viaje}>Destino: {item.viajes.rutas.destino_lat.toFixed(3)}...</Text>
        </View>
        
        {isOk ? (
          <View style={styles.okBadge}>
            <Text style={styles.okText}>✓ A BORDO</Text>
          </View>
        ) : (
          <View style={styles.inputCol}>
            <TextInput
              style={styles.pinInput}
              placeholder="PIN"
              keyboardType="numeric"
              maxLength={3}
              value={pins[item.id] || ''}
              onChangeText={(txt) => setPins({...pins, [item.id]: txt})}
            />
            <TouchableOpacity style={styles.validateBtn} onPress={() => handleValidate(item)}>
              <Text style={styles.validateText}>Validar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Solicita el PIN de 3 dígitos a tus pasajeros cuando aborden el vehículo.</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} />
      ) : (
        <FlatList
          data={pasajeros}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No hay pasajeros confirmados por abordar.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGrey, padding: SPACING.lg },
  instruction: { fontSize: FONTS.md, color: COLORS.textSecondary, marginBottom: SPACING.xl, textAlign: 'center', paddingHorizontal: SPACING.xl },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...SHADOWS.card },
  infoCol: { flex: 1 },
  name: { fontSize: FONTS.lg, fontWeight: FONTS.bold, color: COLORS.textPrimary },
  viaje: { fontSize: FONTS.xs, color: COLORS.textMuted, marginTop: SPACING.xs },
  inputCol: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  pinInput: { backgroundColor: COLORS.inputBackground, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, width: 60, textAlign: 'center', fontSize: FONTS.lg, fontWeight: FONTS.bold, letterSpacing: 2, borderWidth: 1.5, borderColor: COLORS.border },
  validateBtn: { backgroundColor: COLORS.buttonPrimary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.sm },
  validateText: { color: COLORS.buttonPrimaryText, fontWeight: FONTS.bold },
  okBadge: { backgroundColor: COLORS.statusBadgeGreen, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.sm },
  okText: { color: COLORS.statusTextGreen, fontWeight: FONTS.bold },
  empty: { textAlign: 'center', marginTop: SPACING.section, color: COLORS.textMuted }
});

export default React.memo(PinValidationScreen);
