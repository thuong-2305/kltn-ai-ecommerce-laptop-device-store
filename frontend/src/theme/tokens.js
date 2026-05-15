/**
 * SEMANTIC DESIGN TOKENS - SPACING, RADIUS, SHADOW, TRANSITION
 * Centralized system for consistent spacing, borders, shadows, and animations
 */

// SPACING SCALE - Based on 4px base unit (Tailwind default)
export const SPACING = {
  // Core scale
  XS: '6px', // 0.375rem (1.5 units)
  SM: '10px', // 2.5 units
  MD: '14px', // 3.5 units
  LG: '18px', // 4.5 units
  XL: '22px', // 5.5 units
  XXL: '28px', // 7 units
  XXXL: '32px', // 8 units

  // Specific measurements
  GAP_SECTION: '16px', // gap between major sections
  GAP_COMPONENT: '12px', // gap between components
  GAP_ITEM: '8px', // gap between list items
  PADDING_CONTAINER: '18px', // container padding
  PADDING_CARD: '18px 20px', // card padding
  PADDING_BUTTON: '10px 16px', // button padding
  MARGIN_SECTION: '14px', // margin between sections
}

// BORDER RADIUS - Rounded corners
export const RADIUS = {
  NONE: '0',
  SM: '6px',
  MD: '10px',
  LG: '14px',
  XL: '16px',
  XXL: '20px', // default card radius
  XXXL: '24px', // large cards/buttons
  FULL: '9999px', // full circle (for pill buttons)

  // Semantic names
  BUTTON: '16px', // standard button radius
  CARD: '20px', // standard card radius
  ICON: '14px', // small icon container radius
  INPUT: '9999px', // search input radius
}

// SHADOWS - Elevation levels
export const SHADOWS = {
  NONE: 'none',

  // Subtle shadow for interactive elements
  LIGHT: '0 10px 20px rgba(15, 23, 42, 0.06)',
  
  // Standard shadow for cards and modals
  STANDARD: '0 14px 30px rgba(15, 23, 42, 0.06)',
  
  // Elevated shadow for prominent elements
  MEDIUM: '0 14px 30px rgba(15, 23, 42, 0.18)',
  
  // Deep shadow for top-level elements
  DARK: '0 22px 50px rgba(15, 23, 42, 0.1)',

  // Special effects
  GLASS: '0 8px 16px rgba(15, 23, 42, 0.05)',
  SEARCH_BAR: '0 10px 20px rgba(37, 99, 235, 0.2)',
  BUTTON_HOVER: '0 10px 22px rgba(37, 99, 235, 0.22)',
  BUTTON_SECONDARY: '0 10px 22px rgba(15, 23, 42, 0.05)',
  DROP: '0 18px 26px rgba(15, 23, 42, 0.18)',
  LARGE: '0 24px 40px rgba(0, 0, 0, 0.34)',
  GLOW: '0 14px 26px rgba(37, 99, 235, 0.2)',
}

// BORDER STYLES
export const BORDERS = {
  DEFAULT: '1px solid rgba(148, 163, 184, 0.18)',
  LIGHT: '1px solid rgba(148, 163, 184, 0.16)',
  ACCENT: '1px solid #2563eb',
  THICK: '2px solid rgba(148, 163, 184, 0.18)',
}

// TRANSITIONS AND ANIMATIONS
export const TRANSITIONS = {
  DURATION: {
    INSTANT: '0ms',
    QUICK: '200ms', // quick interactions (hover, focus)
    STANDARD: '300ms', // default transitions
    SMOOTH: '500ms', // smooth/slow animations
  },
  TIMING: {
    LINEAR: 'linear',
    EASE: 'ease',
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
  },
  PROPERTIES: {
    NONE: 'none',
    ALL: 'all 300ms ease-in-out',
    COLOR: 'color 300ms ease-in-out',
    BACKGROUND: 'background-color 300ms ease-in-out',
    TRANSFORM: 'transform 300ms ease-in-out',
    SHADOW: 'box-shadow 300ms ease-in-out',
    BORDER: 'border-color 300ms ease-in-out',
  },
}

// ANIMATION KEYFRAMES
export const KEYFRAMES = {
  spin: 'spin 0.9s linear infinite',
  float: 'float 3s ease-in-out infinite',
  slideInUp: 'slideInUp 0.3s ease-out',
  fadeIn: 'fadeIn 0.3s ease-in',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
}

// Z-INDEX SCALE
export const Z_INDEX = {
  HIDE: '-1',
  BASE: '0',
  DROPDOWN: '10',
  STICKY: '20',
  FIXED: '30',
  MODAL_BACKDROP: '40',
  MODAL: '50',
  POPOVER: '60',
  TOOLTIP: '70',
  NOTIFICATION: '80',
}

// Tailwind config extension
export const tailwindSpacing = {
  spacing: {
    'xs': SPACING.XS,
    'sm': SPACING.SM,
    'md': SPACING.MD,
    'lg': SPACING.LG,
    'xl': SPACING.XL,
    'xxl': SPACING.XXL,
    'xxxl': SPACING.XXXL,
  },
  borderRadius: {
    'none': RADIUS.NONE,
    'sm': RADIUS.SM,
    'md': RADIUS.MD,
    'lg': RADIUS.LG,
    'xl': RADIUS.XL,
    'xxl': RADIUS.XXL,
    'xxxl': RADIUS.XXXL,
    'full': RADIUS.FULL,
  },
  boxShadow: {
    'none': SHADOWS.NONE,
    'light': SHADOWS.LIGHT,
    'standard': SHADOWS.STANDARD,
    'medium': SHADOWS.MEDIUM,
    'dark': SHADOWS.DARK,
    'glass': SHADOWS.GLASS,
  },
  transitionDuration: {
    'instant': TRANSITIONS.DURATION.INSTANT,
    'quick': TRANSITIONS.DURATION.QUICK,
    'standard': TRANSITIONS.DURATION.STANDARD,
    'smooth': TRANSITIONS.DURATION.SMOOTH,
  },
}
