import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { Bell, Lock, Eye, Trash2 } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import ScreenHeader from '../components/ScreenHeader';
import { supabase } from '../services/supabase';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState({
    tripUpdates: true,
    chatMessages: true,
    promotions: false,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    shareLocation: true,
  });

  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar Cuenta",
      "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sí, eliminar", 
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirmación final",
              "Todos tus viajes, reservas y datos personales serán borrados permanentemente. ¿Deseas continuar?",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Eliminar definitivamente",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      const { error } = await supabase.rpc('delete_user_account');
                      if (error) throw error;
                      await supabase.auth.signOut();
                    } catch (err: any) {
                      Alert.alert("Error", err.message || "No se pudo eliminar la cuenta.");
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Configuración" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Notificaciones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell color={COLORS.primary} size={20} />
            <Text style={styles.sectionTitle}>Notificaciones</Text>
          </View>
          <View style={styles.cardGroup}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Actualizaciones de viaje</Text>
                <Text style={styles.settingSub}>Estados, confirmaciones y cancelaciones</Text>
              </View>
              <Switch 
                value={notifications.tripUpdates} 
                onValueChange={(val) => setNotifications({...notifications, tripUpdates: val})}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            </View>
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Mensajes de chat</Text>
                <Text style={styles.settingSub}>Mensajes de conductores o pasajeros</Text>
              </View>
              <Switch 
                value={notifications.chatMessages} 
                onValueChange={(val) => setNotifications({...notifications, chatMessages: val})}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            </View>
            <View style={[styles.settingRow, styles.noBorder]}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Promociones</Text>
                <Text style={styles.settingSub}>Ofertas y noticias de RouteShare</Text>
              </View>
              <Switch 
                value={notifications.promotions} 
                onValueChange={(val) => setNotifications({...notifications, promotions: val})}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            </View>
          </View>
        </View>

        {/* Privacidad */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eye color={COLORS.primary} size={20} />
            <Text style={styles.sectionTitle}>Privacidad</Text>
          </View>
          <View style={styles.cardGroup}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Perfil público</Text>
                <Text style={styles.settingSub}>Otros usuarios pueden ver tu foto y valoración</Text>
              </View>
              <Switch 
                value={privacy.showProfile} 
                onValueChange={(val) => setPrivacy({...privacy, showProfile: val})}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            </View>
            <View style={[styles.settingRow, styles.noBorder]}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Compartir ubicación</Text>
                <Text style={styles.settingSub}>Necesario durante un viaje activo</Text>
              </View>
              <Switch 
                value={privacy.shareLocation} 
                onValueChange={(val) => setPrivacy({...privacy, shareLocation: val})}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            </View>
          </View>
        </View>

        {/* Cuenta */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock color={COLORS.primary} size={20} />
            <Text style={styles.sectionTitle}>Cuenta</Text>
          </View>
          <View style={styles.cardGroup}>
            <TouchableOpacity style={styles.actionRow}>
              <Text style={styles.actionText}>Cambiar contraseña</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionRow, styles.noBorder]} onPress={handleDeleteAccount}>
              <View style={styles.deleteAccountRow}>
                <Trash2 color={COLORS.dangerRed} size={20} />
                <Text style={styles.deleteAccountText}>Eliminar cuenta</Text>
              </View>
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
    padding: SPACING.xl,
    paddingBottom: SPACING.section,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingLeft: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  cardGroup: {
    backgroundColor: COLORS.lightGrey,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 229, 234, 0.6)',
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  settingTitle: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  settingSub: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  actionRow: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 229, 234, 0.6)',
  },
  actionText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.medium,
    color: COLORS.textPrimary,
  },
  deleteAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  deleteAccountText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
    color: COLORS.dangerRed,
  },
});
