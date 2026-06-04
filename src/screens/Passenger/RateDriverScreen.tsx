// src/screens/Passenger/RateDriverScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';

const RateDriverScreen = ({ route, navigation }: any) => {
  const { viajeId, conductorId } = route.params;
  const [rating, setRating] = useState(5);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase.from('calificaciones').insert([{
        viaje_id: viajeId,
        evaluador_id: user.id,
        evaluado_id: conductorId,
        puntaje: rating,
        comentario: comentario.trim() || null
      }]);

      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new Error('Ya calificaste a este conductor en este viaje.');
        }
        throw error;
      }

      Alert.alert('Gracias', 'Tu calificación ayuda a mantener la comunidad segura.', [
        { text: 'Aceptar', onPress: () => navigation.popToTop() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo guardar la calificación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Cómo fue tu viaje?</Text>
      <Text style={styles.subtitle}>Califica al conductor para mantener la reputación bidireccional.</Text>

      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text style={[styles.star, star <= rating && styles.starFilled]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Opcional: Deja un comentario sobre el viaje..."
        multiline
        numberOfLines={4}
        value={comentario}
        onChangeText={setComentario}
      />

      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.disabledBtn]} 
        onPress={handleSubmit} 
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Enviar Calificación</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 40, marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 40 },
  starsContainer: { flexDirection: 'row', marginBottom: 40 },
  star: { fontSize: 50, color: '#e0e0e0', marginHorizontal: 4 },
  starFilled: { color: '#f5a623' },
  input: {
    backgroundColor: '#f5f5f5', width: '100%', borderRadius: 12, padding: 16,
    height: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 40
  },
  submitButton: { backgroundColor: '#00529b', width: '100%', padding: 16, borderRadius: 12, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#90caf9' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default React.memo(RateDriverScreen);
