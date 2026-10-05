/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#6B4F3A',
          dark: '#352A24',
          light: '#A98262',
          50: '#FAF6F1',
          100: '#F2E9DE',
          200: '#E4D2BE',
          300: '#D4B99C',
          400: '#C69C5D',
          500: '#A98262',
          600: '#8A6A4F',
          700: '#6B4F3A',
          800: '#52402F',
          900: '#352A24',
        },
        gold: {
          DEFAULT: '#C69C5D',
          light: '#DDB878',
          dark: '#A87E40',
        },
        sage: {
          DEFAULT: '#6F8A72',
          light: '#8FA892',
          dark: '#5A7360',
          50: '#EEF3EF',
          100: '#DDE7DF',
        },
        cream: '#F7F2EA',
        parchment: '#FBF7F0',
      },
      fontFamily: {
        sans: ['Tajawal', 'Cairo', 'system-ui', 'sans-serif'],
        heading: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(53, 42, 36, 0.06), 0 4px 12px rgba(53, 42, 36, 0.04)',
        'card-hover': '0 4px 8px rgba(53, 42, 36, 0.08), 0 12px 28px rgba(53, 42, 36, 0.08)',
        soft: '0 2px 8px rgba(53, 42, 36, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
