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
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#1746A2', // Kivora Blue Oficial
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#172554',
          950: '#0A192F', // Kivora Navy Oficial
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
        display: ['"GeistVariable"', '"Geist"', '"Inter Tight"', '"DM Sans"', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        tight: ['"Inter Tight"', '"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'clean': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
        'card-hover': '0 20px 40px -12px rgba(15, 23, 42, 0.12), 0 8px 16px -4px rgba(15, 23, 42, 0.06)',
        'glow-blue': '0 0 40px -10px rgba(23, 70, 162, 0.35)',
        'glow-orange': '0 0 35px -10px rgba(255, 101, 0, 0.4)',
        'receipt': '0 25px 50px -12px rgba(10, 25, 47, 0.25)',
        'header': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
