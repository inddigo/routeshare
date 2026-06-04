import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import Header from '../../components/Header';
import { supabase } from '../../services/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Ingresa tu correo y contraseña.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErrorMsg('No pudimos iniciar sesión. Verifica tus credenciales.');
    }
    // La navegación la maneja onAuthStateChange en AppNavigator
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack={true} />
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Iniciar sesión</Text>
          <Text style={styles.subtitle}>Ingresa tus datos para continuar</Text>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <View style={styles.formContainer}>
            <Text style={styles.label}>Introduce tu correo electrónico</Text>
            <CustomInput
              value={email}
              onChangeText={setEmail}
              placeholder="correo@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              rightIcon={<Text style={styles.icon}>✉️</Text>} // Use proper SVG icons in production
            />

            <Text style={styles.label}>Ingresa tu contraseña</Text>
            <CustomInput
              value={password}
              onChangeText={setPassword}
              placeholder="***********"
              secureTextEntry={!showPassword}
              rightIcon={<Text style={styles.icon}>{showPassword ? '👁️' : '🚫'}</Text>}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={styles.checkboxContainer} 
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>Recuérdame</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>Recuperar contraseña</Text>
              </TouchableOpacity>
            </View>

            <CustomButton 
              title="Iniciar sesión" 
              onPress={handleLogin} 
              loading={loading}
              style={{ marginTop: SPACING.xl }}
            />

            <View style={styles.dividerContainer}>
              <Text style={styles.dividerText}>o</Text>
            </View>

            <View style={styles.socialContainer}>
              {['G', 'f', '🐦'].map((social, idx) => (
                <TouchableOpacity key={idx} style={styles.socialButton}>
                  <Text style={styles.socialIcon}>{social}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
    paddingTop: SPACING.xxl,
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
    marginBottom: SPACING.xxxl,
    marginTop: SPACING.sm,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontWeight: FONTS.medium,
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: COLORS.buttonOutline,
    borderRadius: 4,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.buttonPrimary,
    borderColor: COLORS.buttonPrimary,
  },
  checkMark: {
    color: COLORS.textWhite,
    fontSize: 12,
  },
  rememberText: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    fontWeight: FONTS.medium,
  },
  forgotText: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    fontWeight: FONTS.bold,
  },
  dividerContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerText: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    fontWeight: FONTS.bold,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.buttonOutline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
});

export default LoginScreen;
