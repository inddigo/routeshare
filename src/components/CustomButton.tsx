import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'text';
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
      case 'outline':
        return styles.outlineText;
      case 'text':
        return styles.textVariantText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        getContainerStyle(),
        disabled && styles.disabledContainer,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? COLORS.textWhite : COLORS.textPrimary} />
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
    height: 52,
    borderRadius: RADIUS.md, // Soft rounded borders based on mockups
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  primaryContainer: {
    backgroundColor: COLORS.buttonPrimary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.buttonOutline,
  },
  textContainer: {
    backgroundColor: 'transparent',
    height: 'auto',
    marginVertical: SPACING.xs,
  },
  disabledContainer: {
    opacity: 0.6,
  },
  text: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.medium,
  },
  primaryText: {
    color: COLORS.buttonPrimaryText,
  },
  outlineText: {
    color: COLORS.buttonOutlineText,
  },
  textVariantText: {
    color: COLORS.textPrimary,
  },
});

export default CustomButton;
