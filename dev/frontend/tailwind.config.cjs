/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['LINE Seed Sans', 'sans-serif'], // default text
        logo: ['Alatsi', 'sans-serif'],         // for logo
      },
      colors: {
        bgPrimary: '#0f0f0f',
        bgSecondary: '#1a1a1a',
        textPrimary: '#ffffff',
        textSecondary: '#b3b3b3',
        accent: '#ec4899',
      },
    },
  },
  plugins: [],
}
