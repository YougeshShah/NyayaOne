/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F4C3A", // forest green - distinct from company portal navy
          light: "#1D6E52",
          dark: "#0A3327",
        },
        accent: {
          DEFAULT: "#B8860B",
        },
      },
    },
  },
  plugins: [],
};
