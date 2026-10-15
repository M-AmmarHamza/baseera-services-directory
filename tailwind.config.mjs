/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./*.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#006948',
        'primary-container': '#00855d',
        secondary: '#006c49',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f1f3ff',
        'surface-container': '#e9edff',
        'surface-container-high': '#e1e8fd',
        'on-surface': '#141b2b',
        'on-surface-variant': '#3d4a42',
        outline: '#6d7a72',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        urdu: ['var(--font-urdu)', 'Noto Nastaliq Urdu', 'serif'],
        arabic: ['var(--font-tajawal)', 'Noto Sans Arabic', 'Cairo', 'sans-serif']
      }
    },
  },
  plugins: [],
};
