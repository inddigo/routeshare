// src/constants/theme.ts
// RouteShare Design System
// Identidad "Uber con personalidad propia":
// base negra + blanco, acento turquesa distintivo de RouteShare.

export const COLORS = {
  // Marca / acento (sello propio de RouteShare)
  primary: '#0A0A0A',           // Negro Uber como color de marca principal
  accent: '#1FC9B7',            // Turquesa RouteShare (sello distintivo)
  accentGreen: '#1FC9B7',       // Alias compat: usado por pantallas existentes
  accentDark: '#149C8E',        // Turquesa oscuro para estados activos/press

  // Fondos
  background: '#FFFFFF',        // Fondo claro principal
  darkBackground: '#0A0A0A',   // Fondo oscuro (pantallas tipo Welcome/Onboarding)
  surface: '#FFFFFF',          // Superficie de tarjetas sobre fondo claro
  surfaceDark: '#161616',      // Superficie de tarjetas sobre fondo oscuro
  lightGrey: '#F4F4F5',        // Fondos secundarios / secciones
  inputBackground: '#F4F4F5',  // Relleno de inputs
  border: '#E5E5E7',           // Bordes sutiles

  // Texto
  textPrimary: '#0A0A0A',      // Texto principal (casi negro)
  textSecondary: '#5C5C66',    // Texto secundario
  textMuted: '#9A9AA5',        // Placeholder / texto atenuado
  textWhite: '#FFFFFF',

  // Estados
  successGreen: '#0E9F6E',
  warning: '#F5A623',
  danger: '#E53935',

  // Botones
  buttonPrimary: '#0A0A0A',         // Negro sólido (acción principal)
  buttonPrimaryText: '#FFFFFF',
  buttonActive: '#262626',          // Negro presionado
  buttonAccent: '#1FC9B7',          // Acento turquesa para CTAs destacados
  buttonAccentText: '#0A0A0A',
  buttonOutline: '#E5E5E7',         // Borde de botón outline
  buttonOutlineText: '#0A0A0A',
  buttonDisabled: '#C9C9CF',        // Botón deshabilitado

  // --- Alias de compatibilidad usados por pantallas existentes ---
  // Se mapean a la nueva identidad para evitar tokens inexistentes.
  darkBlueHeader: '#0A0A0A',        // Header oscuro (antes azul) -> negro Uber
  primaryBlue: '#0A0A0A',           // Antes azul corporativo -> negro marca
  lightBackground: '#F4F4F5',       // Fondo claro de pantallas
  cardBackground: '#FFFFFF',        // Fondo de tarjetas
  textLink: '#149C8E',              // Enlaces -> turquesa oscuro
  statusConfirmed: '#1FC9B7',       // Estado confirmado -> acento turquesa
  divider: '#EDEDF0',              // Líneas divisorias
  statusBadgeGreen: 'rgba(31, 201, 183, 0.15)', // Fondo de badge -> turquesa suave
  statusTextGreen: '#149C8E',     // Texto de badge -> turquesa oscuro
  progressGreen: '#1FC9B7',       // Barra de progreso -> acento turquesa
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
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};
