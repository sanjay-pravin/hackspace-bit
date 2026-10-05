/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B0F19',
          dark: '#0F172A',
          card: '#1E293B',
          cardBorder: '#334155',
          indigo: '#4F46E5',
          indigoHover: '#4338CA',
          indigoLight: '#EEF2FF',
          cyan: '#06B6D4',
          cyanHover: '#0891B2',
          cyanLight: '#ECFEFF',
          muted: '#94A3B8',
        }
      }
    },
  },
  plugins: [],
}