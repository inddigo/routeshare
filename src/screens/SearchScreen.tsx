import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, PermissionsAndroid, Alert } from 'react-native';
import DatePicker from 'react-native-date-picker';
import Geolocation from 'react-native-geolocation-service';
import { Calendar, Clock, Search as SearchIcon, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '../components/PrimaryButton';
import AddressAutocomplete from '../components/AddressAutocomplete';
import RouteTimeline from '../components/RouteTimeline';
import { searchService } from '../services/searchService';
import { supabase } from '../services/supabase';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [seats, setSeats] = useState(1);

  // Búsqueda geoespacial "Cerca de mí" (PostGIS)
  const [nearMe, setNearMe] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Ubicación',
          message: 'RouteShare usa tu ubicación para encontrar viajes cercanos a ti.',
          buttonPositive: 'Permitir',
          buttonNegative: 'Cancelar',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    const auth = await Geolocation.requestAuthorization('whenInUse');
    return auth === 'granted';
  };

  const toggleNearMe = async () => {
    if (nearMe) {
      setNearMe(false);
      return;
    }
    setLocating(true);
    const ok = await requestLocationPermission();
    if (!ok) {
      setLocating(false);
      Alert.alert('Permiso denegado', 'Activa el permiso de ubicación para buscar viajes cercanos.');
      return;
    }
    Geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearMe(true);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        Alert.alert('Error de ubicación', err.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };



  const openDatePicker = () => {
    setPickerMode('date');
    setShowPicker(true);
  };

  const openTimePicker = () => {
    setPickerMode('time');
    setShowPicker(true);
  };

  const cycleSeats = () => {
    setSeats(s => (s >= 4 ? 1 : s + 1));
  };
  
  const handleSearch = useCallback(async () => {
    setLoading(true);
    const res = await searchService.searchTrips({
      origen: origin,
      destino: destination,
      fecha: selectedDate.toISOString(),
      origenLat: nearMe && coords ? coords.lat : undefined,
      origenLng: nearMe && coords ? coords.lng : undefined,
      radioMetros: 5000,
    });
    if (res.success) {
      const filtered = (res.data || []).filter((t: any) => t.driver_id !== currentUserId);
      setResults(filtered);
    } else {
      setResults([]);
    }
    setLoading(false);
  }, [origin, destination, selectedDate, nearMe, coords, currentUserId]);

  // Default fetch to show all available
  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xl }]}>
        <Text style={styles.headerTitle}>Buscar viajes</Text>
        <Text style={styles.headerSubtitle}>Encuentra el mejor viaje que se adapte a ti</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Filter Card */}
        <View style={styles.filterCard}>
          
          {/* Location Inputs */}
          <View style={styles.locationInputsContainer}>
            <View style={styles.connectingLine} />
            
            <View style={[styles.inputWrapper, styles.originWrapper]}>
              <View style={styles.dotContainer}>
                <View style={styles.originDot} />
              </View>
              <AddressAutocomplete
                value={origin}
                onChangeText={setOrigin}
                onSelect={() => {}}
                placeholder="Origen"
                containerStyle={styles.autocompleteFlex}
                inputStyle={styles.locationInput}
              />
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.dotContainer}>
                <View style={styles.destinationDot} />
              </View>
              <AddressAutocomplete
                value={destination}
                onChangeText={setDestination}
                onSelect={() => {}}
                placeholder="Destino"
                containerStyle={styles.autocompleteFlex}
                inputStyle={styles.locationInput}
              />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Cerca de mí (PostGIS) */}
          <TouchableOpacity
            style={[styles.nearMeChip, nearMe && styles.nearMeChipActive]}
            onPress={toggleNearMe}
            disabled={locating}
            activeOpacity={0.8}
          >
            {locating ? (
              <ActivityIndicator size="small" color={nearMe ? COLORS.textWhite : COLORS.primary} />
            ) : (
              <MapPin color={nearMe ? COLORS.textWhite : COLORS.primary} size={16} strokeWidth={2.5} />
            )}
            <Text style={[styles.nearMeChipText, nearMe && styles.nearMeChipTextActive]}>
              Cerca de mí (5 km)
            </Text>
          </TouchableOpacity>

          {/* Details Row */}
          <View style={styles.detailsRow}>
            <TouchableOpacity style={styles.detailBox} onPress={openDatePicker}>
              <Calendar color={COLORS.primary} size={20} />
              <Text style={styles.detailLabel}>FECHA</Text>
              <Text style={styles.detailValue}>
                {selectedDate.toLocaleDateString([], { day: '2-digit', month: 'short' })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailBox} onPress={openTimePicker}>
              <Clock color={COLORS.primary} size={20} />
              <Text style={styles.detailLabel}>HORARIO</Text>
              <Text style={styles.detailValue}>
                {selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailBox} onPress={cycleSeats}>
              <Text style={styles.detailIconText}>💺</Text>
              <Text style={styles.detailLabel}>ASIENTOS</Text>
              <Text style={styles.detailValue}>{seats}</Text>
            </TouchableOpacity>
          </View>

          <PrimaryButton 
            title="Buscar viajes"
            onPress={handleSearch}
            variant="secondary"
            icon={<SearchIcon color={COLORS.textPrimary} size={20} strokeWidth={2.5} />}
            style={styles.searchButton}
            disabled={loading}
          />
          
        <DatePicker
          modal
          open={showPicker}
          date={selectedDate}
          mode={pickerMode}
          title={pickerMode === 'date' ? "Seleccionar Fecha" : "Seleccionar Hora"}
          confirmText="Confirmar"
          cancelText="Cancelar"
          onConfirm={(date) => {
            setShowPicker(false);
            setSelectedDate(date);
          }}
          onCancel={() => {
            setShowPicker(false);
          }}
        />
        </View>

        {/* Results List */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Viajes disponibles</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
          ) : results.length > 0 ? (
            results.map((viaje) => (
              <RideCard 
                key={viaje.id}
                origin={viaje.origin_name || "Origen"}
                destination={viaje.destination_name || "Destino"}
                date={new Date(viaje.departure_datetime || viaje.fecha_hora).toLocaleDateString()}
                time={new Date(viaje.departure_datetime || viaje.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                seats={viaje.available_seats || viaje.asientos_disponibles}
                onPress={() => navigation.navigate('TripDetails', { viajeId: viaje.id })}
              />
            ))
          ) : (
            <Text style={styles.emptyResultsText}>No se encontraron viajes para esta búsqueda.</Text>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

// RideCard Sub-component
function RideCard({ origin, destination, date, time, seats, onPress }: any) {
  return (
    <View style={[styles.rideCard, SHADOWS.subtle]}>
      <View style={styles.rideCardHeader}>
        
        {/* Left Side: Route */}
        <View style={styles.rideRoute}>
           <RouteTimeline origin={origin} destination={destination} />
        </View>

        {/* Right Side: Details */}
        <View style={styles.rideDetails}>
          <View style={styles.rideDetailChip}>
            <Calendar color={COLORS.primary} size={14} />
            <Text style={styles.rideDetailChipText}>{date}</Text>
          </View>
          <View style={styles.rideDetailChip}>
            <Clock color={COLORS.primary} size={14} />
            <Text style={styles.rideDetailChipText}>{time}</Text>
          </View>
          <View style={styles.rideDetailChip}>
            <Text style={styles.seatEmoji}>💺</Text>
            <Text style={styles.rideDetailChipText}>{seats}</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.selectButton} onPress={onPress}>
        <Text style={styles.selectButtonText}>Seleccionar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingIndicator: {
    marginTop: 20,
  },
  emptyResultsText: {
    color: COLORS.textSecondary,
    marginTop: 10,
  },
  seatEmoji: {
    fontSize: 10,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING.section,
  },
  filterCard: {
    backgroundColor: COLORS.lightGrey,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  locationInputsContainer: {
    position: 'relative',
    paddingLeft: SPACING.sm,
  },
  connectingLine: {
    position: 'absolute',
    left: 25,
    top: 20,
    bottom: 20,
    width: 2,
    backgroundColor: COLORS.borderGrey,
    borderRadius: 1,
    zIndex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  // El origen debe quedar por encima del destino para que su desplegable de
  // sugerencias no quede tapado.
  originWrapper: {
    zIndex: 20,
    elevation: 20,
  },
  autocompleteFlex: {
    flex: 1,
  },
  dotContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  originDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.textSecondary,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  locationInput: {
    flex: 1,
    height: 48,
    fontSize: FONTS.md,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xl,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  detailBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: FONTS.bold,
    marginTop: SPACING.sm,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  detailIconText: {
    fontSize: 16,
  },
  searchButton: {
    marginTop: SPACING.xl,
  },
  nearMeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  nearMeChipActive: {
    backgroundColor: COLORS.primary,
  },
  nearMeChipText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
  nearMeChipTextActive: {
    color: COLORS.textWhite,
  },
  resultsContainer: {
    gap: SPACING.md,
  },
  resultsTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  rideCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  rideCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rideRoute: {
    flex: 1,
  },
  rideDetails: {
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  rideDetailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.lightGrey,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    minWidth: 80,
  },
  rideDetailChipText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.semibold,
    color: COLORS.textPrimary,
  },
  selectButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  selectButtonText: {
    color: COLORS.textWhite,
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
  },
});
