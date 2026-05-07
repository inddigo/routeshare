// src/navigation/AppNavigator.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import HomeScreen from '../screens/Main/HomeScreen';
import CreateRouteScreen from '../screens/conductor/CreateRouteScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CreateRoute: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setUserRole(data.rol);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Verificar sesión actual al cargar
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        await checkUserRole(session.user.id);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Error getting session:", err);
      setLoading(false);
    });

    // Escuchar cambios (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await checkUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00529b" />
      </View>
    );
  }

  // Si es conductor o ambos, mostrar pantalla de crear ruta como inicial (o al menos permitir navegar)
  const isDriver = userRole === 'conductor' || userRole === 'ambos';

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          // Main Stack (Con sesión)
          <>
            {isDriver ? (
              <Stack.Screen name="CreateRoute" component={CreateRouteScreen} />
            ) : null}
            <Stack.Screen name="Home" component={HomeScreen} />
            {/* Si es driver, CreateRoute será la primera. Si no, Home será la primera. */}
            {isDriver ? (
              <Stack.Screen name="HomeFallback" component={HomeScreen} options={{ title: 'Home' }} />
            ) : null}
          </>
        ) : (
          // Auth Stack (Sin sesión)
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
