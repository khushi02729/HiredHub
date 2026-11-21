/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE', 300: '#A5B4FC', 400: '#818CF8', 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA', 800: '#3730A3', 900: '#312E81' },
        ink: '#0F172A',
        surface: '#F8FAFC',
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { card: '1.125rem', panel: '1.5rem' },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.04), 0 6px 20px -8px rgb(79 70 229 / 0.12)',
        lift: '0 14px 34px -10px rgb(79 70 229 / 0.32)',
      },
      backgroundImage: { brand: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' },
    },
  },
  plugins: [],
};
