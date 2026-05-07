// src/screens/Auth/RegisterScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { supabase } from '../../services/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const PUCV_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(?:mail\.)?pucv\.cl$/;

const RegisterScreen = ({ navigation }: Props) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'conductor' | 'pasajero' | 'ambos'>('pasajero');
  const [loading, setLoading] = useState(false);

  const handleRegister = useCallback(async () => {
    if (!nombre || !email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    if (!PUCV_EMAIL_REGEX.test(email)) {
      Alert.alert('Acceso Denegado', 'Debes usar un correo institucional (@pucv.cl o @mail.pucv.cl).');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    
    // 1. Registro en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      Alert.alert('Error en Registro', error.message);
      return;
    }

    // 2. Inserción en la tabla public.usuarios
    if (data.user) {
      const { error: dbError } = await supabase
        .from('usuarios')
        .insert([
          { id: data.user.id, email, nombre, rol }
        ]);

      if (dbError) {
        Alert.alert('Error al guardar perfil', dbError.message);
      }
    }

    setLoading(false);
    // Si la confirmación de email no es requerida, el estado de sesión cambiará automáticamente.
    // De lo contrario, se debe pedir al usuario revisar su correo.
  }, [nombre, email, password, rol]);

  const navigateToLogin = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Crear Cuenta</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nombre Completo"
            placeholderTextColor="#999"
            value={nombre}
            onChangeText={setNombre}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo Institucional"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Selecciona tu Rol principal:</Text>
          <View style={styles.rolesContainer}>
            {(['pasajero', 'conductor', 'ambos'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleButton, rol === r && styles.roleButtonActive]}
                onPress={() => setRol(r)}
              >
                <Text style={[styles.roleText, rol === r && styles.roleTextActive]}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={navigateToLogin}>
            <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00529b',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    marginTop: 5,
  },
  rolesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  roleButtonActive: {
    backgroundColor: '#e6f0fa',
    borderColor: '#00529b',
  },
  roleText: {
    color: '#666',
    fontWeight: '500',
  },
  roleTextActive: {
    color: '#00529b',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#00529b',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#7fa8cc',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#00529b',
    fontWeight: '600',
  },
});

export default React.memo(RegisterScreen);
