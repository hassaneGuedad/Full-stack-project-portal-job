/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Activer le mode sombre basé sur la classe
  theme: {
    extend: {
      colors: {
        "primary": "#141414",
        "blue": "#3575E2"
      }
    },
  },
  plugins: [],
}

