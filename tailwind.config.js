/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#28a745',
          dark: '#218838',
          light: '#34ce57',
        },
        secondary: '#20c997',
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

