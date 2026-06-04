import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import CustomButton from '../../components/CustomButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    title: 'Bienvenido a la aplicación',
    subtitle: 'y comencemos',
    description: 'Esta aplicación es la mejor aplicación, gracias por descargarla.\nNo te arrepentirás de usarla.',
  },
  {
    id: '2',
    title: 'Descubre nuevas',
    subtitle: 'rutas diarias',
    description: 'Haz clic en Next y descubre todas las diferentes funciones.\nTe ofrecemos la mejor experiencia de viaje.',
  },
  {
    id: '3',
    title: 'Únete a nuestra',
    subtitle: 'comunidad',
    description: 'Conecta con otros pasajeros y conductores de forma segura y confiable.',
  },
];

const OnboardingScreen = ({ navigation }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / width);
      setActiveIndex(index);
    },
    []
  );

  const goToNext = useCallback(() => {
    if (activeIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
      setActiveIndex(activeIndex + 1);
    }
  }, [activeIndex]);

  const handleSkip = useCallback(() => {
    navigation.replace('Welcome');
  }, [navigation]);

  const handleLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  const handleRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Top placeholder for the circular image/graphic shown in mockups */}
      <View style={styles.topGraphicContainer}>
        <View style={styles.circlePlaceholder} />
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        bounces={false}
        style={styles.scrollView}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
            {slide.description && (
              <Text style={styles.description}>{slide.description}</Text>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {activeIndex === SLIDES.length - 1 ? (
          <>
             <View style={styles.finalButtonsRow}>
               <View style={{flex: 1, marginRight: 8}}>
                 <CustomButton title="Iniciar sesión" onPress={handleLogin} />
               </View>
               <View style={{flex: 1, marginLeft: 8}}>
                 <CustomButton title="Unirse ahora" onPress={handleRegister} />
               </View>
             </View>
             <TouchableOpacity style={styles.guestButton} onPress={handleSkip}>
               <Text style={styles.guestText}>Continuar como invitado</Text>
             </TouchableOpacity>
          </>
        ) : (
          <>
            <CustomButton title="Siguiente" onPress={goToNext} />
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Omitir</Text>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.footerLink}> Iniciar sesión.</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // white/light theme
  },
  topGraphicContainer: {
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGrey,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: SPACING.xl,
  },
  circlePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E5E7EB',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: FONTS.hero,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.hero,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.circle,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: COLORS.textPrimary,
  },
  dotInactive: {
    backgroundColor: '#E5E7EB',
  },
  bottomControls: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    alignItems: 'center',
  },
  skipButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  skipText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  footerText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    fontWeight: FONTS.medium,
  },
  finalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  guestButton: {
    marginTop: SPACING.sm,
  },
  guestText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
});

export default OnboardingScreen;
