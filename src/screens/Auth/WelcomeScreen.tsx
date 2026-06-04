// src/screens/Auth/WelcomeScreen.tsx
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen = ({ navigation }: Props) => {
  const navigateToRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  const navigateToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.darkBackground} />

      {/* Logo */}
      <View style={styles.logoSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🚗</Text>
        </View>
        <Text style={styles.logoLabel}>RouteShare</Text>
      </View>

      {/* Title & Subtitle */}
      <View style={styles.textSection}>
        <Text style={styles.title}>Bienvenido a RouteShare</Text>
        <Text style={styles.subtitle}>
          Movilidad universitaria colaborativa para la comunidad PUCV
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsSection}>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={navigateToRegister}
          activeOpacity={0.85}
        >
          <Text style={styles.registerButtonText}>Registrarse</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={navigateToLogin}
          activeOpacity={0.85}
        >
          <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Al registrarte, aceptas los{' '}
          <Text style={styles.footerLink}>Términos y Condiciones</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBackground,
    paddingHorizontal: SPACING.xxl,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.section,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.circle,
    borderWidth: 3,
    borderColor: COLORS.accentGreen,
    backgroundColor: 'rgba(46, 196, 182, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  logoEmoji: {
    fontSize: 44,
  },
  logoLabel: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.bold,
    color: COLORS.accentGreen,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: SPACING.section + SPACING.lg,
  },
  title: {
    fontSize: FONTS.hero,
    fontWeight: FONTS.bold,
    color: COLORS.textWhite,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONTS.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.lg,
  },
  buttonsSection: {
    gap: SPACING.lg,
    marginBottom: SPACING.section,
  },
  registerButton: {
    backgroundColor: COLORS.accentGreen,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    ...SHADOWS.elevated,
  },
  registerButtonText: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.bold,
    color: COLORS.textWhite,
  },
  loginButton: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  loginButtonText: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.bold,
    color: COLORS.textWhite,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: SPACING.xxxl,
  },
  footerText: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  footerLink: {
    color: COLORS.accentGreen,
    textDecorationLine: 'underline',
  },
});

export default React.memo(WelcomeScreen);
