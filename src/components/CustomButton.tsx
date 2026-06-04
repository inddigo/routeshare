import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../constants/theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'outline' | 'text';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'accent':
        return styles.accentContainer;
      case 'outline':
        return styles.outlineContainer;
      case 'text':
        return styles.textContainer;
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'accent':
        return styles.accentText;
      case 'outline':
        return styles.outlineText;
      case 'text':
        return styles.textVariantText;
      default:
        return styles.primaryText;
    }
  };

  const spinnerColor =
    variant === 'primary' ? COLORS.textWhite : COLORS.textPrimary;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        getContainerStyle(),
        variant !== 'text' && variant !== 'outline' && SHADOWS.subtle,
        disabled && styles.disabledContainer,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <Text style={[styles.text, getTextStyle(), textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 54,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  primaryContainer: {
    backgroundColor: COLORS.buttonPrimary,
  },
  accentContainer: {
    backgroundColor: COLORS.buttonAccent,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.buttonOutline,
  },
  textContainer: {
    backgroundColor: 'transparent',
    height: 'auto',
    marginVertical: SPACING.xs,
  },
  disabledContainer: {
    opacity: 0.45,
  },
  text: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
    letterSpacing: 0.2,
  },
  primaryText: {
    color: COLORS.buttonPrimaryText,
  },
  accentText: {
    color: COLORS.buttonAccentText,
  },
  outlineText: {
    color: COLORS.buttonOutlineText,
  },
  textVariantText: {
    color: COLORS.accentDark,
  },
});

export default CustomButton;
