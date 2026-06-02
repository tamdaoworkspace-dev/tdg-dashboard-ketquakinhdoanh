import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tdg: {
          bg: "#0A0A08",
          card: "#1A1814",
          text: "#F5F0E8",
          secondary: "#8A8578",
          accent: "#C8A24D",
          "accent-light": "#E8C76A",
          "accent-dark": "#A07D2E",
          positive: "#5D8A3C",
          negative: "#C45C3A",
          warm: "#D4825A",
          border: "rgba(200,162,77,0.1)",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "SF Pro Display", "Inter", "Helvetica Neue", "sans-serif"],
      },
      borderRadius: { ios: "16px", "ios-lg": "20px", pill: "9999px" },
    },
  },
  plugins: [],
};
export default config;
