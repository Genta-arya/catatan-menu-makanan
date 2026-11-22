/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F5F7F5',
          100: '#E6ECE5',
          200: '#CFDDD0',
          300: '#A9C2AA',
          400: '#84A586',
          500: '#648866',
          600: '#4D6B4F',
          700: '#3F5641',
          800: '#344535',
          900: '#2C3A2D',
          950: '#161F17',
        },
        morning: {
          light: '#FFEDD5',
          DEFAULT: '#F97316',
          dark: '#9A3412',
        },
        lunch: {
          light: '#FEF08A',
          DEFAULT: '#EAB308',
          dark: '#854D0E',
        },
        dinner: {
          light: '#E0E7FF',
          DEFAULT: '#6366F1',
          dark: '#3730A3',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        'sage-sm': '0 1px 3px rgba(44, 58, 45, 0.08)',
        'sage-md': '0 4px 12px rgba(44, 58, 45, 0.08), 0 2px 4px rgba(44, 58, 45, 0.04)',
        'sage-lg': '0 10px 25px rgba(44, 58, 45, 0.1), 0 4px 10px rgba(44, 58, 45, 0.05)',
      },
    },
  },
  plugins: [],
};
