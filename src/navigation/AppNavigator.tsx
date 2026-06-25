import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from '../services/supabase';
import { pushService } from '../services/pushService';
import { Session } from '@supabase/supabase-js';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

// Main Navigation
import BottomTabNavigator from './BottomTabNavigator';

// Secondary Screens
// We will create these shortly. For now we will import them, assuming they exist, to avoid breaking the file later.
// Note: If you run the app before creating them, it will throw an error.
import OfferRideScreen from '../screens/OfferRideScreen';
import TripDetailsScreen from '../screens/TripDetailsScreen';
import ActiveRideScreen from '../screens/ActiveRideScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import AddPaymentMethodScreen from '../screens/AddPaymentMethodScreen';
import DriverValidationScreen from '../screens/DriverValidationScreen';
import MercadoPagoCheckoutScreen from '../screens/MercadoPagoCheckoutScreen';

export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;
  
  // Main
  MainTabs: { screen?: string };
  
  // Secondary
  OfferRide: undefined;
  TripDetails: { viajeId: string };
  ActiveRide: { viajeId: string; reservaId?: string };
  Settings: undefined;
  PaymentMethods: { paymentSuccess?: boolean } | undefined;
  AddPaymentMethod: undefined;
  DriverValidation: undefined;
  MercadoPagoCheckout: { url: string };
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
  const [loading, setLoading] = useState(true);
  const initDone = useRef(false);

  useEffect(() => {
    const init = async () => {
      try {
        const result = await withTimeout(
          supabase.auth.getSession(),
          10000,
          { data: { session: null }, error: null } as any
        );
        const s = result.data.session;
        setSession(s);
        if (s) pushService.registerDevice();
      } catch (err) {
        console.error('[AppNavigator] Error in init:', err);
      } finally {
        initDone.current = true;
        setLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!initDone.current) return;
      setSession(newSession);
      if (newSession) pushService.registerDevice();
    });

    // Notificaciones push con la app abierta
    const unsubscribePush = pushService.listenForeground();

    return () => {
      subscription.unsubscribe();
      unsubscribePush();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002855" />
        <Text style={styles.loadingText}>Conectando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen name="OfferRide" component={OfferRideScreen} />
            <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
            <Stack.Screen name="ActiveRide" component={ActiveRideScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
            <Stack.Screen name="AddPaymentMethod" component={AddPaymentMethodScreen} />
            <Stack.Screen name="DriverValidation" component={DriverValidationScreen} />
            <Stack.Screen name="MercadoPagoCheckout" component={MercadoPagoCheckoutScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={SignUpScreen} />
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
