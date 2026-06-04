import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import CustomButton from '../../components/CustomButton';

const ConductorHomeScreen = ({ navigation }: any) => {

  const viajes = [
    {
      id: '1',
      origen: 'Av. Brasil 2241',
      destino: 'Av. Libertad 1348',
      fecha: '9 May 2026',
      hora: '13:00hrs',
      asientosOcupados: 2,
      asientosTotales: 4,
    },
    {
      id: '2',
      origen: 'Av. Brasil 2241',
      destino: 'Placeres, Av. Matta 13',
      fecha: '9 May 2026',
      hora: '14:30hrs',
      asientosOcupados: 3,
      asientosTotales: 4,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.headerIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis rutas</Text>
        <TouchableOpacity>
          <Text style={styles.headerIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.profileSection}>
          <View style={styles.profileIconContainer}>
            <Text style={styles.profileIcon}>📍</Text>
          </View>
          <View style={styles.profileTextContainer}>
            <Text style={styles.greeting}>¡Hola, Conductor!</Text>
            <Text style={styles.subtitle}>Publica tu ruta y encuentra pasajeros para el próximo viaje</Text>
          </View>
        </View>

        <CustomButton 
          title="+ Publicar nueva ruta" 
          onPress={() => navigation.navigate('CreateRoute')} 
          style={styles.publishButton}
          textStyle={{ color: COLORS.textWhite, fontWeight: FONTS.medium, fontSize: FONTS.md }}
        />

        <CustomButton 
          title="Mis rutas publicadas" 
          onPress={() => {}} 
          variant="outline"
          style={styles.publishedButton}
          textStyle={{ color: COLORS.accentDark, fontWeight: FONTS.medium, fontSize: FONTS.md }}
        />

        <Text style={styles.listTitle}>Próximos viajes</Text>

        {viajes.map((viaje) => (
          <View key={viaje.id} style={styles.tripCard}>
            <View style={styles.tripHeader}>
              <View style={styles.routeContainer}>
                <Text style={styles.routeText}>{viaje.origen}</Text>
                <Text style={styles.arrowIcon}> ➤ </Text>
                <Text style={styles.routeText}>{viaje.destino}</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.menuIcon}>⋮</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tripDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📅</Text>
                <Text style={styles.detailText}>{viaje.fecha}</Text>
                <Text style={styles.dotSeparator}> • </Text>
                <Text style={styles.detailText}>{viaje.hora}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>👥</Text>
                <Text style={styles.detailText}>{viaje.asientosOcupados}/{viaje.asientosTotales} Asientos ocupados</Text>
              </View>
            </View>

            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Publicada</Text>
              </View>
            </View>
          </View>
        ))}
        
        <View style={{height: SPACING.xxxl}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary, // Negro marca
  },
  headerIcon: {
    fontSize: 24,
    color: COLORS.textWhite,
  },
  headerTitle: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.bold,
    color: COLORS.textWhite,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.lightGrey,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  profileIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.successGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  profileIcon: {
    fontSize: 28,
  },
  profileTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  publishButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.pill,
    height: 48,
    marginBottom: SPACING.xs,
  },
  publishedButton: {
    borderColor: COLORS.accent,
    borderRadius: RADIUS.pill,
    height: 48,
    marginBottom: SPACING.xl,
  },
  listTitle: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  tripCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
  arrowIcon: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginHorizontal: 4,
  },
  menuIcon: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  tripDetails: {
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  detailText: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
  },
  dotSeparator: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.xs,
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  badge: {
    backgroundColor: COLORS.statusBadgeGreen,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  badgeText: {
    fontSize: FONTS.sm,
    color: COLORS.statusTextGreen,
    fontWeight: FONTS.medium,
  },
});

export default ConductorHomeScreen;
