import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Mail, Phone, IdCard, ShieldCheck, Settings, CreditCard, Shield, HelpCircle, LogOut, ChevronRight, Camera } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageWithFallback from '../components/ImageWithFallback';
import { supabase } from '../services/supabase';
import { launchImageLibrary } from 'react-native-image-picker';
import { decode } from 'base64-arraybuffer';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<'passenger' | 'driver'>('passenger');
  
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('User')
            .select('*')
            .eq('id', user.id)
            .single();
          if (profile) {
            setUserProfile({
              ...profile,
              phone: profile.phone || user.user_metadata?.celular,
              rut: profile.rut || user.user_metadata?.rut
            });
            setRole(profile.role === 'DRIVER' ? 'driver' : 'passenger');
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const handleAvatarChange = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.5,
        includeBase64: true,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) return;
      
      const asset = result.assets[0];
      if (!asset.base64) return;

      setUploadingAvatar(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = asset.type?.split('/')[1] || 'jpg';
      const fileName = `avatar_${user.id}_${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, decode(asset.base64), {
          contentType: asset.type || 'image/jpeg',
        });
      
      if (error) throw new Error(error.message);

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);

      // Cache-busting: Añadir timestamp para evitar que React Native cargue la caché
      const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

      // Actualizar la tabla User con el nuevo avatar_url
      const { error: updateError } = await supabase
        .from('User')
        .update({ avatar_url: cacheBustedUrl })
        .eq('id', user.id);

      if (updateError) throw new Error(updateError.message);

      setUserProfile({ ...userProfile, avatar_url: cacheBustedUrl });
      Alert.alert('Éxito', 'Foto de perfil actualizada');
    } catch (e: any) {
      Alert.alert('Error al subir foto', e.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header & Top Section */}
        <View style={[styles.headerSection, { paddingTop: insets.top + SPACING.xl }]}>
          <TouchableOpacity onPress={handleAvatarChange} style={styles.avatarContainer}>
            <ImageWithFallback 
              src={userProfile?.avatar_url || "https://images.unsplash.com/photo-1539125530496-3ca408f9c2d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbGUlMjBjb2xsZWdlJTIwc3R1ZGVudCUyMHByb2ZpbGUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3ODA2MzAxNDB8MA&ixlib=rb-4.1.0&q=80&w=1080"}
              style={styles.avatar}
            />
            {uploadingAvatar ? (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color={COLORS.textWhite} size="small" />
              </View>
            ) : (
              <View style={styles.avatarEditBadge}>
                <Camera size={14} color={COLORS.textWhite} />
              </View>
            )}
          </TouchableOpacity>
          
          <Text style={styles.userName}>{userProfile?.full_name || 'Usuario'}</Text>
          <Text style={styles.userSubtitle}>Ingeniería Informática PUCV</Text>

          {/* Role Toggle */}
          <View style={styles.roleToggleContainer}>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'passenger' && styles.roleButtonActive]}
              onPress={() => setRole('passenger')}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleText, role === 'passenger' && styles.roleTextActive]}>Pasajero</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'driver' && styles.roleButtonActive]}
              onPress={() => setRole('driver')}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleText, role === 'driver' && styles.roleTextActive]}>Conductor</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.mainContent}>
          
          {/* Driver Banner */}
          {role === 'driver' && (
            <View style={styles.driverBanner}>
              <View>
                <Text style={styles.driverBannerTitle}>Convertirse en Conductor</Text>
                <Text style={styles.driverBannerSub}>Gana dinero compartiendo tus viajes</Text>
              </View>
              <TouchableOpacity 
                style={styles.driverBannerButton}
                onPress={() => navigation.navigate('DriverValidation')}
              >
                <Text style={styles.driverBannerButtonText}>Activar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Section 1: Datos Personales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DATOS PERSONALES</Text>
            <View style={styles.cardGroup}>
              
              <View style={styles.cardRow}>
                <View style={styles.cardRowHeader}>
                  <Mail color={COLORS.iconGrey} size={18} />
                  <Text style={styles.cardRowTitle}>Correo</Text>
                </View>
                <Text style={styles.cardRowValue}>{userProfile?.email || 'No disponible'}</Text>
              </View>

              <View style={styles.cardRow}>
                <View style={styles.cardRowHeader}>
                  <Phone color={COLORS.iconGrey} size={18} />
                  <Text style={styles.cardRowTitle}>Teléfono</Text>
                </View>
                <Text style={styles.cardRowValue}>{userProfile?.phone || '+56 9 0000 0000'}</Text>
              </View>

              <View style={[styles.cardRow, styles.cardRowNoBorder]}>
                <View style={styles.cardRowHeader}>
                  <IdCard color={COLORS.iconGrey} size={18} />
                  <Text style={styles.cardRowTitle}>RUT</Text>
                </View>
                <View style={styles.rutValueContainer}>
                  <Text style={styles.cardRowValueRut}>{userProfile?.rut || 'Sin registrar'}</Text>
                  {role === 'driver' && (
                    <View style={styles.verifiedBadge}>
                      <ShieldCheck color={COLORS.successGreen} size={14} strokeWidth={2.5} />
                      <Text style={styles.verifiedText}>Verificado</Text>
                    </View>
                  )}
                </View>
              </View>

            </View>
          </View>

          {/* Section 2: Opciones */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OPCIONES</Text>
            <View style={styles.cardGroup}>
              
              <TouchableOpacity 
                style={styles.actionRow} 
                onPress={() => navigation.navigate('Settings')}
              >
                <View style={styles.actionRowLeft}>
                  <Settings color={COLORS.textPrimary} size={20} />
                  <Text style={styles.actionRowTitle}>Configuración de cuenta</Text>
                </View>
                <ChevronRight color={COLORS.iconGrey} size={20} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionRow} 
                onPress={() => navigation.navigate('PaymentMethods')}
              >
                <View style={styles.actionRowLeft}>
                  <CreditCard color={COLORS.textPrimary} size={20} />
                  <Text style={styles.actionRowTitle}>Métodos de pago</Text>
                </View>
                <ChevronRight color={COLORS.iconGrey} size={20} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionRow}>
                <View style={styles.actionRowLeft}>
                  <Shield color={COLORS.textPrimary} size={20} />
                  <Text style={styles.actionRowTitle}>Seguridad y confianza</Text>
                </View>
                <ChevronRight color={COLORS.iconGrey} size={20} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionRow, styles.cardRowNoBorder]}>
                <View style={styles.actionRowLeft}>
                  <HelpCircle color={COLORS.textPrimary} size={20} />
                  <Text style={styles.actionRowTitle}>Centro de ayuda</Text>
                </View>
                <ChevronRight color={COLORS.iconGrey} size={20} />
              </TouchableOpacity>

            </View>
          </View>

          {/* Log Out */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <LogOut color={COLORS.dangerRed} size={20} strokeWidth={2.5} />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>

        </View>
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
    paddingBottom: SPACING.section,
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: COLORS.lightGrey,
    marginBottom: SPACING.lg,
    ...SHADOWS.subtle,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 44, // 48 - 4 (border)
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: SPACING.xs,
  },
  userSubtitle: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xxl,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGrey,
    padding: 6,
    borderRadius: RADIUS.circle,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  roleButton: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.circle,
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.subtle,
  },
  roleText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
    color: COLORS.textSecondary,
  },
  roleTextActive: {
    color: COLORS.textWhite,
  },
  mainContent: {
    paddingHorizontal: SPACING.xl,
  },
  driverBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.sm,
    ...SHADOWS.subtle,
  },
  driverBannerTitle: {
    color: COLORS.textPrimary,
    fontWeight: FONTS.bold,
    fontSize: FONTS.sm,
  },
  driverBannerSub: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    marginTop: 2,
  },
  driverBannerButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  driverBannerButtonText: {
    color: COLORS.textWhite,
    fontWeight: FONTS.bold,
    fontSize: FONTS.xs,
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: FONTS.xs,
    fontWeight: FONTS.bold,
    letterSpacing: 1,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  cardGroup: {
    backgroundColor: COLORS.lightGrey,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.subtle,
  },
  cardRow: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 229, 234, 0.6)',
  },
  cardRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: 4,
  },
  cardRowTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
  },
  cardRowValue: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    paddingLeft: 30,
  },
  rutValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 30,
  },
  cardRowValueRut: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  verifiedText: {
    color: COLORS.successGreen,
    fontSize: 10,
    fontWeight: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 229, 234, 0.6)',
  },
  actionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  actionRowTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
  },
  cardRowNoBorder: {
    borderBottomWidth: 0,
  },
  logoutContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(211, 47, 47, 0.05)',
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  logoutText: {
    color: COLORS.dangerRed,
    fontWeight: FONTS.bold,
    fontSize: FONTS.sm,
  },
});
