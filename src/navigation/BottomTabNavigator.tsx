import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import HomeScreen from '../screens/Main/HomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { COLORS, FONTS } from '../constants/theme';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="BuscarViaje"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, size }) => {
          let icon = '🏠';

          if (route.name === 'BuscarViaje') icon = '🔍';
          else if (route.name === 'MisViajes') icon = '🎫';
          else if (route.name === 'Inicio') icon = '🏠';
          else if (route.name === 'Mensajes') icon = '✉️';
          else if (route.name === 'Perfil') icon = '👤';

          return (
            <View style={[styles.iconContainer, focused && styles.iconFocused]}>
              <Text style={{ fontSize: size }}>{icon}</Text>
            </View>
          );
        },
        tabBarActiveTintColor: COLORS.textPrimary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen 
        name="BuscarViaje" 
        component={HomeScreen} 
        options={{ title: 'Buscar viaje' }} 
      />
      <Tab.Screen 
        name="MisViajes" 
        component={HomeScreen} // Placeholder until screen is built
        options={{ title: 'Mis viajes' }} 
      />
      <Tab.Screen 
        name="Inicio" 
        component={HomeScreen} // Placeholder
        options={{
          title: 'Inicio',
          tabBarIcon: ({ size }) => (
            <View style={styles.centerButton}>
              <Text style={{ fontSize: size, color: COLORS.textWhite }}>🏠</Text>
            </View>
          ),
        }} 
      />
      <Tab.Screen 
        name="Mensajes" 
        component={HomeScreen} // Placeholder
        options={{ title: 'Mensajes' }} 
      />
      <Tab.Screen 
        name="Perfil" 
        component={ProfileScreen} 
        options={{ title: 'Perfil' }} 
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.buttonOutline,
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: FONTS.medium,
  },
  iconContainer: {
    padding: 2,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
  centerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary, // The mockups show a dark blue center button for some roles, but passenger has dark blue active tab. We'll use primary color.
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  }
});
