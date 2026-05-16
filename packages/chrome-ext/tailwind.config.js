/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/popup/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: "#0d0e0f",
          lighter: "#1a1b1c",
        },
        primary: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
        }
      }
    },
  },
  plugins: [],
}
