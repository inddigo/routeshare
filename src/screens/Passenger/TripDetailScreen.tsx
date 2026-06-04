// src/screens/Passenger/TripDetailScreen.tsx
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const TripDetailScreen = ({ route, navigation }: any) => {
  const { viaje } = route.params;
  const conductor = viaje.usuarios;
  const rut = viaje.rutas;
  
  const fechaFormat = new Date(viaje.fecha_hora).toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const handleReservar = useCallback(() => {
    navigation.navigate('Payment', { viaje, monto: 1500 });
  }, [navigation, viaje]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.fecha}>{fechaFormat}</Text>
        <View style={styles.routeContainer}>
          <View style={styles.dot} />
          <Text style={styles.routeText}>Origen: {rut.origen_lat.toFixed(4)}, {rut.origen_lng.toFixed(4)}</Text>
          <View style={styles.line} />
          <View style={[styles.dot, styles.dotDest]} />
          <Text style={styles.routeText}>Destino: {rut.destino_lat.toFixed(4)}, {rut.destino_lng.toFixed(4)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Información del Conductor</Text>
      <View style={styles.infoCard}>
        <View style={styles.driverHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{conductor.nombre.charAt(0)}</Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{conductor.nombre} {conductor.apellido_paterno}</Text>
            <Text style={styles.rating}>★ {conductor.reputacion_promedio.toFixed(1)} de Reputación</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Detalles del Viaje</Text>
      <View style={styles.infoCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Asientos Disponibles:</Text>
          <Text style={styles.detailValue}>{viaje.asientos_disponibles}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tarifa Regulada:</Text>
          <Text style={styles.price}>$1.500</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Pago Seguro:</Text>
          <Text style={styles.escrowTag}>✓ Sistema Escrow</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.reserveButton} onPress={handleReservar}>
        <Text style={styles.reserveButtonText}>Reservar Asiento</Text>
      </TouchableOpacity>
      
      <View style={styles.padding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  headerCard: { backgroundColor: '#00529b', borderRadius: 12, padding: 20, marginBottom: 20 },
  fecha: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 16, textTransform: 'capitalize' },
  routeContainer: { paddingLeft: 8 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff', position: 'absolute', left: -6, top: 4 },
  dotDest: { backgroundColor: '#f5a623', top: '100%', marginTop: -12 },
  line: { width: 2, height: 30, backgroundColor: 'rgba(255,255,255,0.5)', marginLeft: -1, marginVertical: 4 },
  routeText: { color: '#fff', fontSize: 15, marginLeft: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8, marginLeft: 4 },
  infoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, elevation: 1 },
  driverHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#666' },
  driverInfo: { marginLeft: 16 },
  driverName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  rating: { fontSize: 14, color: '#f57c00', fontWeight: '600', marginTop: 4 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  detailLabel: { fontSize: 15, color: '#666' },
  detailValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32' },
  escrowTag: { fontSize: 14, color: '#00529b', fontWeight: '600' },
  reserveButton: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  reserveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  padding: { height: 40 }
});

export default React.memo(TripDetailScreen);
