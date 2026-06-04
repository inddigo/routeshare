// src/screens/Driver/RatePassengerScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const RatePassengerScreen = ({ route, navigation }: any) => {
  const { viajeId } = route.params;
  const [pasajeros, setPasajeros] = useState<any[]>([]);
  const [ratings, setRatings] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPasajeros = async () => {
      const { data, error } = await supabase
        .from('reservas')
        .select('*, usuarios!reservas_pasajero_id_fkey(id, nombre, apellido_paterno)')
        .eq('viaje_id', viajeId)
        .eq('estado', 'confirmada');

      if (!error && data) {
        setPasajeros(data);
        // Inicializar ratings en 5
        const initRates: any = {};
        data.forEach(r => initRates[r.usuarios.id] = 5);
        setRatings(initRates);
      }
      setLoading(false);
    };
    loadPasajeros();
  }, [viajeId]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const inserts = pasajeros.map(p => ({
        viaje_id: viajeId,
        evaluador_id: user.id,
        evaluado_id: p.usuarios.id,
        puntaje: ratings[p.usuarios.id],
      }));

      if (inserts.length > 0) {
        // Podría fallar si ya calificó, usamos upsert on conflict para evitar crasheos, 
        // pero Calificaciones tiene UNIQUE(viaje, evaluador, evaluado)
        const { error } = await supabase.from('calificaciones').insert(inserts);
        if (error && error.code !== '23505') throw error;
      }

      Alert.alert('Completado', 'Has calificado a todos los pasajeros.', [
        { text: 'Aceptar', onPress: () => navigation.navigate('MainTabs') }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const p = item.usuarios;
    const currentRating = ratings[p.id];

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{p.nombre} {p.apellido_paterno}</Text>
        <View style={styles.starsRow}>
          {[1,2,3,4,5].map(star => (
            <TouchableOpacity key={star} onPress={() => setRatings({...ratings, [p.id]: star})}>
              <Text style={[styles.star, star <= currentRating && styles.starFilled]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) return <ActivityIndicator size="large" color={COLORS.accent} style={{marginTop: 40}} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Califica a tus pasajeros</Text>
      <Text style={styles.subtitle}>Esto ayuda a mantener la comunidad segura.</Text>

      <FlatList
        data={pasajeros}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hubo pasajeros confirmados en este viaje.</Text>}
      />

      <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
        <Text style={styles.btnText}>Guardar Calificaciones</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGrey, padding: SPACING.lg },
  title: { fontSize: FONTS.xxl, fontWeight: FONTS.heavy, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONTS.md, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  list: { paddingBottom: SPACING.xl },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.card },
  name: { fontSize: FONTS.lg, fontWeight: FONTS.bold, color: COLORS.textPrimary, marginBottom: SPACING.md },
  starsRow: { flexDirection: 'row' },
  star: { fontSize: 32, color: COLORS.border, marginRight: SPACING.sm },
  starFilled: { color: COLORS.warning },
  btn: { backgroundColor: COLORS.buttonPrimary, padding: SPACING.lg, borderRadius: RADIUS.md, alignItems: 'center', marginTop: 'auto' },
  btnText: { color: COLORS.buttonPrimaryText, fontWeight: FONTS.bold, fontSize: FONTS.lg },
  empty: { textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.section }
});

export default React.memo(RatePassengerScreen);
