// src/navigation/AppNavigator.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

// Auth Screens
import OnboardingScreen from '../screens/Auth/OnboardingScreen';
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import RegistrationSuccessScreen from '../screens/Auth/RegistrationSuccessScreen';
// Main Screens
import HomeScreen from '../screens/Main/HomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

// Passenger Screens
import BottomTabNavigator from './BottomTabNavigator';
import SearchTripsScreen from '../screens/Passenger/SearchTripsScreen';
import TripDetailScreen from '../screens/Passenger/TripDetailScreen';
import PaymentScreen from '../screens/Passenger/PaymentScreen';
import MyReservationsScreen from '../screens/Passenger/MyReservationsScreen';
import ActiveTripScreen from '../screens/Passenger/ActiveTripScreen';
import RateDriverScreen from '../screens/Passenger/RateDriverScreen';
import SupportScreen from '../screens/Passenger/SupportScreen';

// Driver Screens
import CreateRouteScreen from '../screens/conductor/CreateRouteScreen';
import ConductorHomeScreen from '../screens/conductor/ConductorHomeScreen';
import DriverRegistrationScreen from '../screens/Driver/DriverRegistrationScreen';
import DriverReservationsScreen from '../screens/Driver/DriverReservationsScreen';
import PinValidationScreen from '../screens/Driver/PinValidationScreen';
import ActiveTripDriverScreen from '../screens/Driver/ActiveTripDriverScreen';
import RatePassengerScreen from '../screens/Driver/RatePassengerScreen';

export type RootStackParamList = {
  // Auth
  Onboarding: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  RegistrationSuccess: undefined;
  // Main
  MainTabs: undefined;
  // Passenger
  SearchTrips: undefined;
  TripDetail: { viaje: any };
  Payment: { viaje: any; monto: number };
  MyReservations: undefined;
  ActiveTrip: { reserva: any };
  RateDriver: { viajeId: string; conductorId: string };
  Support: undefined;
  // Driver
  CreateRoute: undefined;
  ConductorHome: undefined;
  DriverRegistration: undefined;
  DriverReservations: undefined;
  PinValidation: undefined;
  ActiveTripDriver: undefined;
  RatePassenger: { viajeId: string; pasajeros: any[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Utilidad: envuelve una promesa con timeout
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => {
      console.warn(`[AppNavigator] Timeout de ${ms}ms alcanzado`);
      resolve(fallback);
    }, ms)),
  ]);
}

export default function AppNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const initDone = useRef(false);

  const checkUserRole = useCallback(async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await withTimeout(
        supabase.from('usuarios').select('rol').eq('id', userId).single() as unknown as Promise<any>,
        8000,
        { data: null, error: { message: 'Timeout' } } as any
      );
      if (!error && data) {
        setUserRole(data.rol);
        return data.rol;
      }
      setUserRole('pasajero');
      return 'pasajero';
    } catch {
      setUserRole('pasajero');
      return 'pasajero';
    }
  }, []);

  useEffect(() => {
    console.log('[AppNavigator] useEffect triggered');
    const init = async () => {
      console.log('[AppNavigator] init start');
      try {
        console.log('[AppNavigator] fetching session...');
        const result = await withTimeout(
          supabase.auth.getSession(),
          10000,
          { data: { session: null }, error: null } as any
        );
        console.log('[AppNavigator] session fetched:', result);
        const s = result.data.session;
        setSession(s);
        if (s?.user) {
          console.log('[AppNavigator] user found, checking role...');
          await checkUserRole(s.user.id);
        }
      } catch (err) {
        console.error('[AppNavigator] Error in init:', err);
      } finally {
        console.log('[AppNavigator] init finally');
        initDone.current = true;
        setLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      console.log('[AppNavigator] onAuthStateChange:', _event, newSession);
      if (!initDone.current) return;
      setLoading(true);
      setSession(newSession);
      if (newSession?.user) {
        await checkUserRole(newSession.user.id);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkUserRole]);

  console.log('[AppNavigator] rendering. loading:', loading, 'session:', !!session, 'userRole:', userRole);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00529b" />
        <Text style={styles.loadingText}>Conectando...</Text>
      </View>
    );
  }

  const isDriver = userRole === 'conductor' || userRole === 'ambos';

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerShown: false,
      }}>
        {session ? (
          <>
            {/* Main Tabs */}
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} options={{ headerShown: false }} />

            {/* Passenger Flow */}
            <Stack.Screen name="SearchTrips" component={SearchTripsScreen} options={{ title: 'Buscar Viaje' }} />
            <Stack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: 'Detalle del Viaje' }} />
            <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Confirmar Pago' }} />
            <Stack.Screen name="MyReservations" component={MyReservationsScreen} options={{ title: 'Mis Reservas' }} />
            <Stack.Screen name="ActiveTrip" component={ActiveTripScreen} options={{ title: 'Viaje Activo' }} />
            <Stack.Screen name="RateDriver" component={RateDriverScreen} options={{ title: 'Calificar Conductor' }} />
            <Stack.Screen name="Support" component={SupportScreen} options={{ title: 'Soporte' }} />

            {/* Driver Flow */}
            <Stack.Screen name="CreateRoute" component={CreateRouteScreen} options={{ title: 'Publicar Ruta' }} />
            <Stack.Screen name="ConductorHome" component={ConductorHomeScreen} options={{ title: 'Dashboard Conductor', headerShown: false }} />
            <Stack.Screen name="DriverRegistration" component={DriverRegistrationScreen} options={{ title: 'Registro Conductor' }} />
            <Stack.Screen name="DriverReservations" component={DriverReservationsScreen} options={{ title: 'Gestionar Reservas' }} />
            <Stack.Screen name="PinValidation" component={PinValidationScreen} options={{ title: 'Validar PIN' }} />
            <Stack.Screen name="ActiveTripDriver" component={ActiveTripDriverScreen} options={{ title: 'Viaje Activo' }} />
            <Stack.Screen name="RatePassenger" component={RatePassengerScreen} options={{ title: 'Calificar Pasajeros' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="RegistrationSuccess" component={RegistrationSuccessScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff',
  },
  loadingText: { marginTop: 12, fontSize: 14, color: '#999' },
});
