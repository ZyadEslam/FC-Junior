import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.ts",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FFFFFF",
        ink: "#24211E",
        taxi: {
          50: "#FFFDF7",
          100: "#FFF6DE",
          200: "#F9E6A4",
          300: "#F1D47C",
          400: "#E5BD55",
          500: "#D3A83B",
          600: "#A78028",
          700: "#73591D",
          800: "#544116",
          900: "#3D2F11",
        },
        flame: {
          50: "#FFF5F1",
          100: "#FBE3DA",
          200: "#F2C1B0",
          300: "#E6A087",
          400: "#D87B5D",
          500: "#B84F36",
          600: "#A84730",
          700: "#843925",
          800: "#682F21",
        },
        sun: {
          50: "#FFFDF7",
          100: "#FFF6DE",
          200: "#F9E6A4",
          300: "#F1D47C",
          400: "#E5BD55",
          500: "#D3A83B",
          600: "#A78028",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "hard-xs": "2px 2px 0 0 #24211E",
        "hard-sm": "3px 3px 0 0 #24211E",
        hard: "5px 5px 0 0 #24211E",
        "hard-lg": "8px 8px 0 0 #24211E",
        "hard-xl": "12px 12px 0 0 #24211E",
        "hard-flame": "5px 5px 0 0 #B84F36",
        card: "0 1px 2px 0 rgb(36 33 30 / 0.04), 0 2px 6px 0 rgb(36 33 30 / 0.05)",
      },
      borderWidth: {
        3: "3px",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "zoom-in": {
          from: { opacity: "0", transform: "scale(0.97) translateY(4px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(12px) scale(0.97)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.4s ease both",
        "zoom-in": "zoom-in 0.18s cubic-bezier(0.22, 1, 0.36, 1) both",
        "toast-in": "toast-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both",
        wiggle: "wiggle 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
