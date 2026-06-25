import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, TextInput } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { Calendar, Clock, DollarSign, ShieldCheck } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import ScreenHeader from '../components/ScreenHeader';
import PrimaryButton from '../components/PrimaryButton';
import AddressAutocomplete from '../components/AddressAutocomplete';
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import { supabase } from '../services/supabase';
import { createRouteAndTrip } from '../services/tripsService';
import { geocodeAddress, GeoPoint } from '../services/geocodingService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Región inicial por defecto (Gran Valparaíso) hasta que se geocodifique.
const DEFAULT_REGION = {
  latitude: -33.0472,
  longitude: -71.6127,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export default function OfferRideScreen() {
  const navigation = useNavigation<NavigationProp>();
  const mapRef = useRef<MapView>(null);
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState('1500');
  const [loading, setLoading] = useState(false);
  const [originName, setOriginName] = useState('Av. Brasil 2241 (Casa Central)');
  const [destinationName, setDestinationName] = useState('San Antonio');

  // Coordenadas geocodificadas de origen/destino.
  const [originCoord, setOriginCoord] = useState<GeoPoint | null>(null);
  const [destCoord, setDestCoord] = useState<GeoPoint | null>(null);

  // Ajusta el mapa para mostrar los puntos disponibles.
  const fitToPoints = (a: GeoPoint | null, b: GeoPoint | null) => {
    const points = [a, b].filter(Boolean) as GeoPoint[];
    if (points.length === 0) return;
    if (points.length === 1) {
      mapRef.current?.animateToRegion({
        latitude: points[0].lat,
        longitude: points[0].lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      return;
    }
    mapRef.current?.fitToCoordinates(
      points.map((p) => ({ latitude: p.lat, longitude: p.lng })),
      { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true },
    );
  };

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return d;
  });
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');



  const handlePublish = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Aviso', 'Debes iniciar sesión primero.');
        setLoading(false);
        return;
      }

      // Validar que el usuario sea conductor (rol asignado al validar vehículo).
      const { data: profile, error: profileError } = await supabase
        .from('User')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile || profile.role !== 'DRIVER') {
        Alert.alert(
          'Acción no permitida',
          'Debes ir a la sección "Ser Conductor" para registrar tu vehículo antes de poder publicar un viaje.'
        );
        setLoading(false);
        return;
      }

      // Geocodificar las direcciones reales (usa lo ya resuelto o lo calcula ahora).
      const origin = originCoord ?? (await geocodeAddress(originName));
      const destination = destCoord ?? (await geocodeAddress(destinationName));

      if (!origin) {
        Alert.alert('Origen inválido', 'No pudimos ubicar la dirección de origen. Revísala e intenta de nuevo.');
        setLoading(false);
        return;
      }
      if (!destination) {
        Alert.alert('Destino inválido', 'No pudimos ubicar la dirección de destino. Revísala e intenta de nuevo.');
        setLoading(false);
        return;
      }
      // Persistir las coordenadas resueltas para reflejarlas en el mapa.
      setOriginCoord(origin);
      setDestCoord(destination);

      const res = await createRouteAndTrip(
        user.id,
        originName,
        destinationName,
        origin.lat,
        origin.lng,
        destination.lat,
        destination.lng,
        seats,
        parseInt(price, 10) || 1500,
        selectedDate.toISOString()
      );

      if (res.success) {
        Alert.alert('Éxito', '¡Viaje publicado exitosamente!');
        navigation.navigate('MainTabs', { screen: 'Home' });
      } else {
        Alert.alert('Error', 'Error al publicar: ' + res.error);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Ofrecer un viaje" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Map Preview */}
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_DEFAULT}
              mapType="none"
              style={StyleSheet.absoluteFill}
              initialRegion={DEFAULT_REGION}
            >
              <UrlTile
                urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
                flipY={false}
              />
              {originCoord && (
                <Marker
                  coordinate={{ latitude: originCoord.lat, longitude: originCoord.lng }}
                  title="Origen"
                  description={originName}
                />
              )}
              {destCoord && (
                <Marker
                  coordinate={{ latitude: destCoord.lat, longitude: destCoord.lng }}
                  pinColor="blue"
                  title="Destino"
                  description={destinationName}
                />
              )}
            </MapView>
            <View style={styles.routeCardContainer}>
              <View style={[styles.routeCard, SHADOWS.card]}>
                
                <View style={styles.routePoint}>
                  <View style={styles.routeIconWrapper}>
                    <View style={styles.dotOrigin} />
                  </View>
                  <View style={styles.routeTextWrapper}>
                    <Text style={styles.routeLabel}>Origen</Text>
                    <AddressAutocomplete
                      value={originName}
                      onChangeText={(t) => { setOriginName(t); setOriginCoord(null); }}
                      onSelect={(p) => { setOriginCoord(p); fitToPoints(p, destCoord); }}
                      placeholder="Ej. Casa Central PUCV"
                      inputStyle={styles.routeValueInput}
                    />
                  </View>
                </View>

                <View style={styles.connectingLine} />

                <View style={styles.routePoint}>
                  <View style={styles.routeIconWrapper}>
                    <View style={styles.dotDestination} />
                  </View>
                  <View style={styles.routeTextWrapper}>
                    <Text style={styles.routeLabel}>Destino</Text>
                    <AddressAutocomplete
                      value={destinationName}
                      onChangeText={(t) => { setDestinationName(t); setDestCoord(null); }}
                      onSelect={(p) => { setDestCoord(p); fitToPoints(originCoord, p); }}
                      placeholder="Ej. Viña del Mar"
                      inputStyle={styles.routeValueInput}
                    />
                  </View>
                </View>

              </View>
            </View>
          </View>

          {/* Details Section */}
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>Detalles del viaje</Text>

            <View style={styles.gridContainer}>
              <TouchableOpacity 
                style={[styles.gridItem, SHADOWS.subtle]} 
                onPress={() => { setPickerMode('date'); setShowPicker(true); }}
              >
                <Calendar color={COLORS.primary} size={20} />
                <Text style={styles.gridItemLabel}>FECHA</Text>
                <Text style={styles.gridItemValue}>
                  {selectedDate.toLocaleDateString([], { day: '2-digit', month: 'short' })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.gridItem, SHADOWS.subtle]} 
                onPress={() => { setPickerMode('time'); setShowPicker(true); }}
              >
                <Clock color={COLORS.primary} size={20} />
                <Text style={styles.gridItemLabel}>HORA</Text>
                <Text style={styles.gridItemValue}>
                  {selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Seats Stepper */}
            <View style={styles.stepperSection}>
              <Text style={styles.stepperLabel}>Asientos disponibles</Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity 
                  style={styles.stepperButton}
                  onPress={() => setSeats(Math.max(1, seats - 1))}
                >
                  <Text style={styles.stepperButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{seats}</Text>
                <TouchableOpacity 
                  style={styles.stepperButton}
                  onPress={() => setSeats(Math.min(6, seats + 1))}
                >
                  <Text style={styles.stepperButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Price Section */}
            <View style={styles.priceSection}>
              <Text style={styles.sectionTitle}>Aporte sugerido (por pasajero)</Text>
              <View style={styles.priceContainer}>
                <DollarSign color={COLORS.iconGrey} size={24} />
                <TextInput 
                  style={styles.priceValueInput}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Escrow Banner */}
            <View style={styles.escrowBanner}>
              <ShieldCheck color={COLORS.successGreen} size={24} strokeWidth={2.5} />
              <View style={styles.escrowBannerTextContainer}>
                <Text style={styles.escrowBannerTitle}>Protección de pago</Text>
                <Text style={styles.escrowBannerSub}>El aporte se retiene en custodia y se libera 24h después del viaje si no hay reclamos.</Text>
              </View>
            </View>

          </View>

        </ScrollView>
        
        <View style={styles.footer}>
          <PrimaryButton 
            title={loading ? "Publicando..." : "Publicar viaje"} 
            onPress={handlePublish} 
            disabled={loading}
          />
        </View>

        <DatePicker
          modal
          open={showPicker}
          date={selectedDate}
          mode={pickerMode}
          confirmText="Confirmar"
          cancelText="Cancelar"
          title={pickerMode === 'date' ? "Seleccionar Fecha" : "Seleccionar Hora"}
          buttonColor={COLORS.primary}
          theme="light"
          onConfirm={(date) => {
            setShowPicker(false);
            setSelectedDate(date);
          }}
          onCancel={() => {
            setShowPicker(false);
          }}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.section,
  },
  mapContainer: {
    height: 250,
    backgroundColor: COLORS.lightGrey,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  routeCardContainer: {
    position: 'absolute',
    bottom: -40,
    left: SPACING.xl,
    right: SPACING.xl,
    zIndex: 10,
  },
  routeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIconWrapper: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOrigin: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.textSecondary,
  },
  dotDestination: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  connectingLine: {
    height: 20,
    width: 2,
    backgroundColor: COLORS.border,
    marginLeft: 11,
    marginVertical: 4,
  },
  routeTextWrapper: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: FONTS.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  routeValueInput: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    padding: 0,
    margin: 0,
    height: 20,
  },
  detailsContainer: {
    paddingTop: 60,
    paddingHorizontal: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  gridItem: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  gridItemLabel: {
    fontSize: 10,
    fontWeight: FONTS.bold,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  gridItemValue: {
    fontSize: FONTS.md,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  stepperSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.lightGrey,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xl,
  },
  stepperLabel: {
    fontSize: FONTS.md,
    fontWeight: FONTS.semibold,
    color: COLORS.textPrimary,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepperButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: FONTS.xl,
    color: COLORS.primary,
    fontWeight: FONTS.medium,
  },
  stepperValue: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    width: 30,
    textAlign: 'center',
  },
  priceSection: {
    marginBottom: SPACING.xl,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGrey,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  priceValueInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
    padding: 0,
    margin: 0,
  },
  escrowBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  escrowBannerTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  escrowBannerTitle: {
    color: COLORS.successGreen,
    fontWeight: FONTS.bold,
    fontSize: FONTS.sm,
  },
  escrowBannerSub: {
    color: '#2e7d32',
    fontSize: FONTS.xs,
    marginTop: 2,
    lineHeight: 18,
  },
  footer: {
    padding: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xl,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});
