/** @type {import('tailwindcss').Config} */
import { tailwindColors, tailwindTypography, tailwindSpacing } from './src/theme/index.js'

export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // Extended color palette with semantic tokens
      colors: tailwindColors,

      // Extended spacing scale
      spacing: tailwindSpacing.spacing,

      // Extended border radius
      borderRadius: tailwindSpacing.borderRadius,

      // Extended box shadows
      boxShadow: tailwindSpacing.boxShadow,

      // Extended transition duration
      transitionDuration: tailwindSpacing.transitionDuration,

      // Typography scale
      fontSize: {
        'title-hero': ['clamp(2.6rem, 4.5vw, 4.35rem)', { fontWeight: 800, lineHeight: 0.98 }],
        'title': ['clamp(1.45rem, 2vw, 2rem)', { fontWeight: 800, lineHeight: 1.2 }],
        'title-md': ['1.55rem', { fontWeight: 800, lineHeight: 1 }],
        'title-sm': ['1.35rem', { fontWeight: 700, lineHeight: 1.2 }],
        'subtitle': ['0.93rem', { fontWeight: 700, lineHeight: 1.4 }],
        'subtitle-lg': ['0.98rem', { fontWeight: 600, lineHeight: 1.5 }],
        'body': ['0.93rem', { fontWeight: 400, lineHeight: 1.6 }],
        'body-lg': ['0.98rem', { fontWeight: 400, lineHeight: 1.65 }],
        'body-sm': ['0.88rem', { fontWeight: 400, lineHeight: 1.5 }],
        'caption': ['0.78rem', { fontWeight: 600, lineHeight: 1.3 }],
        'caption-lg': ['0.8rem', { fontWeight: 600, lineHeight: 1.4 }],
        'caption-sm': ['0.74rem', { fontWeight: 600, lineHeight: 1.2 }],
        'label': ['0.78rem', { fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }],
        'eyebrow': ['0.78rem', { fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }],
        'button': ['0.95rem', { fontWeight: 700, lineHeight: 1 }],
      },

      // Custom height utilities
      height: {
        '2.25': '0.5625rem', // dot height
        '9': '2.25rem',
        '10': '2.5rem',
        '13.5': '3.375rem',
        '14': '3.5rem',
        '90': '22.5rem',
        '117': '29.25rem',
        '125': '31.25rem',
      },

      // Custom width utilities
      width: {
        '2.25': '0.5625rem',
        '7': '1.75rem',
        '9': '2.25rem',
      },

      // Custom max-width utilities
      maxWidth: {
        '130': '32.5rem',
      },

      // Custom min-height utilities
      minHeight: {
        '9': '2.25rem',
        '10': '2.5rem',
        '13.5': '3.375rem',
        '14': '3.5rem',
        '50': '12.5rem',
        '117': '29.25rem',
        '120': '30rem',
        '125': '31.25rem',
        '138': '8.625rem',
        '180': '11.25rem',
        '220': '13.75rem',
      },

      // Custom padding utilities
      padding: {
        '2.5': '0.625rem',
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '8.5': '2.125rem',
      },

      // Custom margin utilities
      margin: {
        '-1': '-0.25rem',
        '4.5': '1.125rem',
      },

      // Custom gap utilities
      gap: {
        '0.5': '0.125rem',
        '2.5': '0.625rem',
        '4.5': '1.125rem',
      },

      // Custom px and py
      paddingX: {
        '4.5': '1.125rem',
      },
      paddingY: {
        '2.5': '0.625rem',
        '5.5': '1.375rem',
      },

      // Gradients
      backgroundImage: {
        'linear-to-b': 'linear-gradient(to bottom, var(--tw-gradient-stops))',
      },

      // Z-index scale
      zIndex: {
        '-1': '-1',
        '1': '1',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        '60': '60',
        '70': '70',
        '80': '80',
      },

      // Font family
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
