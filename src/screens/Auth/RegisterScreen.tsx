import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import Header from '../../components/Header';
import { supabase } from '../../services/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    if (!acceptTerms || !acceptPrivacy) {
      setErrorMsg('Debes aceptar los términos y políticas para continuar.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }
    if (!email || !password || !fullName || !username) {
      setErrorMsg('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
        }
      }
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      navigation.replace('RegistrationSuccess');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack={true} />
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Regístrate</Text>
          <Text style={styles.subtitle}>Crear una cuenta</Text>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <View style={styles.formContainer}>
            <Text style={styles.label}>Nombre completo</Text>
            <CustomInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Name Surname"
              rightIcon={<Text style={styles.icon}>🪪</Text>}
            />

            <Text style={styles.label}>Introduce tu correo electrónico</Text>
            <CustomInput
              value={email}
              onChangeText={setEmail}
              placeholder="correo@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              rightIcon={<Text style={styles.icon}>✉️</Text>}
            />

            <Text style={styles.label}>Crear un nombre de usuario</Text>
            <CustomInput
              value={username}
              onChangeText={setUsername}
              placeholder="correo@correo.com" // Placeholder shown in mockup
              autoCapitalize="none"
              rightIcon={<Text style={styles.icon}>👤</Text>}
            />

            <Text style={styles.label}>Crea tu contraseña</Text>
            <CustomInput
              value={password}
              onChangeText={setPassword}
              placeholder="***********"
              secureTextEntry
              rightIcon={<Text style={styles.icon}>🔑</Text>}
            />

            <Text style={styles.label}>Repetir contraseña</Text>
            <CustomInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="***********"
              secureTextEntry
              rightIcon={<Text style={styles.icon}>🔒</Text>}
            />

            <View style={styles.checkboxesContainer}>
              <TouchableOpacity style={styles.checkboxRow} onPress={() => setAcceptTerms(!acceptTerms)}>
                <View style={[styles.checkbox, acceptTerms && styles.checkboxActive]}>
                  {acceptTerms && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>Acepto los Términos y Condiciones</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.checkboxRow} onPress={() => setAcceptPrivacy(!acceptPrivacy)}>
                <View style={[styles.checkbox, acceptPrivacy && styles.checkboxActive]}>
                  {acceptPrivacy && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>Acepto la Política de Privacidad</Text>
              </TouchableOpacity>
            </View>

            <CustomButton 
              title="Regístrate" 
              onPress={handleRegister} 
              loading={loading}
              style={styles.registerButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  title: {
    fontSize: FONTS.hero,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.sm,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  icon: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  checkboxesContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: COLORS.buttonOutline,
    borderRadius: 4,
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.textPrimary, // Mockups show dark gray/black box for checked
    borderColor: COLORS.textPrimary,
  },
  checkMark: {
    color: COLORS.textWhite,
    fontSize: 12,
  },
  checkboxText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  registerButton: {
    marginBottom: SPACING.xxxl,
  },
});

export default RegisterScreen;
