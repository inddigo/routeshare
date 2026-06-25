import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Mail, Lock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import StyledInput from '../components/StyledInput';
import PrimaryButton from '../components/PrimaryButton';
import SocialButton from '../components/SocialButton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

// Inicializa GoogleSignin con el Web Client ID de las variables de entorno
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Aviso', 'Por favor ingresa tu correo y contraseña');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Aviso', error.message);
    } else {
      // The AppNavigator should automatically redirect based on session,
      // but we can also manually navigate if we want to bypass the listener.
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  };

  const handleGoogleLogin = async () => {
    // Configuración para Social Login via Google
    // Requiere configuración en Google Cloud Platform
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
    // Configuración para Social Login via Apple
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
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + SPACING.xxxl, paddingBottom: insets.bottom + SPACING.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Section: Branding & Welcome */}
        <View style={styles.headerSection}>
          <Text style={styles.brandTitle}>RouteShare</Text>
          <Text style={styles.welcomeText}>Bienvenido de nuevo</Text>
          <Text style={styles.subtitleText}>Inicia sesión para continuar tu viaje</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
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
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            isPassword
            icon={<Lock color={COLORS.iconGrey} size={20} />}
          />

          <TouchableOpacity style={styles.forgotPasswordContainer} activeOpacity={0.7}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <PrimaryButton 
            title={loading ? 'Iniciando...' : 'Iniciar sesión'} 
            onPress={handleLogin} 
            style={styles.loginButton}
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
          <Text style={styles.footerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
            <Text style={styles.footerLink}>Regístrate</Text>
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
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.section,
  },
  brandTitle: {
    fontSize: FONTS.hero,
    fontWeight: FONTS.heavy,
    color: COLORS.primary,
    letterSpacing: -1,
  },
  welcomeText: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xxl,
  },
  subtitleText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  formSection: {
    marginBottom: SPACING.xxl,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: SPACING.xl,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: FONTS.sm,
    fontWeight: FONTS.semibold,
  },
  loginButton: {
    marginTop: SPACING.sm,
  },
  socialSection: {
    marginBottom: SPACING.xl,
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
    paddingTop: SPACING.xl,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.md,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: FONTS.md,
    fontWeight: FONTS.bold,
  },
});
