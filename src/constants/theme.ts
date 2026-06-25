// src/constants/theme.ts
// RouteShare Design System - New UI Kit
// Primary navy (#002855) + Gold (#FFB81C)

export const COLORS = {
  // Brand
  primary: '#002855',           // Navy Blue
  primaryDark: '#001D3D',
  primaryLight: 'rgba(0, 40, 85, 0.1)',
  
  accent: '#FFB81C',            // Gold
  accentHover: '#e5a519',
  accentLight: 'rgba(255, 184, 28, 0.15)',

  // Backgrounds
  background: '#FFFFFF',
  surface: '#FFFFFF',
  lightGrey: '#F5F5F5',
  
  // Text
  textPrimary: '#1C1C1E',
  textSecondary: '#8E8E93',
  textWhite: '#FFFFFF',

  // Borders
  borderLight: '#F5F5F5',
  border: '#E5E5E7',
  borderGrey: '#d1d1d6',

  // Status
  successGreen: '#4CAF50',
  successLight: 'rgba(76, 175, 80, 0.15)',
  warningOrange: '#FFB81C',
  dangerRed: '#D32F2F',
  dangerLight: 'rgba(211, 47, 47, 0.05)',
  infoBlue: '#002855',

  // Component Specific
  inputBackground: '#F5F5F5',
  iconGrey: '#8E8E93',
};

export const FONTS = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  hero: 34,

  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
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
  xxl: 24,
  pill: 50,
  circle: 999,
};

export const SHADOWS = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 16,
  }
};
