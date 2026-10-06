/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#faf8f4',
          surface: '#ffffff',
          alt: '#f3efe8',
        },
        ink: {
          primary: '#1c1b19',
          secondary: '#6b6863',
          muted: '#9a958e',
        },
        border: {
          base: '#e2ddd3',
          subtle: '#ece8df',
        },
        accent: {
          DEFAULT: '#2d5f5d',
          light: '#4a8580',
          bg: '#e8f0ee',
          'bg-hover': '#dceae7',
        },
        amber: {
          DEFAULT: '#b8732e',
          bg: '#f5ede0',
        },
        success: {
          DEFAULT: '#5a7c4f',
          bg: '#e8f0e5',
        },
        warning: {
          DEFAULT: '#c4943b',
          bg: '#f5edda',
        },
        error: {
          DEFAULT: '#a04040',
          bg: '#f0e4e4',
        },
        locked: '#c8c4bc',
      },
      fontFamily: {
        sans: ['Tajawal', 'system-ui', 'sans-serif'],
        serif: ['Amiri', 'Georgia', 'serif'],
      },
      borderRadius: {
        'sm': '3px',
        'md': '5px',
        'lg': '8px',
        'xl': '10px',
      },
    },
  },
  plugins: [],
};
