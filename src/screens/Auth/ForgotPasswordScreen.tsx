// src/screens/Auth/ForgotPasswordScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { supabase } from '../../services/supabase';
import { validatePUCVEmail } from '../../services/validationService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = useCallback(async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo institucional.');
      return;
    }

    if (!validatePUCVEmail(email.trim())) {
      Alert.alert(
        'Correo inválido',
        'Debes usar un correo institucional (@pucv.cl o @mail.pucv.cl).',
      );
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setSent(true);
  }, [email]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.darkBlueHeader} />

      {/* Wavy Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Restablecer contraseña</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {sent ? (
          // Success state
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Text style={styles.successEmoji}>📧</Text>
            </View>
            <Text style={styles.successTitle}>¡Correo enviado!</Text>
            <Text style={styles.successDescription}>
              Hemos enviado un enlace de restablecimiento a{'\n'}
              <Text style={styles.emailHighlight}>{email.trim().toLowerCase()}</Text>
              {'\n\n'}Revisa tu bandeja de entrada y sigue las instrucciones.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={goBack}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Volver al inicio de sesión</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Form state
          <View style={styles.formContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🔑</Text>
            </View>

            <Text style={styles.description}>
              Ingresa tu correo institucional PUCV y te enviaremos un enlace para
              restablecer tu contraseña.
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="correo@pucv.cl"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textWhite} />
              ) : (
                <Text style={styles.primaryButtonText}>Restablecer contraseña</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={goBack} style={styles.linkButton}>
              <Text style={styles.linkText}>Volver al inicio de sesión</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBackground,
  },
  header: {
    backgroundColor: COLORS.darkBlueHeader,
    paddingTop: 56,
    paddingBottom: SPACING.xxxl,
    paddingHorizontal: SPACING.xxl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  backButton: {
    marginBottom: SPACING.lg,
    width: 40,
    height: 40,
    borderRadius: RADIUS.circle,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: COLORS.textWhite,
    fontWeight: FONTS.bold,
  },
  headerTitle: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.bold,
    color: COLORS.textWhite,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    justifyContent: 'center',
  },
  formContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.circle,
    backgroundColor: 'rgba(0, 82, 155, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  iconEmoji: {
    fontSize: 36,
  },
  description: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xxxl,
    paddingHorizontal: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xxl,
    width: '100%',
    ...SHADOWS.subtle,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.lg,
    fontSize: FONTS.lg,
    color: COLORS.textPrimary,
  },
  primaryButton: {
    backgroundColor: COLORS.buttonPrimary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    width: '100%',
    ...SHADOWS.card,
  },
  buttonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  primaryButtonText: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
    color: COLORS.textWhite,
  },
  linkButton: {
    marginTop: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  linkText: {
    fontSize: FONTS.md,
    color: COLORS.textLink,
    fontWeight: FONTS.semibold,
  },
  // Success state
  successContainer: {
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.circle,
    backgroundColor: 'rgba(46, 196, 182, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  successEmoji: {
    fontSize: 36,
  },
  successTitle: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  successDescription: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xxxl,
  },
  emailHighlight: {
    fontWeight: FONTS.bold,
    color: COLORS.primaryBlue,
  },
});

export default React.memo(ForgotPasswordScreen);
