// src/screens/Driver/ActiveTripDriverScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { driverService } from '../../services/driverService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

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

  if (loading) return <ActivityIndicator size="large" color={COLORS.accent} style={styles.loader} />;

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
  container: { flex: 1, backgroundColor: COLORS.lightGrey, padding: SPACING.lg },
  loader: { flex: 1, justifyContent: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.lg },
  emptyText: { fontSize: FONTS.lg, color: COLORS.textSecondary, textAlign: 'center' },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl, ...SHADOWS.card },
  headerTitle: { fontSize: FONTS.xxl, fontWeight: FONTS.heavy, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  statusText: { fontSize: FONTS.md, color: COLORS.warning, fontWeight: FONTS.bold, marginBottom: SPACING.lg },
  divider: { height: 1, backgroundColor: COLORS.divider, marginBottom: SPACING.lg },
  infoLabel: { fontSize: FONTS.sm, color: COLORS.textMuted, marginBottom: SPACING.xs },
  infoValue: { fontSize: FONTS.lg, fontWeight: FONTS.bold, color: COLORS.textPrimary, marginBottom: SPACING.lg },
  actionsContainer: { marginTop: SPACING.xxxl },
  btn: { padding: SPACING.lg, borderRadius: RADIUS.md, alignItems: 'center' },
  startBtn: { backgroundColor: COLORS.buttonPrimary },
  finishBtn: { backgroundColor: COLORS.danger },
  btnText: { color: COLORS.textWhite, fontSize: FONTS.lg, fontWeight: FONTS.bold },
  infoBox: { marginTop: SPACING.xxxl, backgroundColor: COLORS.statusBadgeGreen, padding: SPACING.lg, borderRadius: RADIUS.md },
  infoText: { color: COLORS.accentDark, textAlign: 'center', lineHeight: 20 }
});

export default React.memo(ActiveTripDriverScreen);
