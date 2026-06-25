import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

interface StyledInputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  isPassword?: boolean;
  containerStyle?: object;
}

export default function StyledInput({ 
  label, 
  icon, 
  error, 
  isPassword,
  containerStyle,
  ...props 
}: StyledInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError
      ]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <EyeOff color={COLORS.iconGrey} size={20} />
            ) : (
              <Eye color={COLORS.iconGrey} size={20} />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: SPACING.lg,
    height: 52,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  inputContainerError: {
    borderColor: COLORS.dangerRed,
  },
  iconContainer: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: FONTS.lg,
    fontWeight: FONTS.medium,
    color: COLORS.textPrimary,
    height: '100%',
  },
  eyeIcon: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  errorText: {
    color: COLORS.dangerRed,
    fontSize: FONTS.xs,
    marginTop: SPACING.xs,
  },
});
