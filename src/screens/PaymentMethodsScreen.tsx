import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Plus, CreditCard, ShieldCheck, Trash2 } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import ScreenHeader from '../components/ScreenHeader';
import { paymentService, SavedCard } from '../services/paymentService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PaymentMethodsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    const res = await paymentService.listCards();
    setCards(res.success ? res.data || [] : []);
    setLoading(false);
  }, []);

  // Recargar al volver de "Agregar tarjeta".
  useFocusEffect(
    useCallback(() => {
      fetchCards();
    }, [fetchCards]),
  );

  const handleDelete = (card: SavedCard) => {
    Alert.alert('Eliminar tarjeta', `¿Eliminar la tarjeta terminada en ${card.last_four || '••••'}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const res = await paymentService.deleteCard(card.id);
          if (res.success) fetchCards();
          else Alert.alert('Error', res.error || 'No se pudo eliminar la tarjeta.');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Métodos de pago" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Info estilo Uber */}
        <View style={styles.infoBanner}>
          <ShieldCheck color={COLORS.successGreen} size={22} />
          <Text style={styles.infoText}>
            Guarda tu tarjeta sin ningún cobro. Solo se cobra automáticamente cuando inicias un viaje.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Tus tarjetas</Text>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={styles.loading} />
        ) : cards.length === 0 ? (
          <View style={styles.emptyCard}>
            <CreditCard color={COLORS.textSecondary} size={28} />
            <Text style={styles.emptyText}>Aún no tienes tarjetas guardadas.</Text>
          </View>
        ) : (
          cards.map((card) => (
            <View key={card.id} style={styles.cardItem}>
              <View style={styles.cardItemLeft}>
                <View style={styles.cardIconWrapper}>
                  <CreditCard color={COLORS.primary} size={22} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>
                    {(card.brand || 'Tarjeta')} •••• {card.last_four || '••••'}
                  </Text>
                  {card.is_default && <Text style={styles.cardSub}>Predeterminada</Text>}
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(card)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Trash2 color={COLORS.dangerRed} size={20} />
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddPaymentMethod')}>
          <Plus color={COLORS.primary} size={20} strokeWidth={2.5} />
          <Text style={styles.addButtonText}>Agregar tarjeta</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING.section,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xxl,
  },
  infoText: {
    flex: 1,
    color: '#2e7d32',
    fontSize: FONTS.xs,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  loading: {
    marginTop: SPACING.xl,
  },
  emptyCard: {
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xxl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xl,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
    ...SHADOWS.subtle,
  },
  cardItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  cardIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  cardSub: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.borderGrey,
    marginTop: SPACING.sm,
  },
  addButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
});
