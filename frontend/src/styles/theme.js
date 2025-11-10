
export const colors = {

  primary: "#6C5CE7",
  primaryDark: "#5F3DC4",
  primaryLight: "#A29BFE",
  primaryGradient: ["#6C5CE7", "#A29BFE"],


  secondary: "#FD79A8",
  secondaryDark: "#E84393",
  secondaryLight: "#FDCB6E",
  secondaryGradient: ["#FD79A8", "#FDCB6E"],


  tertiary: "#00CEC9",
  tertiaryDark: "#00B894",
  tertiaryLight: "#55EFC4",
  tertiaryGradient: ["#00CEC9", "#55EFC4"],


  background: "#F8F9FF",
  backgroundSecondary: "#F1F2FF",
  surface: "#FFFFFF",
  surfaceSecondary: "#FAFAFF",
  surfaceElevated: "rgba(255, 255, 255, 0.9)",
  overlay: "rgba(108, 92, 231, 0.1)",


  text: "#2D3436",
  textSecondary: "#636E72",
  textTertiary: "#B2BEC3",
  textInverse: "#FFFFFF",
  textMuted: "#A0A6AC",


  success: "#00B894",
  successLight: "#55EFC4",
  warning: "#FDCB6E",
  warningLight: "#FEF5E7",
  error: "#E17055",
  errorLight: "#FAE5E5",
  info: "#74B9FF",
  infoLight: "#E8F4FD",


  accent: "#FF7675",
  accentSecondary: "#A29BFE",


  border: "rgba(108, 92, 231, 0.12)",
  borderLight: "rgba(108, 92, 231, 0.06)",
  borderAccent: "rgba(108, 92, 231, 0.25)",


  shadow: "rgba(108, 92, 231, 0.15)",
  shadowDark: "rgba(108, 92, 231, 0.25)",
  shadowLight: "rgba(108, 92, 231, 0.08)",


  glass: "rgba(255, 255, 255, 0.25)",
  glassDark: "rgba(45, 52, 54, 0.25)",
};

export const typography = {

  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 19,
    xxl: 22,
    xxxl: 26,
    heading: 30,
    display: 36,
    hero: 42,
  },


  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    heavy: "800",
  },


  lineHeight: {
    tight: 1.15,
    snug: 1.25,
    normal: 1.4,
    relaxed: 1.5,
    loose: 1.6,
  },


  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  round: 50,
  pill: 999,
};

export const shadows = {
  xs: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 12,
  },

  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
};


export const animations = {
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
};


export const gradients = {
  primary: {
    colors: colors.primaryGradient,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  secondary: {
    colors: colors.secondaryGradient,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  tertiary: {
    colors: colors.tertiaryGradient,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  success: {
    colors: [colors.success, colors.successLight],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
};
