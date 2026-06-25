import React, { useState } from 'react';
import { Image, ImageProps, View, StyleSheet, ActivityIndicator } from 'react-native';
import { User } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

interface ImageWithFallbackProps extends Omit<ImageProps, 'source'> {
  src?: string;
  fallbackType?: 'avatar' | 'map' | 'default';
}

export default function ImageWithFallback({ src, fallbackType = 'default', style, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!src || error) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        {fallbackType === 'avatar' && <User color={COLORS.iconGrey} size={24} />}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      )}
      <Image
        source={{ uri: src }}
        style={[StyleSheet.absoluteFill, style]}
        onError={() => setError(true)}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.lightGrey,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGrey,
    zIndex: 1,
  },
  fallbackContainer: {
    backgroundColor: COLORS.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
