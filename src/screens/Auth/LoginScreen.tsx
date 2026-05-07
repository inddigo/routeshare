// src/screens/Auth/LoginScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { supabase } from '../../services/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

// Validar correo institucional (pucv.cl o mail.pucv.cl)
const PUCV_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(?:mail\.)?pucv\.cl$/;

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Optimización: useCallback para prevenir que la función se recree en cada render
  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    if (!PUCV_EMAIL_REGEX.test(email)) {
      Alert.alert('Acceso Denegado', 'Debes usar un correo institucional (@pucv.cl o @mail.pucv.cl).');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Error de Autenticación', error.message);
    }
    // Si es exitoso, AppNavigator automáticamente detectará la sesión y cambiará de Stack.
  }, [email, password]);

  const navigateToRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RouteShare</Text>
      <Text style={styles.subtitle}>Comunidad PUCV</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Correo Institucional"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          // Optimización de UI: evita sugerencias pesadas del teclado
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

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={navigateToRegister}>
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Optimización: Usar StyleSheet para crear estilos de forma nativa (menos CPU que StyledComponents)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00529b', // Azul PUCV aproximado
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
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
  button: {
    backgroundColor: '#00529b',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
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

export default React.memo(LoginScreen);
