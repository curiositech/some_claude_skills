/** @type {import('tailwindcss').Config} */
module.exports = {
  // Enable dark mode via class strategy (for Docusaurus compatibility)
  darkMode: ['class', '[data-theme="dark"]'],

  // Content paths for Tailwind to scan
  content: [
    './src/**/*.{js,jsx,ts,tsx,mdx}',
    './docs/**/*.{md,mdx}',
  ],

  theme: {
    // Container defaults
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },

    extend: {
      // ═══════════════════════════════════════════════════════════════════
      // COLOR TOKENS - Windows 3.1 Design System
      // ═══════════════════════════════════════════════════════════════════
      colors: {
        // Core brand colors mapped to CSS variables for theming
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // Primary brand color (indigo/purple)
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },

        // Secondary/muted color
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },

        // Destructive/danger
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },

        // Muted backgrounds
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },

        // Accent colors
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },

        // Popover/dropdown backgrounds
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },

        // Card backgrounds
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // ═══════════════════════════════════════════════════════════════════
        // WINDOWS 3.1 PALETTE - Direct color tokens
        // ═══════════════════════════════════════════════════════════════════
        win31: {
          gray: '#c0c0c0',
          'dark-gray': '#808080',
          'light-gray': '#dfdfdf',
          white: '#ffffff',
          black: '#000000',
          navy: '#000080',
          blue: '#0000ff',
          teal: '#008080',
          desktop: '#008080',
          yellow: '#FFFF00',
          'bright-yellow': '#FFD700',
          red: '#FF0000',
          'bright-red': '#DC143C',
          magenta: '#FF00FF',
          lime: '#00FF00',
        },
      },

      // ═══════════════════════════════════════════════════════════════════
      // BORDER RADIUS TOKENS
      // ═══════════════════════════════════════════════════════════════════
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // Win31 specific - pixel perfect corners
        win31: '0px',
      },

      // ═══════════════════════════════════════════════════════════════════
      // TYPOGRAPHY - Font Families
      // ═══════════════════════════════════════════════════════════════════
      fontFamily: {
        // Display font - pixel art hero titles, stickers, badges
        display: ['var(--font-display)', 'cursive'],
        // Window title bars - retro VT terminal aesthetic
        window: ['var(--font-window)', 'monospace'],
        // UI system font - navbar, buttons, menus, labels
        system: ['var(--font-system)', 'monospace'],
        // Body text - readable typewriter style for docs
        body: ['var(--font-body)', 'Courier New', 'monospace'],
        // Code - same as system for consistency
        code: ['var(--font-code)', 'Courier New', 'monospace'],
        // Sans for modern contexts
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        // Mono fallback
        mono: ['var(--font-code)', 'ui-monospace', 'monospace'],
      },

      // ═══════════════════════════════════════════════════════════════════
      // SPACING TOKENS (no arbitrary values!)
      // ═══════════════════════════════════════════════════════════════════
      spacing: {
        'win31-border': '2px',
        'win31-title': '18px',
        'win31-button': '16px',
      },

      // ═══════════════════════════════════════════════════════════════════
      // BOX SHADOW TOKENS
      // ═══════════════════════════════════════════════════════════════════
      boxShadow: {
        // Win31 beveled outset (raised)
        'win31-outset': 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080, 2px 2px 0 rgba(0, 0, 0, 0.25)',
        // Win31 beveled inset (pressed)
        'win31-inset': 'inset -1px -1px 0 #ffffff, inset 1px 1px 0 #808080',
        // Win31 window shadow
        'win31-window': 'inset 2px 2px 0 #ffffff, inset -2px -2px 0 #808080, 6px 6px 0 rgba(0, 0, 0, 0.4)',
      },

      // ═══════════════════════════════════════════════════════════════════
      // ANIMATIONS
      // ═══════════════════════════════════════════════════════════════════
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'slide-in-from-top': {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-in-from-bottom': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-in-from-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-from-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
      },
    },
  },

  plugins: [],
};
