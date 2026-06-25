import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../constants/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}: PrimaryButtonProps) {
  
  const getBackgroundColor = () => {
    if (disabled) return COLORS.borderGrey;
    switch (variant) {
      case 'secondary': return COLORS.accent;
      case 'outline': return 'transparent';
      default: return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textWhite;
    switch (variant) {
      case 'secondary': return COLORS.textPrimary;
      case 'outline': return COLORS.textPrimary;
      default: return COLORS.textWhite;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return COLORS.border;
    return 'transparent';
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        variant === 'outline' && styles.outline,
        variant === 'primary' && !disabled && SHADOWS.subtle,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && icon}
          <Text style={[
            styles.text,
            { color: getTextColor() },
            icon ? styles.textWithIcon : null,
            textStyle
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  text: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
  },
  outline: {
    borderWidth: 1,
  },
  textWithIcon: {
    marginLeft: SPACING.sm,
  },
});
