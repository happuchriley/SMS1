/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10b981', // Emerald-500
          dark: '#047857', // Emerald-700
          light: '#34d399', // Emerald-400
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        secondary: {
          DEFAULT: '#14b8a6', // Teal-500
          500: '#14b8a6',
          600: '#0d9488',
        },
      },
      spacing: {
        'sidebar': '260px',
      },
      boxShadow: {
        'sm': '0 2px 4px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'xl': '0 12px 32px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'pulse': 'pulse 2s ease-in-out infinite',
        'gradient': 'gradientShift 15s ease infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}

