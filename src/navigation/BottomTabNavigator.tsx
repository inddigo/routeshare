import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, Car, User } from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';
import { Platform } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import TripsScreen from '../screens/TripsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Definidos fuera del componente para evitar que React los trate como un
// tipo de componente nuevo en cada render (react/no-unstable-nested-components).
const HomeIcon = ({ color }: { color: string }) => (
  <Home color={color} size={22} strokeWidth={2.5} />
);
const SearchTabIcon = ({ color }: { color: string }) => (
  <Search color={color} size={22} strokeWidth={2.5} />
);
const TripsIcon = ({ color }: { color: string }) => (
  <Car color={color} size={22} strokeWidth={2.5} />
);
const ProfileIcon = ({ color }: { color: string }) => (
  <User color={color} size={22} strokeWidth={2.5} />
);

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopWidth: 1,
          borderTopColor: COLORS.borderLight,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          height: Platform.OS === 'ios' ? 85 : 65,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: FONTS.bold,
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: HomeIcon,
        }} 
      />
      
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{
          tabBarLabel: 'Buscar Viaje',
          tabBarIcon: SearchTabIcon,
        }} 
      />

      <Tab.Screen 
        name="Trips" 
        component={TripsScreen} 
        options={{
          tabBarLabel: 'Mis Viajes',
          tabBarIcon: TripsIcon,
        }} 
      />

      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ProfileIcon,
        }} 
      />
    </Tab.Navigator>
  );
}
