import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefdf3",
          100: "#d6fae3",
          200: "#aef2c9",
          300: "#78e5a9",
          400: "#3fd082",
          500: "#1ab365",
          600: "#0f9152",
          700: "#0e7444",
          800: "#0f5c38",
          900: "#0d4c30",
        },
      },
    },
  },
  plugins: [],
};

export default config;
