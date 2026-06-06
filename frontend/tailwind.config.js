/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal — azul marino institucional (estilo gobierno Durango)
        navy: {
          50:  '#f0f4fa',
          100: '#dce7f3',
          200: '#b9cfe7',
          300: '#8aaed5',
          400: '#5a88bf',
          500: '#3a6eaa',
          600: '#2a5490',
          700: '#1e3f72',  // color primario de marca
          800: '#162d54',
          900: '#0e1e38',
          950: '#070f1e',
        },
        // Escala de grises funcional
        surface: '#ffffff',
        'gray-app': {
          50:  '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Verde WhatsApp — convención universal, solo para ese botón
        whatsapp: '#25D366',
        'whatsapp-dark': '#128C7E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Escala mínima ≥18px para cuerpo (accesibilidad 50+)
        'body-sm': ['18px', { lineHeight: '1.6' }],
        'body':    ['20px', { lineHeight: '1.6' }],
        'body-lg': ['22px', { lineHeight: '1.5' }],
        'title-sm': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'title':    ['28px', { lineHeight: '1.2', fontWeight: '600' }],
        'title-lg': ['34px', { lineHeight: '1.15', fontWeight: '700' }],
        'hero':     ['42px', { lineHeight: '1.1', fontWeight: '700' }],
      },
      spacing: {
        // Tamaño mínimo de botón táctil: 48×48px
        'tap': '48px',
      },
      borderRadius: {
        'card': '12px',
        'pill': '999px',
        'panel': '20px',
      },
      boxShadow: {
        'card': '0 2px 8px 0 rgba(14,30,56,0.08)',
        'card-hover': '0 4px 16px 0 rgba(14,30,56,0.14)',
        'fab': '0 4px 20px 0 rgba(14,30,56,0.25)',
        'panel': '0 -4px 32px 0 rgba(14,30,56,0.18)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        'fade-in':  'fadeIn 0.2s ease-out',
        'pulse-dot': 'pulseDot 1.4s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        pulseDot: {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.4' },
          '40%':           { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
