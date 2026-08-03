/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#FAF6EF",
        ink: "#2B2620",
        teal: {
          DEFAULT: "#1F5C52",
          dark: "#123D36",
          light: "#DCEAE6",
        },
        gold: {
          DEFAULT: "#C08829",
          light: "#F3E4C4",
        },
        line: "#E6DFD0",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};
