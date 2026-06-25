import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Car, CreditCard, ShieldAlert, Upload, Camera, CheckCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import ScreenHeader from '../components/ScreenHeader';
import StyledInput from '../components/StyledInput';
import PrimaryButton from '../components/PrimaryButton';
import { launchImageLibrary } from 'react-native-image-picker';
import { supabase } from '../services/supabase';
import { uploadDocument, submitDriverValidation } from '../services/validationService';

export default function DriverValidationScreen() {
  const navigation = useNavigation();

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  
  type DocAsset = { uri: string; base64: string; mimeType: string };
  const [licenseDoc, setLicenseDoc] = useState<DocAsset | null>(null);
  const [padronDoc, setPadronDoc] = useState<DocAsset | null>(null);
  const [loading, setLoading] = useState(false);

  const licenseUri = licenseDoc?.uri ?? null;
  const padronUri = padronDoc?.uri ?? null;

  const pickImage = async (type: 'license' | 'padron') => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.5,
        includeBase64: true,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Error al abrir la galería');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri && asset.base64) {
          const doc: DocAsset = {
            uri: asset.uri,
            base64: asset.base64,
            mimeType: asset.type || 'image/jpeg',
          };
          if (type === 'license') setLicenseDoc(doc);
          else setPadronDoc(doc);
        } else {
          Alert.alert('Error', 'No se pudo leer la imagen seleccionada.');
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleSubmit = async () => {
    if (!brand || !model || !plate) {
      Alert.alert('Aviso', 'Por favor ingresa todos los datos del vehículo.');
      return;
    }
    if (!licenseDoc || !padronDoc) {
      Alert.alert('Aviso', 'Debes subir la foto de tu licencia y padrón.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Debes iniciar sesión primero');

      // Upload License
      const licenseRes = await uploadDocument(licenseDoc.base64, `license_${user.id}`, licenseDoc.mimeType);
      if (!licenseRes.success) throw new Error(licenseRes.error || 'Error subiendo licencia');

      // Upload Padron
      const padronRes = await uploadDocument(padronDoc.base64, `padron_${user.id}`, padronDoc.mimeType);
      if (!padronRes.success) throw new Error(padronRes.error || 'Error subiendo padrón');

      // Submit Data
      const submitRes = await submitDriverValidation(
        user.id,
        brand,
        model,
        plate,
        licenseRes.url as string,
        padronRes.url as string
      );

      if (!submitRes.success) throw new Error(submitRes.error || 'Error al guardar los datos');

      Alert.alert('¡Éxito!', 'Tus documentos han sido enviados a revisión. Te notificaremos cuando tu perfil de conductor sea aprobado.', [
        { text: 'Entendido', onPress: () => navigation.goBack() }
      ]);

    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Registro de Conductor" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Warning Banner */}
          <View style={styles.warningBanner}>
            <ShieldAlert color="#E65100" size={24} />
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningTitle}>Acción requerida</Text>
              <Text style={styles.warningText}>Para garantizar la seguridad de la comunidad, necesitamos validar tu identidad y vehículo.</Text>
            </View>
          </View>

          {/* Vehículo Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos del vehículo</Text>
            
            <View style={styles.row}>
              <View style={styles.fieldHalfLeft}>
                <StyledInput
                  label="Marca"
                  placeholder="Ej. Toyota"
                  value={brand}
                  onChangeText={setBrand}
                  icon={<Car color={COLORS.iconGrey} size={20} />}
                />
              </View>
              <View style={styles.flex}>
                <StyledInput
                  label="Modelo"
                  placeholder="Ej. Yaris"
                  value={model}
                  onChangeText={setModel}
                />
              </View>
            </View>

            <StyledInput
              label="Patente"
              placeholder="AB-CD-12"
              value={plate}
              onChangeText={setPlate}
              autoCapitalize="characters"
              icon={<CreditCard color={COLORS.iconGrey} size={20} />}
            />
          </View>

          {/* Documentos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documentos</Text>

            <View style={styles.uploadCard}>
              <View style={styles.uploadHeader}>
                <View>
                  <Text style={styles.uploadTitle}>Licencia de Conducir</Text>
                  <Text style={styles.uploadSub}>Foto frontal clara y legible</Text>
                </View>
                {licenseUri && <CheckCircle color={COLORS.primary} size={24} />}
              </View>
              <View style={styles.uploadActions}>
                <TouchableOpacity 
                  style={licenseUri ? styles.uploadButtonOutline : styles.uploadButton} 
                  onPress={() => pickImage('license')}
                >
                  {licenseUri ? <Upload color={COLORS.textPrimary} size={20} /> : <Camera color={COLORS.textWhite} size={20} />}
                  <Text style={licenseUri ? styles.uploadButtonTextOutline : styles.uploadButtonText}>
                    {licenseUri ? 'Cambiar foto' : 'Subir foto'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.uploadCard}>
              <View style={styles.uploadHeader}>
                <View>
                  <Text style={styles.uploadTitle}>Padrón del Vehículo</Text>
                  <Text style={styles.uploadSub}>Documento vigente</Text>
                </View>
                {padronUri && <CheckCircle color={COLORS.primary} size={24} />}
              </View>
              <View style={styles.uploadActions}>
                <TouchableOpacity 
                  style={padronUri ? styles.uploadButtonOutline : styles.uploadButton} 
                  onPress={() => pickImage('padron')}
                >
                  {padronUri ? <Upload color={COLORS.textPrimary} size={20} /> : <Camera color={COLORS.textWhite} size={20} />}
                  <Text style={padronUri ? styles.uploadButtonTextOutline : styles.uploadButtonText}>
                    {padronUri ? 'Cambiar foto' : 'Subir foto'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>

        </ScrollView>
        
        <View style={styles.footer}>
          <PrimaryButton 
            title={loading ? "Enviando..." : "Enviar para revisión"} 
            onPress={handleSubmit} 
            disabled={loading}
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
  fieldHalfLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING.section,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    marginBottom: SPACING.xxl,
  },
  warningTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  warningTitle: {
    color: '#E65100',
    fontWeight: FONTS.bold,
    fontSize: FONTS.sm,
  },
  warningText: {
    color: '#F57C00',
    fontSize: FONTS.xs,
    marginTop: 2,
    lineHeight: 18,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
  },
  uploadCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  uploadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  uploadTitle: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  uploadSub: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  uploadActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  uploadButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.xs,
    fontWeight: FONTS.bold,
  },
  uploadButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  uploadButtonTextOutline: {
    color: COLORS.textPrimary,
    fontSize: FONTS.xs,
    fontWeight: FONTS.bold,
  },
  footer: {
    padding: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.background,
  },
});
