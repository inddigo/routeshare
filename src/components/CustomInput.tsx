import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

interface CustomInputProps extends TextInputProps {
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  error?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
  icon,
  rightIcon,
  onRightIconPress,
  error,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          focused && styles.focusedContainer,
          error ? styles.errorContainer : null,
          style,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.textMuted}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIconContainer}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    height: 56,
    paddingHorizontal: SPACING.lg,
  },
  focusedContainer: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.textPrimary,
    fontSize: FONTS.md,
    fontWeight: FONTS.medium,
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  rightIconContainer: {
    marginLeft: SPACING.sm,
  },
});

export default CustomInput;
