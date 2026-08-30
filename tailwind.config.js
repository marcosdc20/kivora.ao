/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kivora: {
          // Paleta Primária Oficial KIVORA
          navy: '#0A192F',
          'navy-deep': '#060E1A',
          'navy-surface': '#0F224A',
          blue: '#1746A2',
          'blue-hover': '#1E40AF',
          cobalt: '#2563EB',
          sky: '#38BDF8',
          // Laranja Oficial de Ação (CTA) do Logótipo
          orange: '#FF6500',
          'orange-hover': '#EB5B00',
          'orange-subtle': '#FFF7ED',
          // Verde de Conformidade Fiscal AGT
          emerald: '#059669',
          'emerald-light': '#10B981',
          'emerald-subtle': '#ECFDF5',
          // Superfícies e Linhas
          canvas: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          'border-subtle': '#F1F5F9',
          muted: '#64748B',
          dark: '#0F172A',
        },
        brand: {
          navy: '#0A192F',
          'navy-dark': '#071120',
          blue: '#1746A2',
          'blue-dark': '#1E40AF',
          'blue-hover': '#1D4ED8',
          'blue-light': '#EFF6FF',
          orange: '#FF6500',
          'orange-hover': '#EB5B00',
          green: '#059669',
          'green-dark': '#047857',
          emerald: '#059669',
          dark: '#0A192F',
          body: '#475569',
          bg: '#F8FAFC',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        display: ['"Cabinet Grotesk"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['"Satoshi"', '"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'clean': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 30px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'receipt': '0 25px 50px -12px rgba(10, 25, 47, 0.25)',
        'header': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
