import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ArrowLeft, Mail, Lock, User, Phone } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import StyledInput from '../components/StyledInput';
import PrimaryButton from '../components/PrimaryButton';
import SocialButton from '../components/SocialButton';
import { validatePasswordStrength, validateCelular } from '../services/validationService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function SignUpScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!acceptedTerms) {
      Alert.alert('Aviso', 'Debes aceptar los términos y condiciones');
      return;
    }
    if (!email || !password || !name) {
      Alert.alert('Aviso', 'Por favor completa todos los campos');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      Alert.alert('Correo inválido', 'Ingresa un correo electrónico válido.');
      return;
    }
    const pw = validatePasswordStrength(password);
    if (!pw.valid) {
      Alert.alert('Contraseña débil', pw.message);
      return;
    }
    if (phone && !validateCelular(phone)) {
      Alert.alert(
        'Teléfono inválido',
        'Ingresa un celular chileno válido (9 dígitos, ej. +56 9 1234 5678).',
      );
      return;
    }

    setLoading(true);
    // Claves de metadata alineadas con el trigger sync_user_from_auth
    // (full_name / phone). Así el nombre y el teléfono sí se guardan en User.
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name.trim(),
          phone: phone.trim(),
        },
      },
    });
    setLoading(false);

    if (error) {
      Alert.alert('Aviso', error.message);
    } else {
      Alert.alert('Éxito', 'Registro exitoso. Revisa tu correo para verificar la cuenta o inicia sesión directamente.');
      navigation.navigate('Login');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo: any = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken || userInfo.idToken;
      if (idToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });
        if (error) throw error;
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      } else {
        throw new Error('no ID token present!');
      }
    } catch (error: any) {
      Alert.alert('Error en Google Login', error.message);
    }
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
      if (credential.identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });
        if (error) throw error;
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      } else {
        throw new Error('No identityToken.');
      }
    } catch (error: any) {
      Alert.alert('Error en Apple Login', error.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + SPACING.lg, paddingBottom: insets.bottom + SPACING.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ArrowLeft color={COLORS.primary} size={24} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.titleText}>Crea tu cuenta</Text>
          <Text style={styles.subtitleText}>Únete a la comunidad de RouteShare</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <StyledInput
            label="Nombre completo"
            placeholder="Ej. Juan Pérez"
            value={name}
            onChangeText={setName}
            icon={<User color={COLORS.iconGrey} size={20} />}
          />

          <StyledInput
            label="Correo electrónico"
            placeholder="usuario@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail color={COLORS.iconGrey} size={20} />}
          />

          <StyledInput
            label="Teléfono"
            placeholder="+56 9 0000 0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            icon={<Phone color={COLORS.iconGrey} size={20} />}
          />

          <StyledInput
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            isPassword
            icon={<Lock color={COLORS.iconGrey} size={20} />}
            containerStyle={{ marginBottom: SPACING.md }}
          />

          <View style={styles.termsContainer}>
            <TouchableOpacity 
              style={[styles.checkbox, acceptedTerms && styles.checkboxActive]} 
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              activeOpacity={0.8}
            >
              {acceptedTerms && <View style={styles.checkboxInner} />}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              Acepto los <Text style={styles.termsLink}>Términos y Condiciones</Text>
            </Text>
          </View>

          <PrimaryButton 
            title={loading ? "Creando cuenta..." : "Crear cuenta"} 
            onPress={handleRegister} 
            style={styles.registerButton}
            disabled={loading}
          />
        </View>

        {/* Social Login Section */}
        <View style={styles.socialSection}>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O</Text>
            <View style={styles.dividerLine} />
          </View>

          <SocialButton provider="google" onPress={handleGoogleLogin} />
          <SocialButton provider="apple" onPress={handleAppleLogin} />
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
            <Text style={styles.footerLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
  },
  headerSection: {
    marginBottom: SPACING.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginLeft: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  titleText: {
    fontSize: 28,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  formSection: {
    marginBottom: SPACING.xl,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderGrey,
    backgroundColor: COLORS.lightGrey,
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: COLORS.textWhite,
    borderRadius: 2,
  },
  termsText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: FONTS.bold,
  },
  registerButton: {
    marginTop: SPACING.xs,
  },
  socialSection: {
    marginBottom: SPACING.lg,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    fontWeight: FONTS.semibold,
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: SPACING.md,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
  },
});
