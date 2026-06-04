// src/screens/Auth/RegistrationSuccessScreen.tsx
import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrationSuccess'>;

const RegistrationSuccessScreen = ({ navigation }: Props) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  const handleGoToApp = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lightBackground} />

      <View style={styles.content}>
        {/* Animated checkmark */}
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.checkEmoji}>✅</Text>
        </Animated.View>

        {/* Texts */}
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>¡Felicitaciones!</Text>
          <Text style={styles.body}>
            Tu cuenta ha sido creada con éxito.
          </Text>
          <Text style={styles.bodySecondary}>
            Ya puedes empezar a compartir viajes con la comunidad PUCV.
          </Text>
        </Animated.View>

        {/* CTA Button */}
        <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGoToApp}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Ir a la aplicación</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Decorative dots */}
      <View style={styles.decorDots}>
        <View style={[styles.decorDot, styles.decorDotGreen]} />
        <View style={[styles.decorDot, styles.decorDotBlue]} />
        <View style={[styles.decorDot, styles.decorDotGreenSmall]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBackground,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.circle,
    backgroundColor: COLORS.statusConfirmed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxxl,
    ...SHADOWS.elevated,
  },
  checkEmoji: {
    fontSize: 56,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: SPACING.section,
  },
  title: {
    fontSize: FONTS.hero,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  body: {
    fontSize: FONTS.xl,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: FONTS.medium,
    marginBottom: SPACING.sm,
  },
  bodySecondary: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: COLORS.accentGreen,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    ...SHADOWS.elevated,
  },
  primaryButtonText: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.bold,
    color: COLORS.textWhite,
  },
  // Decorative elements
  decorDots: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  decorDot: {
    borderRadius: RADIUS.circle,
  },
  decorDotGreen: {
    width: 12,
    height: 12,
    backgroundColor: COLORS.accentGreen,
    opacity: 0.4,
  },
  decorDotBlue: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.primaryBlue,
    opacity: 0.3,
  },
  decorDotGreenSmall: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.accentGreen,
    opacity: 0.2,
  },
});

export default React.memo(RegistrationSuccessScreen);
