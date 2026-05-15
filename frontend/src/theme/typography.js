/**
 * SEMANTIC TYPOGRAPHY TOKENS
 * Standardized text styles with semantic naming
 * Use these instead of hardcoded font-size/weight combinations
 */

export const TYPOGRAPHY = {
  // Heading styles
  TITLE_HERO: {
    fontSize: 'clamp(2.6rem, 4.5vw, 4.35rem)',
    fontWeight: 800, // extrabold
    lineHeight: 0.98,
    letterSpacing: '-0.04em',
  },
  TITLE_LARGE: {
    fontSize: 'clamp(1.45rem, 2vw, 2rem)',
    fontWeight: 800,
    lineHeight: 1.2,
  },
  TITLE_MEDIUM: {
    fontSize: '1.55rem',
    fontWeight: 800,
    lineHeight: 1,
  },
  TITLE_SMALL: {
    fontSize: '1.35rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },

  // Subtitle/secondary heading styles
  SUBTITLE_LARGE: {
    fontSize: '0.98rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  SUBTITLE_MEDIUM: {
    fontSize: '0.93rem',
    fontWeight: 700,
    lineHeight: 1.4,
  },
  SUBTITLE_SMALL: {
    fontSize: '0.88rem',
    fontWeight: 700,
    lineHeight: 1.3,
  },

  // Body text styles
  BODY_LARGE: {
    fontSize: '0.98rem',
    fontWeight: 400,
    lineHeight: 1.65,
  },
  BODY_MEDIUM: {
    fontSize: '0.93rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  BODY_SMALL: {
    fontSize: '0.88rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },

  // Caption/small text styles
  CAPTION_LARGE: {
    fontSize: '0.8rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  CAPTION_MEDIUM: {
    fontSize: '0.78rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  CAPTION_SMALL: {
    fontSize: '0.74rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },

  // Special styles
  LABEL: {
    fontSize: '0.78rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  EYEBROW: {
    fontSize: '0.78rem',
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  BUTTON: {
    fontSize: '0.95rem',
    fontWeight: 700,
    lineHeight: 1,
  },
}

// Tailwind typography extension
export const tailwindTypography = {
  sizes: {
    'text-title-hero': {
      fontSize: 'clamp(2.6rem, 4.5vw, 4.35rem)',
      fontWeight: 800,
      lineHeight: 0.98,
      letterSpacing: '-0.04em',
    },
    'text-title': TYPOGRAPHY.TITLE_LARGE,
    'text-title-md': TYPOGRAPHY.TITLE_MEDIUM,
    'text-title-sm': TYPOGRAPHY.TITLE_SMALL,
    'text-subtitle': TYPOGRAPHY.SUBTITLE_MEDIUM,
    'text-subtitle-lg': TYPOGRAPHY.SUBTITLE_LARGE,
    'text-body': TYPOGRAPHY.BODY_MEDIUM,
    'text-body-lg': TYPOGRAPHY.BODY_LARGE,
    'text-body-sm': TYPOGRAPHY.BODY_SMALL,
    'text-caption': TYPOGRAPHY.CAPTION_MEDIUM,
    'text-caption-lg': TYPOGRAPHY.CAPTION_LARGE,
    'text-caption-sm': TYPOGRAPHY.CAPTION_SMALL,
    'text-label': TYPOGRAPHY.LABEL,
    'text-eyebrow': TYPOGRAPHY.EYEBROW,
    'text-button': TYPOGRAPHY.BUTTON,
  },
}

// Helper to apply typography styles to className
export const getTypographyClasses = (typographyToken) => {
  const { fontSize, fontWeight, lineHeight, letterSpacing, textTransform } = typographyToken
  const classes = []

  // Map font-weight to Tailwind
  const fontWeightMap = {
    400: 'font-normal',
    600: 'font-semibold',
    700: 'font-bold',
    800: 'font-extrabold',
  }

  if (fontSize) classes.push(`text-[${fontSize}]`)
  if (fontWeight) classes.push(fontWeightMap[fontWeight] || `font-[${fontWeight}]`)
  if (lineHeight) classes.push(`leading-[${lineHeight}]`)
  if (letterSpacing) classes.push(`tracking-[${letterSpacing}]`)
  if (textTransform) classes.push(`${textTransform.toLowerCase()}`)

  return classes.join(' ')
}
