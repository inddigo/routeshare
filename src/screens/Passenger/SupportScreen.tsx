// src/screens/Passenger/SupportScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';

const SupportScreen = () => {
  const [tipo, setTipo] = useState<'incidente' | 'no_show' | 'queja' | 'otro'>('incidente');
  const [descripcion, setDescripcion] = useState('');
  const [reportes, setReportes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchReportes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('reportes')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setReportes(data);
    setFetching(false);
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  const handleSubmit = async () => {
    if (!descripcion.trim()) {
      Alert.alert('Error', 'Debes ingresar una descripción.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { error } = await supabase.from('reportes').insert([{
        usuario_id: user.id,
        tipo,
        descripcion: descripcion.trim(),
        estado: 'pendiente'
      }]);

      if (error) throw error;

      Alert.alert('Éxito', 'Reporte enviado. Un administrador lo revisará pronto.');
      setDescripcion('');
      fetchReportes();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.tipoText}>{item.tipo.replace('_', ' ').toUpperCase()}</Text>
        <View style={[styles.badge, item.estado === 'resuelto' ? styles.badgeResuelto : styles.badgePendiente]}>
          <Text style={styles.badgeText}>{item.estado}</Text>
        </View>
      </View>
      <Text style={styles.descText}>{item.descripcion}</Text>
      {item.respuesta_admin && (
        <View style={styles.respuestaBox}>
          <Text style={styles.respuestaLabel}>Respuesta Admin:</Text>
          <Text style={styles.respuestaText}>{item.respuesta_admin}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Crear Nuevo Reporte</Text>
        
        <View style={styles.tipoContainer}>
          {['incidente', 'no_show', 'queja', 'otro'].map((t) => (
            <TouchableOpacity 
              key={t} 
              style={[styles.tipoBtn, tipo === t && styles.tipoBtnActive]}
              onPress={() => setTipo(t as any)}
            >
              <Text style={[styles.tipoBtnText, tipo === t && styles.tipoBtnTextActive]}>
                {t.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Describe la situación en detalle..."
          multiline numberOfLines={3}
          value={descripcion} onChangeText={setDescripcion}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Enviar Reporte</Text>}
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { marginHorizontal: 16, marginTop: 24 }]}>Mis Reportes</Text>
      {fetching ? (
        <ActivityIndicator size="large" color="#00529b" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={reportes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No tienes reportes enviados.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  formSection: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  tipoContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tipoBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#e0e0e0' },
  tipoBtnActive: { backgroundColor: '#e6f0fa', borderColor: '#00529b' },
  tipoBtnText: { fontSize: 12, color: '#666', textTransform: 'capitalize' },
  tipoBtnTextActive: { color: '#00529b', fontWeight: 'bold' },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, height: 80, textAlignVertical: 'top', marginBottom: 16 },
  submitBtn: { backgroundColor: '#d32f2f', padding: 14, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e0e0e0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  tipoText: { fontSize: 12, fontWeight: 'bold', color: '#666' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgePendiente: { backgroundColor: '#fff3e0' },
  badgeResuelto: { backgroundColor: '#e8f5e9' },
  badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  descText: { fontSize: 14, color: '#333', lineHeight: 20 },
  respuestaBox: { marginTop: 12, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6, borderLeftWidth: 3, borderLeftColor: '#00529b' },
  respuestaLabel: { fontSize: 11, fontWeight: 'bold', color: '#00529b', marginBottom: 4 },
  respuestaText: { fontSize: 13, color: '#444' },
  empty: { textAlign: 'center', marginTop: 20, color: '#999' }
});

export default React.memo(SupportScreen);
