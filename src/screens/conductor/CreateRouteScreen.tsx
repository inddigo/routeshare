// src/screens/conductor/CreateRouteScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { PUCV_GEOFENCES } from '../../constants/geofences';
import { COMMON_DESTINATIONS } from '../../services/searchService';

// Fallback lat/lng for destinations
const DESTINATION_COORDS: {[key: string]: {lat: number, lng: number}} = {
  'Viña Centro': { lat: -33.0245, lng: -71.5518 },
  'Valparaíso Centro': { lat: -33.0456, lng: -71.6200 },
  'Quilpué': { lat: -33.0498, lng: -71.4420 },
  'Reñaca': { lat: -32.9739, lng: -71.5458 },
  'Casa Central PUCV': { lat: -33.0445, lng: -71.6068 },
  'Campus Curauma': { lat: -33.1234, lng: -71.5765 },
  'Facultad de Ingeniería': { lat: -33.0440, lng: -71.6080 },
};

const CreateRouteScreen = ({ navigation }: any) => {
  const [origenSel, setOrigenSel] = useState<string>('');
  const [destinoSel, setDestinoSel] = useState<string>('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [asientos, setAsientos] = useState('4');
  const [tarifa, setTarifa] = useState('1500');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!origenSel || !destinoSel || !fecha || !hora || !asientos) {
      Alert.alert('Error', 'Completa todos los campos obligatorios.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { data: cond } = await supabase.from('conductores').select('id, estado_aprobacion').eq('usuario_id', user.id).single();
      if (!cond) throw new Error('Debes registrarte como conductor primero.');
      if (cond.estado_aprobacion !== 'aprobado') throw new Error('Tu perfil de conductor aún no ha sido aprobado.');

      // Obtener coordenadas
      const origenCoords = PUCV_GEOFENCES.find(g => g.name === origenSel) || DESTINATION_COORDS[origenSel];
      const destinoCoords = DESTINATION_COORDS[destinoSel];

      if (!origenCoords || !destinoCoords) throw new Error('Error al obtener coordenadas de las zonas.');

      // Combinar fecha y hora
      // Esperamos formato YYYY-MM-DD y HH:MM
      const fechaHoraStr = `${fecha}T${hora}:00-04:00`; // Asumimos zona horaria Chile Continental

      // 1. Crear ruta
      const origenLat = 'latitude' in origenCoords ? origenCoords.latitude : origenCoords.lat;
      const origenLng = 'longitude' in origenCoords ? origenCoords.longitude : origenCoords.lng;

      const { data: ruta, error: rutaErr } = await supabase.from('rutas').insert([{
        conductor_id: user.id,
        origen_lat: origenLat,
        origen_lng: origenLng,
        destino_lat: destinoCoords.lat,
        destino_lng: destinoCoords.lng,
        es_sede_pucv: true
      }]).select().single();

      if (rutaErr) throw rutaErr;

      // 2. Crear Viaje
      const { error: viajeErr } = await supabase.from('viajes').insert([{
        ruta_id: ruta.id,
        conductor_id: cond.id,
        estado: 'programado',
        asientos_disponibles: parseInt(asientos),
        fecha_hora: fechaHoraStr
      }]);

      if (viajeErr) throw viajeErr;

      Alert.alert('Éxito', 'Ruta y Viaje publicados correctamente.', [
        { text: 'Ir al Panel', onPress: () => navigation.navigate('MainTabs') }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [origenSel, destinoSel, fecha, hora, asientos, tarifa, navigation]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Publicar un Viaje</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Origen (Sedes PUCV)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {PUCV_GEOFENCES.map(g => (
            <TouchableOpacity 
              key={g.id} 
              style={[styles.chip, origenSel === g.name && styles.chipActive]}
              onPress={() => setOrigenSel(g.name)}
            >
              <Text style={[styles.chipText, origenSel === g.name && styles.chipTextActive]}>{g.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Destino Común</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {COMMON_DESTINATIONS.map(d => (
            <TouchableOpacity 
              key={d} 
              style={[styles.chip, destinoSel === d && styles.chipActive]}
              onPress={() => setDestinoSel(d)}
            >
              <Text style={[styles.chipText, destinoSel === d && styles.chipTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Fecha (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} placeholder="Ej: 2026-06-01" value={fecha} onChangeText={setFecha} />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Hora (HH:MM)</Text>
          <TextInput style={styles.input} placeholder="Ej: 14:30" value={hora} onChangeText={setHora} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Cupos Disponibles</Text>
          <TextInput style={styles.input} placeholder="4" keyboardType="numeric" value={asientos} onChangeText={setAsientos} />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Tarifa ($)</Text>
          <TextInput style={styles.input} value={tarifa} editable={false} />
          <Text style={styles.helper}>Tarifa fija regulada</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Publicar Viaje</Text>}
      </TouchableOpacity>
      
      <View style={{height: 40}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#00529b', marginBottom: 24 },
  section: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  chipScroll: { flexDirection: 'row' },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  chipActive: { backgroundColor: '#e6f0fa', borderColor: '#00529b' },
  chipText: { fontSize: 14, color: '#666' },
  chipTextActive: { color: '#00529b', fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  half: { width: '48%' },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12 },
  helper: { fontSize: 11, color: '#999', marginTop: 4 },
  submitBtn: { backgroundColor: '#00529b', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default React.memo(CreateRouteScreen);
