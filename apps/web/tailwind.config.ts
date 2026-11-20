import type { Config } from 'tailwindcss';

/**
 * URJ design tokens — "Architectural Linen & Obsidian".
 * Source: Google AI Studio design handoff (DESIGN_HANDOFF.md §3–4).
 * Colour roles follow a 60 / 30 / 10 split: canvas, surface, bronze accent.
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FAFAF8',
        surface: {
          DEFAULT: '#F2F1ED',
          elevated: '#FFFFFF'
        },
        hairline: '#E4E2DC',
        ink: {
          DEFAULT: '#141413',
          hover: '#2E2D2A',
          muted: '#5C5A54',
          subtle: '#78756E'
        },
        accent: {
          DEFAULT: '#8C6239',
          hover: '#734F2D',
          light: '#E5C9A6'
        },
        status: {
          positive: '#15803D',
          pending: '#92400E',
          negative: '#B91C1C'
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      fontSize: {
        kicker: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.08em' }],
        caption: ['0.6875rem', { lineHeight: '1rem' }]
      },
      maxWidth: {
        site: '80rem'
      },
      aspectRatio: {
        portrait: '3 / 4',
        landscape: '4 / 3',
        wide: '16 / 9'
      }
    }
  },
  plugins: []
};

export default config;
