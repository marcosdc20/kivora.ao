/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Kivora Primary Palette (Azul Royal & Marinho)
          navy: '#0A192F',
          'navy-dark': '#071120',
          blue: '#2563EB',
          'blue-dark': '#1E40AF',
          'blue-hover': '#1D4ED8',
          'blue-light': '#EFF6FF',
          cyan: '#00B4D8',
          // Kivora Secondary Accent Palette (Laranja Âmbar / Dourado)
          amber: '#F59E0B',
          'amber-dark': '#D97706',
          'amber-light': '#FEF3C7',
          // Mapeamento retrocompatível para componentes existentes
          green: '#2563EB',
          'green-dark': '#1E40AF',
          'green-hover': '#1D4ED8',
          'green-light': '#EFF6FF',
          yellow: '#F59E0B',
          'yellow-dark': '#D97706',
          gold: '#F59E0B',
          'gold-dark': '#D97706',
          dark: '#0A192F',
          body: '#475569',
          bg: '#F8FAFC',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 12px 30px -4px rgba(0, 0, 0, 0.1)',
        'header': '0 2px 10px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
