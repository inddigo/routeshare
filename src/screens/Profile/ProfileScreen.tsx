// src/screens/Profile/ProfileScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface MenuOption {
  icon: string;
  label: string;
  onPress: () => void;
}

const ProfileScreen = ({ navigation }: any) => {
  const [usuario, setUsuario] = useState<any>(null);
  const [conductor, setConductor] = useState<any>(null);
  const [vehiculo, setVehiculo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ viajes: 0, calificacion: 5.0 });

  const loadProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Datos del usuario
      const { data: userData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userData) setUsuario(userData);

      // Datos de conductor (si aplica)
      const { data: condData } = await supabase
        .from('conductores')
        .select('*')
        .eq('usuario_id', user.id)
        .single();

      if (condData) {
        setConductor(condData);

        const { data: vehData } = await supabase
          .from('vehiculos')
          .select('*')
          .eq('conductor_id', condData.id)
          .single();

        if (vehData) setVehiculo(vehData);
      }

      // Estadísticas
      const { count: viajesCount } = await supabase
        .from('reservas')
        .select('*', { count: 'exact', head: true })
        .eq('pasajero_id', user.id)
        .eq('estado', 'confirmada');

      const { data: calData } = await supabase
        .from('calificaciones')
        .select('puntaje')
        .eq('evaluado_id', user.id);

      const avgRating = calData && calData.length > 0
        ? calData.reduce((sum: number, c: any) => sum + c.puntaje, 0) / calData.length
        : 5.0;

      setStats({ viajes: viajesCount || 0, calificacion: avgRating });
    } catch (err) {
      console.error('Error cargando perfil:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLogout = useCallback(async () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  }, []);

  const getRolLabel = useCallback((rol: string) => {
    switch (rol) {
      case 'ambos': return 'Pasajero / Conductor';
      case 'conductor': return 'Conductor';
      default: return 'Pasajero';
    }
  }, []);

  const getInitials = useCallback((nombre?: string, apellido?: string) => {
    const first = nombre?.charAt(0)?.toUpperCase() || '';
    const last = apellido?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  }, []);

  const menuOptions: MenuOption[] = [
    {
      icon: '👤',
      label: 'Configuración de cuenta',
      onPress: () => {},
    },
    {
      icon: '💳',
      label: 'Métodos de pago',
      onPress: () => {},
    },
    {
      icon: '🛡',
      label: 'Seguridad',
      onPress: () => {},
    },
    {
      icon: '❓',
      label: 'Centro de Ayuda',
      onPress: () => navigation.navigate('Support'),
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.lightBackground} />
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lightBackground} />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <Text style={styles.gearIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(usuario?.nombre, usuario?.apellido_paterno)}
            </Text>
          </View>
        </View>
        <Text style={styles.userName}>
          {usuario?.nombre} {usuario?.apellido_paterno || ''}
        </Text>
        <View style={styles.rolBadge}>
          <Text style={styles.rolBadgeText}>
            {getRolLabel(usuario?.rol)}
          </Text>
        </View>
      </View>

      {/* Data Fields Card */}
      <View style={styles.dataCard}>
        <DataField
          label="Correo electrónico"
          value={usuario?.email || 'No registrado'}
          icon="✉️"
        />
        <View style={styles.dataFieldDivider} />
        <DataField
          label="Teléfono"
          value={usuario?.celular || 'No registrado'}
          icon="📱"
        />
        <View style={styles.dataFieldDivider} />
        <DataField
          label="RUT"
          value={usuario?.rut || 'No registrado'}
          icon="🪪"
        />
      </View>

      {/* Options Menu */}
      <View style={styles.optionsCard}>
        <Text style={styles.optionsTitle}>Opciones</Text>
        {menuOptions.map((option, index) => (
          <React.Fragment key={option.label}>
            <TouchableOpacity
              style={styles.optionRow}
              onPress={option.onPress}
              activeOpacity={0.6}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </View>
              <Text style={styles.optionChevron}>›</Text>
            </TouchableOpacity>
            {index < menuOptions.length - 1 && (
              <View style={styles.optionDivider} />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Panel de Conductor */}
      {(usuario?.rol === 'conductor' || usuario?.rol === 'ambos') && (
        <TouchableOpacity
          style={[styles.driverButton, { backgroundColor: COLORS.primaryBlue }]}
          onPress={() => navigation.navigate('ConductorHome')}
          activeOpacity={0.8}
        >
          <Text style={styles.driverButtonIcon}>🚘</Text>
          <Text style={styles.driverButtonText}>Ir a Panel de Conductor</Text>
        </TouchableOpacity>
      )}

      {/* Postular como Conductor */}
      {usuario?.rol === 'pasajero' && !conductor && (
        <TouchableOpacity
          style={styles.driverButton}
          onPress={() => navigation.navigate('DriverRegistration')}
          activeOpacity={0.8}
        >
          <Text style={styles.driverButtonIcon}>🚗</Text>
          <Text style={styles.driverButtonText}>Postular como Conductor</Text>
        </TouchableOpacity>
      )}

      {/* Cerrar Sesión */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

// Subcomponent for data fields
const DataField = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
  <View style={styles.dataField}>
    <View style={styles.dataFieldLeft}>
      <Text style={styles.dataFieldIcon}>{icon}</Text>
      <View>
        <Text style={styles.dataFieldLabel}>{label}</Text>
        <Text style={styles.dataFieldValue}>{value}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBackground,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightBackground,
  },

  // Header Bar
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 54,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.lightBackground,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  backArrow: {
    fontSize: 20,
    color: COLORS.textPrimary,
    fontWeight: FONTS.bold,
  },
  headerTitle: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  gearIcon: {
    fontSize: 18,
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  avatarContainer: {
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.elevated,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: FONTS.bold,
    color: COLORS.textWhite,
  },
  userName: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  rolBadge: {
    backgroundColor: COLORS.statusBadgeGreen,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
  },
  rolBadgeText: {
    color: COLORS.statusTextGreen,
    fontSize: FONTS.sm,
    fontWeight: FONTS.semibold,
  },

  // Data Card
  dataCard: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  dataField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  dataFieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dataFieldIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  dataFieldLabel: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dataFieldValue: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    fontWeight: FONTS.medium,
  },
  dataFieldDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },

  // Options Card
  optionsCard: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  optionsTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  optionLabel: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    fontWeight: FONTS.medium,
  },
  optionChevron: {
    fontSize: 22,
    color: COLORS.textMuted,
    fontWeight: FONTS.medium,
  },
  optionDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },

  // Driver Registration Button
  driverButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.accentGreen,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  driverButtonIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  driverButtonText: {
    color: COLORS.textWhite,
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
  },

  // Logout Button
  logoutButton: {
    backgroundColor: COLORS.inputBackground,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.lg,
    fontWeight: FONTS.semibold,
  },

  bottomPadding: {
    height: SPACING.section,
  },
});

export default React.memo(ProfileScreen);
