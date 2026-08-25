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
        solana: {
          purple: '#9945FF',
          green: '#14F195',
          yellow: '#FED700',
        },
      },
    },
  },
  plugins: [],
}
