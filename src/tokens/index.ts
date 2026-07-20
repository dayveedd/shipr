/**
 * ShipR Design Tokens v1.0 — TypeScript Source of Truth
 */

export const brandTokens = {
  primary: "#FF5500",
  hover: "#E04B00",
  active: "#C23E00",
  soft: "#FFF2EC",
  surface: "#FFF9F6",
  border: "rgba(255, 85, 0, 0.3)",
  focus: "rgba(255, 85, 0, 0.4)",
} as const;

export const neutralScale = {
  0: "#FFFFFF",
  25: "#FCFCFD",
  50: "#FAFAFA",
  100: "#F4F4F5",
  200: "#E4E4E7",
  300: "#D4D4D8",
  400: "#A1A1AA",
  500: "#71717A",
  600: "#52525B",
  700: "#3F3F46",
  800: "#27272A",
  900: "#09090B",
  950: "#050507",
} as const;

export const semanticColors = {
  success: {
    DEFAULT: "#00C471",
    hover: "#00A35E",
    surface: "#ECFDF5",
    border: "rgba(0, 196, 113, 0.3)",
  },
  warning: {
    DEFAULT: "#F59E0B",
    hover: "#D97706",
    surface: "#FFFBEB",
    border: "rgba(245, 158, 11, 0.3)",
  },
  danger: {
    DEFAULT: "#EF4444",
    hover: "#DC2626",
    surface: "#FEF2F2",
    border: "rgba(239, 68, 68, 0.3)",
  },
  info: {
    DEFAULT: "#3B82F6",
    hover: "#2563EB",
    surface: "#EFF6FF",
    border: "rgba(59, 130, 246, 0.3)",
  },
} as const;

export const surfaceTokens = {
  page: neutralScale[50],
  card: neutralScale[0],
  cardHover: neutralScale[25],
  elevated: neutralScale[0],
  modal: neutralScale[0],
  popover: neutralScale[0],
  sidebar: neutralScale[0],
  topnav: "rgba(255, 255, 255, 0.85)",
  tableHeader: neutralScale[100],
  tableRow: neutralScale[0],
  tableHover: neutralScale[100],
  input: neutralScale[0],
  aiTerminal: "#09090B",
} as const;

export const textTokens = {
  primary: neutralScale[900],
  secondary: neutralScale[600],
  muted: neutralScale[500],
  disabled: neutralScale[400],
  inverse: neutralScale[0],
  brand: brandTokens.primary,
  success: semanticColors.success.DEFAULT,
  danger: semanticColors.danger.DEFAULT,
} as const;

export const shadowTokens = {
  xs: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.02)",
  orangeGlow: "0 4px 20px -2px rgba(255, 85, 0, 0.25)",
} as const;

export const motionTokens = {
  durationFast: "150ms",
  durationNormal: "250ms",
  durationSlow: "350ms",
  easeDefault: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeInout: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;
