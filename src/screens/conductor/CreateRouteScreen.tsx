// src/screens/conductor/CreateRouteScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { supabase } from '../../services/supabase';
import { createRouteAndTrip } from '../../services/tripsService';
import { PUCV_GEOFENCES, isInsidePUCVZone } from '../../constants/geofences';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateRoute'>;

// Opciones de destino comunes (Mock para evitar mapas pesados y geocoding externo)
const COMMON_DESTINATIONS = [
  { id: 'vina-centro', name: 'Viña del Mar (Centro)', lat: -33.0245, lng: -71.5518 },
  { id: 'valpo-centro', name: 'Valparaíso (Centro)', lat: -33.0456, lng: -71.6200 },
  { id: 'quilpue', name: 'Quilpué (Centro)', lat: -33.0498, lng: -71.4420 },
  { id: 'reñaca', name: 'Reñaca', lat: -32.9739, lng: -71.5458 },
];

const CreateRouteScreen = ({ navigation }: Props) => {
  const [selectedOriginId, setSelectedOriginId] = useState<string>('');
  const [selectedDestId, setSelectedDestId] = useState<string>('');
  const [seats, setSeats] = useState<string>('3');
  // Usamos un string simple para la hora para evitar DatePickers pesados
  const [time, setTime] = useState<string>('14:30'); 
  const [loading, setLoading] = useState(false);

  const handleCreateTrip = useCallback(async () => {
    if (!selectedOriginId || !selectedDestId || !seats || !time) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    const origin = PUCV_GEOFENCES.find(g => g.id === selectedOriginId);
    const destination = COMMON_DESTINATIONS.find(d => d.id === selectedDestId);

    if (!origin || !destination) return;

    // Validación geográfica local (el origen es Sede PUCV)
    const isValidZone = isInsidePUCVZone(origin.latitude, origin.longitude);
    if (!isValidZone) {
      Alert.alert('Zona Inválida', 'El origen debe coincidir con una Sede PUCV.');
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No hay sesión activa');

      // Calcular fecha/hora (hoy a la hora indicada)
      const now = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      now.setHours(hours, minutes, 0, 0);

      const result = await createRouteAndTrip(
        user.id,
        origin.latitude,
        origin.longitude,
        destination.lat,
        destination.lng,
        true, // es_sede_pucv = true porque forzamos que el origen sea sede
        parseInt(seats, 10),
        now.toISOString()
      );

      if (result.success) {
        Alert.alert('Éxito', 'Viaje publicado correctamente');
        navigation.navigate('Home'); // Volvemos al Home
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      Alert.alert('Error publicando viaje', error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedOriginId, selectedDestId, seats, time, navigation]);

  // Optimizamos el renderizado de la lista
  const renderOriginItem = useCallback(({ item }: any) => (
    <TouchableOpacity 
      style={[styles.listItem, selectedOriginId === item.id && styles.listItemSelected]}
      onPress={() => setSelectedOriginId(item.id)}
    >
      <Text style={[styles.listText, selectedOriginId === item.id && styles.listTextSelected]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  ), [selectedOriginId]);

  const renderDestItem = useCallback(({ item }: any) => (
    <TouchableOpacity 
      style={[styles.listItem, selectedDestId === item.id && styles.listItemSelected]}
      onPress={() => setSelectedDestId(item.id)}
    >
      <Text style={[styles.listText, selectedDestId === item.id && styles.listTextSelected]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  ), [selectedDestId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Publicar Viaje</Text>

      <Text style={styles.sectionTitle}>1. Origen (Sede PUCV)</Text>
      <View style={styles.listContainer}>
        <FlatList
          data={PUCV_GEOFENCES}
          keyExtractor={item => item.id}
          renderItem={renderOriginItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          initialNumToRender={3}
        />
      </View>

      <Text style={styles.sectionTitle}>2. Destino</Text>
      <View style={styles.listContainer}>
        <FlatList
          data={COMMON_DESTINATIONS}
          keyExtractor={item => item.id}
          renderItem={renderDestItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          initialNumToRender={4}
        />
      </View>

      <Text style={styles.sectionTitle}>3. Detalles del Viaje</Text>
      <View style={styles.row}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Cupos</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={seats}
            onChangeText={setSeats}
            maxLength={1}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Hora (HH:MM)</Text>
          <TextInput
            style={styles.input}
            value={time}
            onChangeText={setTime}
            maxLength={5}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleCreateTrip}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Publicar Ruta</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Uso estricto de StyleSheet para evitar consumo excesivo de CPU en re-renders
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00529b',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  listContainer: {
    height: 50,
  },
  listItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
    justifyContent: 'center',
  },
  listItemSelected: {
    backgroundColor: '#00529b',
  },
  listText: {
    color: '#666',
    fontWeight: '500',
  },
  listTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  inputContainer: {
    flex: 1,
    marginRight: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#00529b',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonDisabled: {
    backgroundColor: '#7fa8cc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default React.memo(CreateRouteScreen);
