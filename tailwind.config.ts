import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#182034",
        parchment: "#f7edd2",
        ember: "#f97316",
        royal: "#243b76",
        mystic: "#6d3fc4",
        emerald: "#047857"
      },
      boxShadow: {
        card: "0 16px 40px rgba(24, 32, 52, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
