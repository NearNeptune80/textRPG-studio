/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#121118",
        darkPanel: "#1c1a24",
        darkHeader: "#262332",
      }
    },
  },
  plugins: [],
}
