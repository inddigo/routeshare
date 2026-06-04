// src/screens/Driver/PinValidationScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { driverService } from '../../services/driverService';

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
        <ActivityIndicator size="large" color="#00529b" />
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
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  instruction: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center', paddingHorizontal: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1 },
  infoCol: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  viaje: { fontSize: 12, color: '#999', marginTop: 4 },
  inputCol: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pinInput: { backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, width: 60, textAlign: 'center', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 },
  validateBtn: { backgroundColor: '#00529b', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  validateText: { color: '#fff', fontWeight: 'bold' },
  okBadge: { backgroundColor: '#e8f5e9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#c8e6c9' },
  okText: { color: '#2e7d32', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' }
});

export default React.memo(PinValidationScreen);
