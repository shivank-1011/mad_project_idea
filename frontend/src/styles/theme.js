// Modern theme configuration
export const colors = {
  // Primary colors
  primary: "#007AFF",
  primaryDark: "#0056CC",
  primaryLight: "#5AC8FA",

  // Secondary colors
  secondary: "#FF9500",
  secondaryDark: "#FF8C00",
  secondaryLight: "#FFB84D",

  // Background colors
  background: "#F8F9FA",
  surface: "#FFFFFF",
  surfaceSecondary: "#F5F5F7",

  // Text colors
  text: "#1C1C1E",
  textSecondary: "#6C6C70",
  textTertiary: "#8E8E93",

  // Status colors
  success: "#28A745",
  warning: "#FFC107",
  error: "#DC3545",
  info: "#17A2B8",

  // Accent colors
  accent: "#5856D6",

  // Border colors
  border: "#E5E5EA",
  borderLight: "#F2F2F7",

  // Shadow
  shadow: "rgba(0, 0, 0, 0.1)",
  shadowDark: "rgba(0, 0, 0, 0.2)",
};

export const typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    heading: 32,
  },

  // Font weights - using string values that work across platforms
  fontWeight: {
    light: "normal", // Use 'normal' instead of '300' for better compatibility
    normal: "normal",
    medium: "500",
    semibold: "600",
    bold: "bold", // Use 'bold' instead of '700'
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    loose: 1.6,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 50,
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};
