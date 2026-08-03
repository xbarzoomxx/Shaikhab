/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — each backed by an HSL CSS variable that flips
        // value between :root (light) and .dark (dark) in globals.css.
        bg: "hsl(var(--bg) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        "surface-raised": "hsl(var(--surface-raised) / <alpha-value>)",
        ink: "hsl(var(--ink) / <alpha-value>)",
        "ink-muted": "hsl(var(--ink-muted) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",

        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          hover: "hsl(var(--primary-hover) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          light: "hsl(var(--primary-light) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          hover: "hsl(var(--accent-hover) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          light: "hsl(var(--accent-light) / <alpha-value>)",
        },

        // Legacy aliases so existing className references (sand, ink, teal,
        // gold, line) keep working while the codebase migrates fully.
        sand: "hsl(var(--bg) / <alpha-value>)",
        teal: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          dark: "hsl(var(--primary-hover) / <alpha-value>)",
          light: "hsl(var(--primary-light) / <alpha-value>)",
        },
        gold: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          light: "hsl(var(--accent-light) / <alpha-value>)",
        },
        line: "hsl(var(--border) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};
