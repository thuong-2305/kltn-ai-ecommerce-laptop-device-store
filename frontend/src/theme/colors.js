/**
 * SEMANTIC COLOR TOKENS
 * Brand colors mapped to semantic names
 * No hardcoded color values in components - always use tokens
 */

export const BRAND_COLORS = {
  // Primary brand color
  PRIMARY: '#2563eb',
  PRIMARY_DARK: '#1744a5',
  PRIMARY_LIGHT: '#3b82f6',

  // Accent color
  ACCENT: '#0ea5e9',
  ACCENT_LIGHT: '#06b6d4',

  // Neutral colors (grayscale)
  TEXT_PRIMARY: '#0f172a', // darkest - for headings
  TEXT_SECONDARY: '#334155', // dark gray - for body text
  TEXT_MUTED: '#64748b', // medium gray - for secondary text
  TEXT_DISABLED: '#cbd5e1', // light gray - for disabled state

  // Backgrounds
  BG_SURFACE: 'rgba(255, 255, 255, 0.8)', // main surface with slight glass effect
  BG_CARD: 'rgba(255, 255, 255, 0.8)', // card background
  BG_ELEVATED: '#ffffff', // highest elevation
  BG_MUTED: '#f1f5f9', // subtle background
  BG_OVERLAY: 'rgba(15, 23, 42, 0.8)', // dark overlay

  // Borders
  BORDER_DEFAULT: 'rgba(148, 163, 184, 0.18)', // default border
  BORDER_LIGHT: 'rgba(148, 163, 184, 0.16)', // lighter border
  BORDER_ACCENT: '#2563eb', // accent border

  // States
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  ERROR_DARK: '#b91c1c',
  INFO: '#3b82f6',

  // Gradient backgrounds - semantic names
  GRADIENT_BLUE_TO_CYAN: 'linear-gradient(135deg, rgba(37, 99, 235, 0.14), rgba(14, 165, 233, 0.14))',
  GRADIENT_HERO_RADIAL: 'radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.46),rgba(248,250,252,0.78))',
  GRADIENT_CARD_BLUE: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(14, 165, 233, 0.16))',
  GRADIENT_CARD_NAVY: 'linear-gradient(135deg, rgba(17, 24, 39, 0.08), rgba(59, 130, 246, 0.12))',
  GRADIENT_CARD_TEAL: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(16, 185, 129, 0.12))',
  GRADIENT_PROMO_LAVENDER: 'linear-gradient(135deg, rgba(237, 233, 254, 0.9), rgba(221, 214, 254, 0.8))',
  GRADIENT_PROMO_MINT: 'linear-gradient(135deg, rgba(220, 252, 231, 0.92), rgba(204, 251, 241, 0.82))',
  GRADIENT_PROMO_PEACH: 'linear-gradient(135deg, rgba(255, 237, 213, 0.92), rgba(254, 215, 170, 0.84))',
  GRADIENT_BUTTON_PRIMARY: 'linear-gradient(to right, #2563eb, #0ea5e9)',
  GRADIENT_BUTTON_SECONDARY: 'linear-gradient(to right, #1744a5, #2563eb)',
}

export const SEMANTIC_COLORS = {
  // Text colors - for className usage
  'text-primary': BRAND_COLORS.TEXT_PRIMARY,
  'text-secondary': BRAND_COLORS.TEXT_SECONDARY,
  'text-muted': BRAND_COLORS.TEXT_MUTED,
  'text-disabled': BRAND_COLORS.TEXT_DISABLED,

  // Background colors
  'bg-surface': BRAND_COLORS.BG_SURFACE,
  'bg-card': BRAND_COLORS.BG_CARD,
  'bg-elevated': BRAND_COLORS.BG_ELEVATED,
  'bg-muted': BRAND_COLORS.BG_MUTED,

  // Border colors
  'border-default': BRAND_COLORS.BORDER_DEFAULT,
  'border-light': BRAND_COLORS.BORDER_LIGHT,
}

// Tailwind color palette extension
export const tailwindColors = {
  brand: {
    primary: BRAND_COLORS.PRIMARY,
    'primary-dark': BRAND_COLORS.PRIMARY_DARK,
    'primary-light': BRAND_COLORS.PRIMARY_LIGHT,
    accent: BRAND_COLORS.ACCENT,
    'accent-light': BRAND_COLORS.ACCENT_LIGHT,
  },
  text: {
    primary: BRAND_COLORS.TEXT_PRIMARY,
    secondary: BRAND_COLORS.TEXT_SECONDARY,
    muted: BRAND_COLORS.TEXT_MUTED,
    disabled: BRAND_COLORS.TEXT_DISABLED,
  },
  surface: {
    default: BRAND_COLORS.BG_SURFACE,
    card: BRAND_COLORS.BG_CARD,
    elevated: BRAND_COLORS.BG_ELEVATED,
    muted: BRAND_COLORS.BG_MUTED,
  },
  border: {
    default: BRAND_COLORS.BORDER_DEFAULT,
    light: BRAND_COLORS.BORDER_LIGHT,
    accent: BRAND_COLORS.BORDER_ACCENT,
  },
}
