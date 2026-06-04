// src/screens/Driver/DriverRegistrationScreen.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { supabase } from '../../services/supabase';
import { driverService } from '../../services/driverService';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DriverRegistration'>;

interface UploadedFile {
  name: string;
  size: string;
}

const TOTAL_STEPS = 4;

const DriverRegistrationScreen = ({ navigation }: Props) => {
  // Step state
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 – Información personal
  const [rut, setRut] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');

  // Step 2 – Documentos
  const [licenciaFile, setLicenciaFile] = useState<UploadedFile | null>(null);
  const [hojaVidaFile, setHojaVidaFile] = useState<UploadedFile | null>(null);

  // Step 3 – Vehículo
  const [patente, setPatente] = useState('');
  const [modelo, setModelo] = useState('');
  const [capacidad, setCapacidad] = useState(4);
  const [padronFile, setPadronFile] = useState<UploadedFile | null>(null);

  // General
  const [loading, setLoading] = useState(false);

  // ── Progress helpers ─────────────────────────────────────────
  const progressPercentage = useMemo(() => (currentStep / TOTAL_STEPS) * 100, [currentStep]);

  // ── Mock file upload ─────────────────────────────────────────
  const handleMockUpload = useCallback((label: string, setter: (f: UploadedFile) => void) => {
    const mockNames: Record<string, string> = {
      licencia: 'licencia_conducir_2026.pdf',
      hojaVida: 'hoja_vida_conductor.pdf',
      padron: 'padron_vehicular.pdf',
    };
    const key = label === 'licencia' ? 'licencia' : label === 'hojaVida' ? 'hojaVida' : 'padron';
    Alert.alert(
      'Archivo seleccionado',
      `Se ha seleccionado: ${mockNames[key]}`,
      [{
        text: 'Aceptar',
        onPress: () => setter({ name: mockNames[key], size: '1.5 mb' }),
      }],
    );
  }, []);

  // ── Capacity stepper ─────────────────────────────────────────
  const incrementCapacity = useCallback(() => {
    setCapacidad(prev => Math.min(prev + 1, 8));
  }, []);

  const decrementCapacity = useCallback(() => {
    setCapacidad(prev => Math.max(prev - 1, 1));
  }, []);

  // ── Step validation ──────────────────────────────────────────
  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        if (!rut || !nombres || !apellidos || !telefono || !correo) {
          Alert.alert('Campos incompletos', 'Por favor completa todos los campos personales.');
          return false;
        }
        if (!correo.endsWith('@mail.pucv.cl') && !correo.endsWith('@pucv.cl')) {
          Alert.alert('Correo inválido', 'Debes usar tu correo institucional @mail.pucv.cl');
          return false;
        }
        return true;
      case 2:
        if (!licenciaFile || !hojaVidaFile) {
          Alert.alert('Documentos pendientes', 'Debes subir ambos documentos para continuar.');
          return false;
        }
        return true;
      case 3:
        if (!patente || !modelo) {
          Alert.alert('Campos incompletos', 'Por favor completa la patente y el modelo del vehículo.');
          return false;
        }
        return true;
      default:
        return true;
    }
  }, [rut, nombres, apellidos, telefono, correo, licenciaFile, hojaVidaFile, patente, modelo]);

  const goNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    }
  }, [currentStep, validateStep]);

  const goBack = useCallback(() => {
    if (currentStep === 1) {
      navigation.goBack();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, navigation]);

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Mock URLs from "uploaded" files
      const licenciaUrl = `https://storage.routeshare.cl/docs/${licenciaFile?.name}`;
      const hojaVidaUrl = `https://storage.routeshare.cl/docs/${hojaVidaFile?.name}`;
      const padronUrl = padronFile ? `https://storage.routeshare.cl/docs/${padronFile.name}` : '';

      // 1. Registrar conductor
      const condRes = await driverService.registerDriver(user.id, licenciaUrl, hojaVidaUrl);
      if (!condRes.success) throw new Error(condRes.error);

      // 2. Registrar vehículo
      const vehRes = await driverService.registerVehicle(
        condRes.data.id,
        patente.toUpperCase(),
        modelo,
        capacidad,
        padronUrl,
      );
      if (!vehRes.success) throw new Error(vehRes.error);

      Alert.alert(
        '¡Postulación Enviada!',
        'Tus documentos están siendo revisados. Te notificaremos cuando tu perfil sea aprobado.',
        [{ text: 'Entendido', onPress: () => navigation.goBack() }],
      );
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [licenciaFile, hojaVidaFile, padronFile, patente, modelo, capacidad, navigation]);

  // ── Render helpers ───────────────────────────────────────────
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🚗 RouteShare</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
        </View>
        <Text style={styles.progressLabel}>Paso {currentStep} de {TOTAL_STEPS}</Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Información personal</Text>
      <Text style={styles.stepSubtitle}>Completa tus datos para el registro como conductor.</Text>

      {/* Info banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerIcon}>ℹ️</Text>
        <Text style={styles.infoBannerText}>
          Tu correo debe ser institucional terminado en @mail.pucv.cl para validar tu identidad universitaria.
        </Text>
      </View>

      <Text style={styles.inputLabel}>Rut</Text>
      <TextInput
        style={styles.input}
        placeholder="12.345.678-9"
        placeholderTextColor={COLORS.textMuted}
        value={rut}
        onChangeText={setRut}
        autoCorrect={false}
      />

      <Text style={styles.inputLabel}>Nombres</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingresa tus nombres"
        placeholderTextColor={COLORS.textMuted}
        value={nombres}
        onChangeText={setNombres}
      />

      <Text style={styles.inputLabel}>Apellidos</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingresa tus apellidos"
        placeholderTextColor={COLORS.textMuted}
        value={apellidos}
        onChangeText={setApellidos}
      />

      <Text style={styles.inputLabel}>Teléfono</Text>
      <View style={styles.phoneRow}>
        <View style={styles.phonePrefix}>
          <Text style={styles.phonePrefixText}>🇨🇱 +56</Text>
        </View>
        <TextInput
          style={[styles.input, styles.phoneInput]}
          placeholder="9 1234 5678"
          placeholderTextColor={COLORS.textMuted}
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
          maxLength={9}
        />
      </View>

      <Text style={styles.inputLabel}>Correo institucional</Text>
      <TextInput
        style={styles.input}
        placeholder="nombre.apellido@mail.pucv.cl"
        placeholderTextColor={COLORS.textMuted}
        value={correo}
        onChangeText={setCorreo}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
      />
    </View>
  );

  const renderDocumentCard = (
    title: string,
    uploadKey: string,
    file: UploadedFile | null,
    setter: (f: UploadedFile) => void,
  ) => (
    <View style={styles.documentCard} key={title}>
      <View style={styles.documentCardHeader}>
        <View style={styles.docIconContainer}>
          <Text style={styles.docIcon}>📄</Text>
        </View>
        <View style={styles.docInfo}>
          <Text style={styles.docTitle}>{title}</Text>
          <Text style={styles.docFormat}>Formato PDF · Máx. 10 mb</Text>
        </View>
      </View>

      {file ? (
        <View style={styles.uploadedRow}>
          <View style={styles.uploadedInfo}>
            <Text style={styles.uploadedCheck}>✅</Text>
            <View>
              <Text style={styles.uploadedName}>{file.name}</Text>
              <Text style={styles.uploadedSize}>{file.size}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => handleMockUpload(uploadKey, setter)}>
            <Text style={styles.changeFileText}>Cambiar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => handleMockUpload(uploadKey, setter)}
        >
          <Text style={styles.uploadButtonIcon}>📎</Text>
          <Text style={styles.uploadButtonText}>Subir archivo</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Documentos del conductor</Text>
      <Text style={styles.stepSubtitle}>
        Sube los siguientes documentos en formato PDF.{'\n'}Deben estar vigentes y legibles.
      </Text>

      {renderDocumentCard('Licencia de conducir vigente', 'licencia', licenciaFile, setLicenciaFile)}
      {renderDocumentCard('Hoja de vida del conductor', 'hojaVida', hojaVidaFile, setHojaVidaFile)}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Información del vehículo</Text>
      <Text style={styles.stepSubtitle}>Ingresa los datos de tu vehículo.</Text>

      <Text style={styles.inputLabel}>Patente</Text>
      <TextInput
        style={styles.input}
        placeholder="ABCD12"
        placeholderTextColor={COLORS.textMuted}
        value={patente}
        onChangeText={setPatente}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
      />

      <Text style={styles.inputLabel}>Modelo</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Toyota Yaris 2020"
        placeholderTextColor={COLORS.textMuted}
        value={modelo}
        onChangeText={setModelo}
      />

      <Text style={styles.inputLabel}>Capacidad de pasajeros</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity style={styles.stepperButton} onPress={decrementCapacity}>
          <Text style={styles.stepperButtonText}>−</Text>
        </TouchableOpacity>
        <View style={styles.stepperValue}>
          <Text style={styles.stepperValueText}>{capacidad}</Text>
        </View>
        <TouchableOpacity style={styles.stepperButton} onPress={incrementCapacity}>
          <Text style={styles.stepperButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.inputLabel}>Padrón vehicular</Text>
      {padronFile ? (
        <View style={styles.uploadedRowInline}>
          <Text style={styles.uploadedCheck}>✅</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.uploadedName}>{padronFile.name}</Text>
            <Text style={styles.uploadedSize}>{padronFile.size}</Text>
          </View>
          <TouchableOpacity onPress={() => handleMockUpload('padron', setPadronFile)}>
            <Text style={styles.changeFileText}>Cambiar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => handleMockUpload('padron', setPadronFile)}
        >
          <Text style={styles.uploadButtonIcon}>📎</Text>
          <Text style={styles.uploadButtonText}>Subir archivo</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSummaryRow = (label: string, value: string) => (
    <View style={styles.summaryRow} key={label}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Confirmación</Text>
      <Text style={styles.stepSubtitle}>Revisa que toda tu información sea correcta antes de enviar.</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summarySectionTitle}>👤  Datos personales</Text>
        {renderSummaryRow('Rut', rut)}
        {renderSummaryRow('Nombres', nombres)}
        {renderSummaryRow('Apellidos', apellidos)}
        {renderSummaryRow('Teléfono', `+56 ${telefono}`)}
        {renderSummaryRow('Correo', correo)}

        <View style={styles.summaryDivider} />

        <Text style={styles.summarySectionTitle}>📄  Documentos</Text>
        {renderSummaryRow('Licencia', licenciaFile?.name || '—')}
        {renderSummaryRow('Hoja de vida', hojaVidaFile?.name || '—')}

        <View style={styles.summaryDivider} />

        <Text style={styles.summarySectionTitle}>🚗  Vehículo</Text>
        {renderSummaryRow('Patente', patente.toUpperCase())}
        {renderSummaryRow('Modelo', modelo)}
        {renderSummaryRow('Capacidad', `${capacidad} pasajeros`)}
        {renderSummaryRow('Padrón', padronFile?.name || 'No adjunto')}
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };

  // ── Main render ──────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {renderHeader()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.secondaryButton} onPress={goBack}>
            <Text style={styles.secondaryButtonText}>Anterior</Text>
          </TouchableOpacity>
        )}

        {currentStep < TOTAL_STEPS ? (
          <TouchableOpacity
            style={[styles.primaryButton, currentStep === 1 && styles.primaryButtonFull]}
            onPress={goNext}
          >
            <Text style={styles.primaryButtonText}>Siguiente</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.textWhite} />
            ) : (
              <Text style={styles.submitButtonText}>Enviar Postulación</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBackground,
  },

  // Header
  header: {
    paddingTop: 56,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.darkBackground,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.circle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: COLORS.textWhite,
    fontSize: FONTS.xxl,
    fontWeight: FONTS.bold,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    color: COLORS.textWhite,
    fontSize: FONTS.xl,
    fontWeight: FONTS.bold,
    letterSpacing: 0.5,
  },

  // Progress
  progressSection: {
    alignItems: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.progressGreen,
    borderRadius: 3,
  },
  progressLabel: {
    color: COLORS.textMuted,
    fontSize: FONTS.sm,
    fontWeight: FONTS.medium,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },

  // Step container
  stepContainer: {
    paddingTop: SPACING.lg,
  },
  stepTitle: {
    color: COLORS.textWhite,
    fontSize: FONTS.xxl,
    fontWeight: FONTS.bold,
    marginBottom: SPACING.xs,
  },
  stepSubtitle: {
    color: COLORS.textMuted,
    fontSize: FONTS.md,
    fontWeight: FONTS.regular,
    marginBottom: SPACING.xxl,
    lineHeight: 20,
  },

  // Info banner
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(46,196,182,0.12)',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accentGreen,
  },
  infoBannerIcon: {
    fontSize: FONTS.lg,
    marginRight: SPACING.sm,
  },
  infoBannerText: {
    flex: 1,
    color: COLORS.accentGreen,
    fontSize: FONTS.sm,
    fontWeight: FONTS.regular,
    lineHeight: 18,
  },

  // Inputs
  inputLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONTS.sm,
    fontWeight: FONTS.medium,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    marginBottom: SPACING.lg,
    color: COLORS.textWhite,
    fontSize: FONTS.md,
  },

  // Phone
  phoneRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  phonePrefix: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phonePrefixText: {
    color: COLORS.textWhite,
    fontSize: FONTS.md,
    fontWeight: FONTS.medium,
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
  },

  // Document cards
  documentCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  documentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  docIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(46,196,182,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  docIcon: {
    fontSize: 22,
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    color: COLORS.textWhite,
    fontSize: FONTS.md,
    fontWeight: FONTS.semibold,
    marginBottom: 2,
  },
  docFormat: {
    color: COLORS.textMuted,
    fontSize: FONTS.xs,
    fontWeight: FONTS.regular,
  },

  // Upload button
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentGreen,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    gap: SPACING.sm,
  },
  uploadButtonIcon: {
    fontSize: FONTS.lg,
  },
  uploadButtonText: {
    color: COLORS.textWhite,
    fontSize: FONTS.md,
    fontWeight: FONTS.semibold,
  },

  // Uploaded state
  uploadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(46,125,50,0.12)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  uploadedRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46,125,50,0.12)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  uploadedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  uploadedCheck: {
    fontSize: FONTS.lg,
  },
  uploadedName: {
    color: COLORS.textWhite,
    fontSize: FONTS.sm,
    fontWeight: FONTS.medium,
  },
  uploadedSize: {
    color: COLORS.textMuted,
    fontSize: FONTS.xs,
    marginTop: 1,
  },
  changeFileText: {
    color: COLORS.accentGreen,
    fontSize: FONTS.sm,
    fontWeight: FONTS.semibold,
  },

  // Stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonText: {
    color: COLORS.textWhite,
    fontSize: FONTS.xxl,
    fontWeight: FONTS.bold,
  },
  stepperValue: {
    width: 64,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(46,196,182,0.15)',
    borderWidth: 1,
    borderColor: COLORS.accentGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValueText: {
    color: COLORS.accentGreen,
    fontSize: FONTS.xl,
    fontWeight: FONTS.bold,
  },

  // Summary (Step 4)
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
  },
  summarySectionTitle: {
    color: COLORS.textWhite,
    fontSize: FONTS.lg,
    fontWeight: FONTS.semibold,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: FONTS.sm,
    fontWeight: FONTS.regular,
  },
  summaryValue: {
    color: COLORS.textWhite,
    fontSize: FONTS.sm,
    fontWeight: FONTS.medium,
    maxWidth: '55%',
    textAlign: 'right',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: SPACING.lg,
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: 36,
    backgroundColor: COLORS.darkBackground,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: SPACING.md,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.textWhite,
    fontSize: FONTS.md,
    fontWeight: FONTS.semibold,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.accentGreen,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonFull: {
    flex: 1,
  },
  primaryButtonText: {
    color: COLORS.textWhite,
    fontSize: FONTS.md,
    fontWeight: FONTS.bold,
  },
  submitButton: {
    flex: 2,
    backgroundColor: COLORS.successGreen,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.textWhite,
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
  },
});

export default React.memo(DriverRegistrationScreen);
