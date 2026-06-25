import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { CreditCard, Calendar, Lock, User, ShieldCheck, IdCard } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import ScreenHeader from '../components/ScreenHeader';
import StyledInput from '../components/StyledInput';
import PrimaryButton from '../components/PrimaryButton';
import { paymentService } from '../services/paymentService';

export default function AddPaymentMethodScreen() {
  const navigation = useNavigation();

  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [rut, setRut] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!number || !name || !expiry || !cvv || !rut) {
      Alert.alert('Faltan datos', 'Completa todos los campos de la tarjeta.');
      return;
    }
    setSaving(true);
    const res = await paymentService.saveCard({
      number,
      holderName: name,
      expiry,
      cvv,
      rut,
    });
    setSaving(false);
    if (res.success) {
      Alert.alert('Tarjeta guardada', 'Tu tarjeta quedó guardada. No se hizo ningún cobro; se cobrará solo al iniciar un viaje.', [
        { text: 'Listo', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('No se pudo guardar', res.error || 'Revisa los datos de la tarjeta.');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Agregar Tarjeta" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Card Preview */}
          <View style={styles.cardPreview}>
            <View style={styles.cardPreviewLogo}>
              <View style={[styles.circle, styles.circleOrange]} />
              <View style={[styles.circle, styles.circleRed]} />
            </View>
            <View style={styles.cardPreviewDetails}>
              <Text style={styles.cardPreviewNumber}>{number || '•••• •••• •••• ••••'}</Text>
              <View style={styles.cardPreviewFooter}>
                <View>
                  <Text style={styles.cardPreviewLabel}>TITULAR</Text>
                  <Text style={styles.cardPreviewValue}>{name || 'NOMBRE APELLIDO'}</Text>
                </View>
                <View>
                  <Text style={styles.cardPreviewLabel}>EXPIRA</Text>
                  <Text style={styles.cardPreviewValue}>{expiry || 'MM/AA'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <StyledInput
              label="Número de tarjeta"
              placeholder="0000 0000 0000 0000"
              keyboardType="numeric"
              maxLength={19}
              value={number}
              onChangeText={setNumber}
              icon={<CreditCard color={COLORS.iconGrey} size={20} />}
            />

            <StyledInput
              label="Nombre del titular"
              placeholder="Como aparece en la tarjeta"
              value={name}
              onChangeText={setName}
              icon={<User color={COLORS.iconGrey} size={20} />}
            />

            <View style={styles.row}>
              <View style={styles.expiryField}>
                <StyledInput
                  label="Fecha de exp."
                  placeholder="MM/AA"
                  keyboardType="numeric"
                  maxLength={5}
                  value={expiry}
                  onChangeText={setExpiry}
                  icon={<Calendar color={COLORS.iconGrey} size={20} />}
                />
              </View>
              <View style={styles.flex}>
                <StyledInput
                  label="CVV"
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={4}
                  value={cvv}
                  onChangeText={setCvv}
                  icon={<Lock color={COLORS.iconGrey} size={20} />}
                />
              </View>
            </View>

            <StyledInput
              label="RUT del titular"
              placeholder="12.345.678-9"
              value={rut}
              onChangeText={setRut}
              icon={<IdCard color={COLORS.iconGrey} size={20} />}
            />

            {/* Security Badge */}
            <View style={styles.securityBadge}>
              <ShieldCheck color={COLORS.successGreen} size={20} />
              <Text style={styles.securityText}>No se cobra nada al guardar. El cobro ocurre solo cuando inicias un viaje. Tus datos se tokenizan con Mercado Pago y nunca se guardan en nuestros servidores.</Text>
            </View>
          </View>

        </ScrollView>
        
        <View style={styles.footer}>
          <PrimaryButton
            title={saving ? 'Guardando...' : 'Guardar tarjeta'}
            onPress={handleSave}
            disabled={saving}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING.section,
  },
  cardPreview: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    height: 200,
    justifyContent: 'space-between',
    marginBottom: SPACING.xxl,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardPreviewLogo: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    opacity: 0.8,
  },
  circleOrange: {
    backgroundColor: '#FF5F00',
  },
  circleRed: {
    backgroundColor: '#EB001B',
    marginLeft: -10,
  },
  expiryField: {
    flex: 1,
    marginRight: SPACING.md,
  },
  cardPreviewDetails: {
    marginTop: 'auto',
  },
  cardPreviewNumber: {
    color: COLORS.textWhite,
    fontSize: 22,
    fontWeight: FONTS.bold,
    letterSpacing: 2,
    marginBottom: SPACING.lg,
  },
  cardPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardPreviewLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: FONTS.bold,
    marginBottom: 4,
  },
  cardPreviewValue: {
    color: COLORS.textWhite,
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
    textTransform: 'uppercase',
  },
  formContainer: {
    marginBottom: SPACING.xl,
  },
  row: {
    flexDirection: 'row',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  securityText: {
    flex: 1,
    color: COLORS.successGreen,
    fontSize: FONTS.xs,
    marginLeft: SPACING.sm,
    lineHeight: 18,
  },
  footer: {
    padding: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.background,
  },
});
