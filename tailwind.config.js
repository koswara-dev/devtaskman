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
          50: '#f4f6fb',
          100: '#e8ecf6',
          200: '#cbd6ec',
          300: '#9fb5df',
          400: '#6c8dcd',
          500: '#3a62d0',
          600: '#2a4ba9',
          700: '#213a85',
          800: '#1b2d69',
          950: '#0e173a',
        },
        dev: {
          500: '#6366f1',
          600: '#4f46e5',
        },
        qa: {
          500: '#ec4899',
          600: '#db2777',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
