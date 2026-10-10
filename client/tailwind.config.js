/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dbe4ff',
          500: '#4f63d2',
          600: '#3b4fd0',
          700: '#2e3faa',
          900: '#1a2066',
        },
      },
    },
  },
  plugins: [],
}

