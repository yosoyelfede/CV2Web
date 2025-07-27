/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // High Contrast Color System
        primary: {
          50: 'hsl(var(--color-primary-50))',
          100: 'hsl(var(--color-primary-100))',
          200: 'hsl(var(--color-primary-200))',
          300: 'hsl(var(--color-primary-300))',
          400: 'hsl(var(--color-primary-400))',
          500: 'hsl(var(--color-primary-500))',
          600: 'hsl(var(--color-primary-600))',
          700: 'hsl(var(--color-primary-700))',
          800: 'hsl(var(--color-primary-800))',
          900: 'hsl(var(--color-primary-900))',
          950: 'hsl(var(--color-primary-950))',
          DEFAULT: 'hsl(var(--color-primary-600))',
        },
        secondary: {
          50: 'hsl(var(--color-secondary-50))',
          100: 'hsl(var(--color-secondary-100))',
          200: 'hsl(var(--color-secondary-200))',
          300: 'hsl(var(--color-secondary-300))',
          400: 'hsl(var(--color-secondary-400))',
          500: 'hsl(var(--color-secondary-500))',
          600: 'hsl(var(--color-secondary-600))',
          700: 'hsl(var(--color-secondary-700))',
          800: 'hsl(var(--color-secondary-800))',
          900: 'hsl(var(--color-secondary-900))',
          950: 'hsl(var(--color-secondary-950))',
          DEFAULT: 'hsl(var(--color-secondary-600))',
        },
        accent: {
          50: 'hsl(var(--color-accent-50))',
          100: 'hsl(var(--color-accent-100))',
          200: 'hsl(var(--color-accent-200))',
          300: 'hsl(var(--color-accent-300))',
          400: 'hsl(var(--color-accent-400))',
          500: 'hsl(var(--color-accent-500))',
          600: 'hsl(var(--color-accent-600))',
          700: 'hsl(var(--color-accent-700))',
          800: 'hsl(var(--color-accent-800))',
          900: 'hsl(var(--color-accent-900))',
          950: 'hsl(var(--color-accent-950))',
          DEFAULT: 'hsl(var(--color-accent-600))',
        },
        surface: {
          0: 'hsl(var(--color-surface-0))',
          1: 'hsl(var(--color-surface-1))',
          2: 'hsl(var(--color-surface-2))',
          3: 'hsl(var(--color-surface-3))',
          4: 'hsl(var(--color-surface-4))',
          5: 'hsl(var(--color-surface-5))',
        },
        neutral: {
          50: 'hsl(var(--color-neutral-50))',
          100: 'hsl(var(--color-neutral-100))',
          200: 'hsl(var(--color-neutral-200))',
          300: 'hsl(var(--color-neutral-300))',
          400: 'hsl(var(--color-neutral-400))',
          500: 'hsl(var(--color-neutral-500))',
          600: 'hsl(var(--color-neutral-600))',
          700: 'hsl(var(--color-neutral-700))',
          800: 'hsl(var(--color-neutral-800))',
          900: 'hsl(var(--color-neutral-900))',
          950: 'hsl(var(--color-neutral-950))',
        },
        success: {
          DEFAULT: 'hsl(var(--color-success))',
        },
        error: {
          DEFAULT: 'hsl(var(--color-error))',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      fontSize: {
        'display-large': ['3.5rem', { lineHeight: '1.12', letterSpacing: '-0.25px' }],
        'display-medium': ['2.8rem', { lineHeight: '1.16', letterSpacing: '-0.15px' }],
        'display-small': ['2.25rem', { lineHeight: '1.22', letterSpacing: '-0.1px' }],
        'headline-large': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.1px' }],
        'headline-medium': ['1.75rem', { lineHeight: '1.29', letterSpacing: '-0.1px' }],
        'headline-small': ['1.5rem', { lineHeight: '1.33', letterSpacing: '-0.1px' }],
        'title-large': ['1.375rem', { lineHeight: '1.27', letterSpacing: '-0.1px' }],
        'title-medium': ['1rem', { lineHeight: '1.5', letterSpacing: '0.15px' }],
        'title-small': ['0.875rem', { lineHeight: '1.43', letterSpacing: '0.1px' }],
        'body-large': ['1rem', { lineHeight: '1.5', letterSpacing: '0.5px' }],
        'body-medium': ['0.875rem', { lineHeight: '1.43', letterSpacing: '0.25px' }],
        'body-small': ['0.75rem', { lineHeight: '1.33', letterSpacing: '0.4px' }],
        'label-large': ['0.875rem', { lineHeight: '1.43', letterSpacing: '0.1px' }],
        'label-medium': ['0.75rem', { lineHeight: '1.33', letterSpacing: '0.5px' }],
        'label-small': ['0.6875rem', { lineHeight: '1.45', letterSpacing: '0.5px' }],
      },
      spacing: {
        '1': '0.25rem',   /* 4dp */
        '2': '0.5rem',    /* 8dp */
        '3': '0.75rem',   /* 12dp */
        '4': '1rem',      /* 16dp */
        '5': '1.25rem',   /* 20dp */
        '6': '1.5rem',    /* 24dp */
        '8': '2rem',      /* 32dp */
        '10': '2.5rem',   /* 40dp */
        '12': '3rem',     /* 48dp */
        '16': '4rem',     /* 64dp */
        '20': '5rem',     /* 80dp */
        '24': '6rem',     /* 96dp */
        '32': '8rem',     /* 128dp */
        '40': '10rem',    /* 160dp */
        '48': '12rem',    /* 192dp */
        '56': '14rem',    /* 224dp */
        '64': '16rem',    /* 256dp */
      },
      boxShadow: {
        '1': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        '2': '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
        '3': '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
        '4': '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
        '5': '0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 