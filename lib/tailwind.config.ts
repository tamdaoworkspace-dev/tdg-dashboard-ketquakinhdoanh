import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tdg: {
          bg: "#F7F3EA",
          card: "#FFFFFF",
          "card-alt": "#FBF8F1",
          text: "#2B2620",
          secondary: "#7A7263",
          accent: "#B0862F",
          "accent-soft": "#C8A24D",
          "accent-light": "#E8C76A",
          "accent-dark": "#8C6A24",
          positive: "#4F7A2E",
          negative: "#B14528",
          warm: "#C26A3F",
          border: "#ECE4D2",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "SF Pro Display", "Inter", "Helvetica Neue", "sans-serif"],
      },
      borderRadius: { ios: "16px", "ios-lg": "20px", pill: "9999px" },
      boxShadow: {
        ios: "0 1px 3px rgba(43,38,32,0.06), 0 1px 2px rgba(43,38,32,0.04)",
        "ios-lg": "0 4px 16px rgba(43,38,32,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
