import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, SafeAreaView
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import CustomButton from '../../components/CustomButton';

const HomeScreen = ({ navigation }: any) => {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');

  const viajes = [
    {
      id: '1',
      origen: 'Av. Brasil 2241',
      destino: 'Av. Libertad 1348',
      fecha: '10/05/2026',
      hora: '10:00',
      asientos: 2,
    },
    {
      id: '2',
      origen: 'Av. Brasil 2241',
      destino: 'Placeres, Av. Matta 13',
      fecha: '10/05/2026',
      hora: '14:00',
      asientos: 3,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.headerIcon}>☰</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.headerIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Buscar viajes</Text>
        <Text style={styles.subtitle}>Encuentra el mejor viaje que se adapte a ti</Text>

        <View style={styles.filterCard}>
          <View style={styles.filterHeaderRow}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.filterHeaderIcon}>⚙️</Text>
              <Text style={styles.filterTitle}>Filtros de búsqueda</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.clearFilters}>↺ Limpiar filtros</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Origen</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📍</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Origen"
                  value={origen}
                  onChangeText={setOrigen}
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>
            
            <View style={styles.swapIconContainer}>
              <Text style={styles.swapIcon}>⇄</Text>
            </View>

            <View style={styles.inputCol}>
              <Text style={styles.label}>Destino</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📍</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Destino"
                  value={destino}
                  onChangeText={setDestino}
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Fecha</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📅</Text>
                <Text style={styles.inputText}>10/05/2026</Text>
              </View>
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Horario</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🕒</Text>
                <Text style={styles.inputText}>08:00 - 19:00</Text>
              </View>
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Asiento</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>💺</Text>
                <Text style={styles.inputText}>Cualquiera</Text>
              </View>
            </View>
          </View>

          <CustomButton 
            title="Buscar viajes" 
            onPress={() => {}} 
            style={styles.searchButton}
            textStyle={{ color: COLORS.textWhite }}
          />
        </View>

        <Text style={styles.listTitle}>Viajes disponibles</Text>

        {viajes.map((viaje) => (
          <View key={viaje.id} style={styles.tripCard}>
            <View style={styles.tripLeft}>
              <View style={styles.timeline}>
                <View style={styles.dotEmpty} />
                <View style={styles.line} />
                <View style={styles.dotEmpty} />
              </View>
              <View style={styles.locations}>
                <Text style={styles.locationTextBold}>{viaje.origen}</Text>
                <View style={{height: 20}} />
                <Text style={styles.locationTextBold}>{viaje.destino}</Text>
              </View>
            </View>
            <View style={styles.tripRight}>
              <View>
                <Text style={styles.infoText}>📅 {viaje.fecha}</Text>
                <Text style={styles.infoText}>🕒 {viaje.hora}</Text>
                <Text style={styles.infoText}>👥 {viaje.asientos} asientos disponibles</Text>
              </View>
              <TouchableOpacity style={styles.selectButton}>
                <Text style={styles.selectButtonText}>Seleccionar</Text>
              </TouchableOpacity>
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
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  headerIcon: {
    fontSize: 24,
    color: COLORS.primary,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: FONTS.hero,
    fontWeight: FONTS.bold,
    color: COLORS.primary, // Dark blue from mockups
  },
  subtitle: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  filterCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.buttonOutline,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  filterHeaderIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  filterTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
  clearFilters: {
    color: COLORS.successGreen,
    fontWeight: FONTS.bold,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  inputCol: {
    flex: 1,
    marginHorizontal: 4,
  },
  label: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.buttonOutline,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    height: 40,
  },
  inputIcon: {
    marginRight: 4,
    fontSize: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
  },
  inputText: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
  },
  swapIconContainer: {
    marginTop: 20,
  },
  swapIcon: {
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  searchButton: {
    backgroundColor: COLORS.primary, // Use dark blue for primary action here
    marginTop: SPACING.sm,
  },
  listTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  tripCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.buttonOutline,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  tripLeft: {
    flex: 1,
    flexDirection: 'row',
    borderRightWidth: 1,
    borderRightColor: COLORS.buttonOutline,
    paddingRight: SPACING.sm,
  },
  timeline: {
    alignItems: 'center',
    marginRight: SPACING.sm,
    paddingVertical: 4,
  },
  dotEmpty: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.successGreen,
    backgroundColor: COLORS.background,
  },
  line: {
    width: 2,
    height: 30,
    backgroundColor: COLORS.successGreen,
  },
  locations: {
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  locationTextBold: {
    fontSize: FONTS.md,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
  tripRight: {
    flex: 1,
    paddingLeft: SPACING.md,
    justifyContent: 'space-between',
  },
  infoText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  selectButton: {
    backgroundColor: '#A8E6CF', // Light green
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: SPACING.lg,
  },
  selectButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
});

export default HomeScreen;
