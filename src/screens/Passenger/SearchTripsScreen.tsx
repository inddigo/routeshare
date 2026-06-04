// src/screens/Passenger/SearchTripsScreen.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Platform, ScrollView,
  StatusBar,
} from 'react-native';
import { searchService, COMMON_DESTINATIONS } from '../../services/searchService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const SearchTripsScreen = ({ navigation }: any) => {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [asientos, setAsientos] = useState(1);
  const [viajes, setViajes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    const { success, data } = await searchService.searchTrips({
      origen,
      destino,
      fecha: fecha || undefined,
      horaInicio: horaInicio || undefined,
      horaFin: horaFin || undefined,
    });
    if (success && data) {
      // Client-side seat filter
      const filtered = data.filter((v: any) => v.asientos_disponibles >= asientos);
      setViajes(filtered);
    } else {
      setViajes([]);
    }
    setLoading(false);
  }, [origen, destino, fecha, horaInicio, horaFin, asientos]);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSwapLocations = useCallback(() => {
    setOrigen((prev) => {
      setDestino(origen);
      return destino;
    });
  }, [origen, destino]);

  const handleClearFilters = useCallback(() => {
    setOrigen('');
    setDestino('');
    setFecha('');
    setHoraInicio('');
    setHoraFin('');
    setAsientos(1);
  }, []);

  const incrementSeats = useCallback(() => {
    setAsientos((prev) => Math.min(prev + 1, 8));
  }, []);

  const decrementSeats = useCallback(() => {
    setAsientos((prev) => Math.max(prev - 1, 1));
  }, []);

  const getLocationLabel = useCallback((ruta: any, type: 'origen' | 'destino') => {
    if (!ruta) return 'Ubicación';
    const lat = type === 'origen' ? ruta.origen_lat : ruta.destino_lat;
    const lng = type === 'origen' ? ruta.origen_lng : ruta.destino_lng;
    // Try to match to a common destination name
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }, []);

  const renderHeader = useCallback(() => (
    <View>
      {/* Decorative Header */}
      <View style={styles.heroSection}>
        <View style={styles.heroDecoration}>
          <Text style={styles.heroEmoji}>🚗</Text>
          <View style={styles.routeDots}>
            <View style={[styles.dot, styles.dotGreen]} />
            <View style={styles.dotLine} />
            <View style={[styles.dot, styles.dotBlue]} />
            <View style={styles.dotLine} />
            <View style={[styles.dot, styles.dotRed]} />
          </View>
        </View>
        <Text style={styles.heroTitle}>Buscar viajes</Text>
        <Text style={styles.heroSubtitle}>
          Encuentra el mejor viaje que se adapte a ti
        </Text>
      </View>

      {/* Filter Card */}
      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>Filtros de búsqueda</Text>

        {/* Origin */}
        <View style={styles.inputRow}>
          <Text style={styles.inputIcon}>📍</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="Seleccione punto de origen"
            placeholderTextColor={COLORS.textMuted}
            value={origen}
            onChangeText={setOrigen}
          />
        </View>

        {/* Swap Button */}
        <TouchableOpacity
          style={styles.swapButton}
          onPress={handleSwapLocations}
          activeOpacity={0.7}
        >
          <Text style={styles.swapIcon}>⇅</Text>
        </TouchableOpacity>

        {/* Destination */}
        <View style={styles.inputRow}>
          <Text style={[styles.inputIcon, styles.inputIconRed]}>📍</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="Seleccione punto de destino"
            placeholderTextColor={COLORS.textMuted}
            value={destino}
            onChangeText={setDestino}
          />
        </View>

        {/* Divider */}
        <View style={styles.filterDivider} />

        {/* Date */}
        <View style={styles.inputRow}>
          <Text style={styles.inputIcon}>📅</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="Fecha (YYYY-MM-DD)"
            placeholderTextColor={COLORS.textMuted}
            value={fecha}
            onChangeText={setFecha}
          />
        </View>

        {/* Time Range */}
        <View style={styles.timeRow}>
          <View style={[styles.inputRow, styles.timeInput]}>
            <Text style={styles.inputIcon}>⏰</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Desde"
              placeholderTextColor={COLORS.textMuted}
              value={horaInicio}
              onChangeText={setHoraInicio}
            />
          </View>
          <Text style={styles.timeSeparator}>—</Text>
          <View style={[styles.inputRow, styles.timeInput]}>
            <TextInput
              style={styles.filterInput}
              placeholder="Hasta"
              placeholderTextColor={COLORS.textMuted}
              value={horaFin}
              onChangeText={setHoraFin}
            />
          </View>
        </View>

        {/* Seats */}
        <View style={styles.seatsRow}>
          <View style={styles.seatsLabel}>
            <Text style={styles.inputIcon}>💺</Text>
            <Text style={styles.seatsText}>Asientos</Text>
          </View>
          <View style={styles.seatsControl}>
            <TouchableOpacity
              style={styles.seatBtn}
              onPress={decrementSeats}
              activeOpacity={0.7}
            >
              <Text style={styles.seatBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.seatsCount}>{asientos}</Text>
            <TouchableOpacity
              style={styles.seatBtn}
              onPress={incrementSeats}
              activeOpacity={0.7}
            >
              <Text style={styles.seatBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Clear Filters */}
        <TouchableOpacity
          style={styles.clearFiltersBtn}
          onPress={handleClearFilters}
          activeOpacity={0.7}
        >
          <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
        </TouchableOpacity>

        {/* Search Button */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          activeOpacity={0.8}
        >
          <Text style={styles.searchButtonText}>Buscar viajes</Text>
        </TouchableOpacity>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Viajes disponibles</Text>
        {searched && !loading && (
          <Text style={styles.resultsCount}>
            {viajes.length} resultado{viajes.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </View>
  ), [origen, destino, fecha, horaInicio, horaFin, asientos, viajes.length, searched, loading, handleSwapLocations, handleClearFilters, handleSearch, incrementSeats, decrementSeats]);

  const renderViaje = useCallback(({ item }: { item: any }) => {
    const conductor = item.usuarios;
    const ruta = item.rutas;
    const fechaObj = new Date(item.fecha_hora);
    const fechaFormat = fechaObj.toLocaleDateString('es-CL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    const horaFormat = fechaObj.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const origenLabel = getLocationLabel(ruta, 'origen');
    const destinoLabel = getLocationLabel(ruta, 'destino');

    return (
      <View style={styles.tripCard}>
        {/* Route Info */}
        <View style={styles.tripRoute}>
          <View style={styles.routeLineContainer}>
            <View style={styles.routeCircleGreen} />
            <View style={styles.routeLineGreen} />
            <View style={styles.routeCircleRed} />
          </View>
          <View style={styles.routeLabels}>
            <Text style={styles.routeLabel} numberOfLines={1}>{origenLabel}</Text>
            <Text style={styles.routeLabel} numberOfLines={1}>{destinoLabel}</Text>
          </View>
        </View>

        {/* Trip Meta */}
        <View style={styles.tripMeta}>
          <View style={styles.tripMetaRow}>
            <Text style={styles.metaIcon}>📅</Text>
            <Text style={styles.metaText}>{fechaFormat}</Text>
          </View>
          <View style={styles.tripMetaRow}>
            <Text style={styles.metaIcon}>🕒</Text>
            <Text style={styles.metaText}>{horaFormat}</Text>
          </View>
          <View style={styles.seatsBadge}>
            <Text style={styles.seatsBadgeText}>
              💺 {item.asientos_disponibles} disponible{item.asientos_disponibles !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Driver + Action */}
        <View style={styles.tripFooter}>
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>
                {conductor?.nombre?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View>
              <Text style={styles.driverName} numberOfLines={1}>
                {conductor?.nombre} {conductor?.apellido_paterno}
              </Text>
              <Text style={styles.driverRating}>
                ★ {conductor?.reputacion_promedio?.toFixed(1) || '5.0'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => navigation.navigate('TripDetail', { viaje: item })}
            activeOpacity={0.8}
          >
            <Text style={styles.selectButtonText}>Seleccionar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [navigation, getLocationLabel]);

  const renderEmpty = useCallback(() => {
    if (!searched) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>😞</Text>
        <Text style={styles.emptyTitle}>No se encontraron resultados</Text>
        <Text style={styles.emptySubtitle}>
          Vuelve a intentarlo con otros filtros
        </Text>
      </View>
    );
  }, [searched]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lightBackground} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryBlue} />
          <Text style={styles.loadingText}>Buscando viajes...</Text>
        </View>
      ) : (
        <FlatList
          data={viajes}
          keyExtractor={(item) => item.id}
          renderItem={renderViaje}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingBottom: SPACING.section,
  },

  // Hero Section
  heroSection: {
    backgroundColor: COLORS.cardBackground,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    ...SHADOWS.subtle,
  },
  heroDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  heroEmoji: {
    fontSize: 40,
    marginRight: SPACING.md,
  },
  routeDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotGreen: {
    backgroundColor: COLORS.successGreen,
  },
  dotBlue: {
    backgroundColor: COLORS.primaryBlue,
  },
  dotRed: {
    backgroundColor: COLORS.danger,
  },
  dotLine: {
    width: 24,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 2,
  },
  heroTitle: {
    fontSize: FONTS.xxxl,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Filter Card
  filterCard: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    ...SHADOWS.card,
  },
  filterTitle: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.md : SPACING.xs,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  inputIconRed: {
    // The red pin is just emoji coloring, no extra style needed
  },
  filterInput: {
    flex: 1,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? SPACING.xs : 0,
  },
  swapButton: {
    alignSelf: 'center',
    backgroundColor: COLORS.lightBackground,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  swapIcon: {
    fontSize: 18,
    color: COLORS.primaryBlue,
    fontWeight: FONTS.bold,
  },
  filterDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  timeInput: {
    flex: 1,
    marginBottom: 0,
  },
  timeSeparator: {
    marginHorizontal: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: FONTS.lg,
  },
  seatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  seatsLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatsText: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  seatsControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.buttonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatBtnText: {
    color: COLORS.textWhite,
    fontSize: FONTS.xl,
    fontWeight: FONTS.bold,
    lineHeight: 22,
  },
  seatsCount: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.semibold,
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.lg,
    minWidth: 20,
    textAlign: 'center',
  },
  clearFiltersBtn: {
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  clearFiltersText: {
    fontSize: FONTS.md,
    color: COLORS.textLink,
    fontWeight: FONTS.medium,
  },
  searchButton: {
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  searchButtonText: {
    color: COLORS.textWhite,
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
  },

  // Results Section
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xxl,
    marginBottom: SPACING.md,
  },
  resultsTitle: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  resultsCount: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },

  // Trip Card
  tripCard: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  tripRoute: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  routeLineContainer: {
    alignItems: 'center',
    marginRight: SPACING.md,
    paddingVertical: 2,
  },
  routeCircleGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.successGreen,
  },
  routeLineGreen: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.successGreen,
    marginVertical: 2,
    minHeight: 20,
  },
  routeCircleRed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.danger,
  },
  routeLabels: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 0,
  },
  routeLabel: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    fontWeight: FONTS.medium,
  },
  tripMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  tripMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  metaText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  seatsBadge: {
    backgroundColor: COLORS.statusConfirmed,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  seatsBadgeText: {
    fontSize: FONTS.xs,
    color: COLORS.statusTextGreen,
    fontWeight: FONTS.semibold,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.md,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  driverAvatarText: {
    color: COLORS.textWhite,
    fontSize: FONTS.md,
    fontWeight: FONTS.bold,
  },
  driverName: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    fontWeight: FONTS.medium,
    maxWidth: 140,
  },
  driverRating: {
    fontSize: FONTS.xs,
    color: COLORS.warning,
    fontWeight: FONTS.semibold,
  },
  selectButton: {
    backgroundColor: COLORS.accentGreen,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
  },
  selectButtonText: {
    color: COLORS.textWhite,
    fontSize: FONTS.md,
    fontWeight: FONTS.bold,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.section,
    paddingHorizontal: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default React.memo(SearchTripsScreen);
