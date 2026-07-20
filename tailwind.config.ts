import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAFA",
        surface: {
          DEFAULT: "#FFFFFF",
          hover: "#F4F4F5",
          card: "#FFFFFF",
          border: "#E4E4E7",
        },
        brand: {
          orange: "#FF5500",
          "orange-hover": "#E04B00",
          "orange-light": "#FFF2EC",
          "orange-glow": "rgba(255, 85, 0, 0.15)",
          emerald: "#FF5500", // Default brand accent alias
          dark: "#09090B",
          subtle: "rgba(255, 85, 0, 0.05)",
        },
        status: {
          pass: "#00C471",
          "pass-bg": "#ECFDF5",
          fail: "#EF4444",
          "fail-bg": "#FEF2F2",
          pending: "#F59E0B",
          "pending-bg": "#FFFBEB",
        },
        text: {
          primary: "#09090B",
          secondary: "#52525B",
          dim: "#71717A",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "orange-glow": "0 4px 20px -2px rgba(255, 85, 0, 0.25)",
        "emerald-glow": "0 4px 20px -2px rgba(255, 85, 0, 0.25)",
        "card-glow": "0 8px 30px -4px rgba(0, 0, 0, 0.08)",
        "soft-card": "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
      },
      animation: {
        "pulse-glow": "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan-line": "scanLine 2.5s linear infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(255, 85, 0, 0.3)" },
          "50%": { opacity: "0.6", boxShadow: "0 0 5px rgba(255, 85, 0, 0.1)" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
