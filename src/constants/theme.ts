// src/constants/theme.ts
// RouteShare Design System - Light Theme preferred by user

export const COLORS = {
  // Primary palette
  primary: '#00529b',           // Main brand blue
  accentGreen: '#2EC4B6',       // Green accents if needed
  
  // Light theme backgrounds
  background: '#FFFFFF',        // White background for screens
  lightGrey: '#F5F5F5',         // Light grey backgrounds (like pages 48-53)
  inputBackground: '#F0F0F0',   // Light gray for input fields
  
  // Text
  textPrimary: '#000000',       // Black text
  textSecondary: '#6B7280',     // Gray text
  textMuted: '#9CA3AF',         // Muted/placeholder text
  textWhite: '#FFFFFF',
  
  // Status
  successGreen: '#2e7d32',      // Success states
  danger: '#D32F2F',

  // Buttons
  buttonPrimary: '#A0A0A0',     // Grey button preferred by user (from mockup pages)
  buttonPrimaryText: '#FFFFFF',
  buttonOutline: '#E5E7EB',
  buttonOutlineText: '#000000',
  buttonActive: '#707070',      // Darker grey for active
};

export const FONTS = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  hero: 32,

  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 50,
  circle: 999,
};

export const SHADOWS = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
};
