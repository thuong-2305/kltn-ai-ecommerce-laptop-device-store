/**
 * CENTRALIZED DESIGN SYSTEM CONSTANTS
 * Common semantic values and class references for components
 * Use these constants instead of hardcoding values in JSX
 */


// ============= SEMANTIC CLASS REFERENCES =============
// Use these as className values - no inline styles needed

export const SEMANTIC_CLASSES = {
  // Text colors - semantic naming
  TEXT: {
    PRIMARY: 'text-slate-900', // heading color
    SECONDARY: 'text-slate-600', // body text
    MUTED: 'text-slate-500', // secondary info
    LABEL: 'text-slate-500', // labels
    ACCENT: 'text-blue-600', // accent text
  },

  // Background colors
  BACKGROUND: {
    SURFACE: 'bg-white/90', // main surface
    CARD: 'bg-white/80', // card background
    ELEVATED: 'bg-white', // white background
    MUTED: 'bg-slate-50', // subtle background
    OVERLAY: 'bg-black/50', // overlay
  },

  // Border colors
  BORDER: {
    DEFAULT: 'border-slate-200', // default border
    LIGHT: 'border-slate-200/80', // lighter border
    ACCENT: 'border-blue-600', // accent border
  },

  // Shadows
  SHADOW: {
    NONE: 'shadow-none',
    LIGHT: 'shadow-light',
    STANDARD: 'shadow-standard',
    MEDIUM: 'shadow-medium',
    DARK: 'shadow-dark',
  },

  // Border radius
  ROUNDED: {
    NONE: 'rounded-none',
    SM: 'rounded-sm',
    MD: 'rounded-md',
    LG: 'rounded-lg',
    XL: 'rounded-xl',
    XXL: 'rounded-2xl', // standard card radius
    XXXL: 'rounded-3xl',
    FULL: 'rounded-full', // pill shape
  },

  // Transitions
  TRANSITION: {
    NONE: 'transition-none',
    QUICK: 'transition-quick',
    STANDARD: 'transition-standard',
    SMOOTH: 'transition-smooth',
  },

  // Typography - semantic classes
  TYPOGRAPHY: {
    TITLE_HERO: 'text-title-hero font-extrabold',
    TITLE: 'text-title font-extrabold',
    TITLE_MEDIUM: 'text-title-md font-extrabold',
    TITLE_SMALL: 'text-title-sm font-bold',
    SUBTITLE: 'text-subtitle font-bold',
    SUBTITLE_LARGE: 'text-subtitle-lg font-semibold',
    BODY: 'text-body font-normal',
    BODY_LARGE: 'text-body-lg font-normal',
    BODY_SMALL: 'text-body-sm font-normal',
    CAPTION: 'text-caption font-semibold',
    CAPTION_LARGE: 'text-caption-lg font-semibold',
    CAPTION_SMALL: 'text-caption-sm font-semibold',
    LABEL: 'text-label font-bold uppercase tracking-wider',
    EYEBROW: 'text-eyebrow font-extrabold uppercase tracking-widest',
    BUTTON: 'text-button font-bold',
  },

  // Spacing utilities
  PADDING: {
    CONTAINER: 'px-4.5',
    CARD: 'p-4.5',
    BUTTON: 'px-3.5 py-2',
  },

  // Common button styles
  BUTTON: {
    BASE: 'cursor-pointer border-0 outline-0 transition-standard',
    PRIMARY: 'h-12 rounded-2xl bg-blue-600 text-white font-bold shadow-glow hover:shadow-button-hover',
    SECONDARY: 'h-12 rounded-2xl border border-white/16 bg-white/10 text-white font-bold backdrop-blur-sm',
    MUTED: 'rounded-full border border-slate-200/80 bg-white/80 text-slate-900 shadow-button-secondary',
  },

  // Common input styles
  INPUT: {
    BASE: 'border-0 bg-transparent outline-none font-inherit',
    PLACEHOLDER: 'placeholder:text-slate-400',
    SEARCH_WRAPPER: 'rounded-full border border-slate-200/80 bg-white/80 shadow-[0_10px_20px_rgba(37,99,235,0.2)] backdrop-blur-md',
  },

  // Common card styles
  CARD: {
    BASE: 'border border-slate-200 rounded-2xl bg-white/80 shadow-standard',
    ELEVATED: 'border border-slate-200 rounded-2xl bg-white shadow-medium',
    GLASS: 'border border-slate-200/30 rounded-2xl bg-white/10 backdrop-blur-md',
  },

  // Layout utilities
  LAYOUT: {
    FLEX_CENTER: 'flex items-center justify-center',
    FLEX_BETWEEN: 'flex items-center justify-between',
    FLEX_COL: 'flex flex-col',
    GRID_CENTER: 'grid place-items-center',
    CONTAINER: 'w-min(1280px, calc(100vw - 64px)) mx-auto',
  },
}

// ============= COMMONLY USED VALUE COLLECTIONS =============

export const LAYOUT_DEFAULTS = {
  HEADER_HEIGHT: 'h-14',
  NAV_HEIGHT: 'h-10',
  SEARCH_HEIGHT: 'min-h-14',
  BUTTON_HEIGHT: 'h-12',
  ICON_SIZE: 'h-9 w-9',
  SMALL_ICON_SIZE: 'h-6 w-6',
}

export const SPACING_DEFAULTS = {
  CONTAINER_PADDING: '0 18px 32px',
  SECTION_GAP: 'gap-4',
  COMPONENT_GAP: 'gap-2.5',
  ITEM_GAP: 'gap-2',
  MARGIN_SECTION: 'mx-4.5 mb-4',
}

export const COLOR_ACCENTS = {
  BLUE: 'from-blue-600 to-cyan-500',
  BLUE_DARK: 'from-blue-600 to-blue-700',
  GRADIENT_ICON_BG: 'bg-[linear-gradient(135deg,rgba(37,99,235,0.12),rgba(14,165,233,0.12))]',
}

// ============= COMPOSITE STYLE OBJECTS =============
// For when you need to pass multiple style properties

export const COMMON_STYLES = {
  // Card with default styling
  card: {
    className: 'border border-slate-200 rounded-2xl bg-white/80 shadow-standard',
  },

  // Search bar styling
  searchBar: {
    wrapper: 'grid min-h-14 items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/80 px-3 shadow-[0_10px_20px_rgba(37,99,235,0.2)] backdrop-blur-md',
    input: 'min-w-0 border-0 bg-transparent text-slate-900 outline-none placeholder:text-slate-400',
  },

  // Button with primary gradient
  buttonPrimary: {
    className: 'h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 text-white font-bold shadow-[0_14px_26px_rgba(37,99,235,0.2)]',
  },

  // Navigation link styling
  navLink: {
    className: 'relative inline-flex min-h-9 items-center rounded-full px-3 text-sm font-semibold text-slate-600 transition hover:-translate-y-px hover:bg-blue-50 hover:text-blue-800',
  },

  // Category item styling
  categoryItem: {
    className: 'flex min-h-13.5 items-center gap-3 rounded-2xl px-2.5 py-2 transition hover:-translate-x-1 hover:bg-blue-50 hover:shadow-[0_10px_22px_rgba(15,23,42,0.05)]',
  },
}

// ============= EXPORT REFERENCE GUIDE =============
/*
USAGE EXAMPLES:

1. Text color (semantic):
   <p className={SEMANTIC_CLASSES.TEXT.MUTED}>Secondary text</p>

2. Button styling:
   <button className={SEMANTIC_CLASSES.BUTTON.PRIMARY}>Click me</button>

3. Card layout:
   <div className={SEMANTIC_CLASSES.CARD.BASE}>Card content</div>

4. Typography:
   <h1 className={SEMANTIC_CLASSES.TYPOGRAPHY.TITLE_HERO}>Main title</h1>

5. Common compositions:
   <div className={COMMON_STYLES.card.className}>...</div>

6. Spacing:
   <section className={SPACING_DEFAULTS.MARGIN_SECTION}>...</section>

7. Colors from tokens:
   style={{ color: BRAND_COLORS.PRIMARY }}
   style={{ backgroundColor: COLORS.BG_SURFACE }}

8. Shadows from tokens:
   style={{ boxShadow: SHADOWS.STANDARD }}

All these are centralized here to ensure consistency across the app!
*/
