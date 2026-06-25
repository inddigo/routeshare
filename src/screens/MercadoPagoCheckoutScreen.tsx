import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../constants/theme';
import ScreenHeader from '../components/ScreenHeader';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MercadoPagoCheckoutScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { url } = route.params as { url: string };
  const [loading, setLoading] = useState(true);

  const handleNavigationStateChange = (navState: any) => {
    // If the URL matches the success URL we provided to Mercado Pago
    if (navState.url.includes('routeshare.success') || navState.url.includes('approved')) {
      navigation.navigate({
        name: 'PaymentMethods',
        params: { paymentSuccess: true },
        merge: true,
      } as any);
    } else if (navState.url.includes('routeshare.failure')) {
      // Handle failure
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Procesar Pago" showBackButton={true} />
      <WebView
        source={{ uri: url }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadEnd={() => setLoading(false)}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        incognito={true}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando entorno seguro...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.primary,
    fontWeight: 'bold',
  }
});
