import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        grovia: {
          primary: "#2E7D32",       // FreshMart / Grovia Primary Green
          primaryDark: "#1B5E20",
          primaryLight: "#4CAF50",
          accent: "#FF6F00",        // Accent Orange
          accentLight: "#FFA000",
          bgLight: "#FAFAFA",
          cardLight: "#FFFFFF",
          error: "#E53935",         // Error & Badge Red
          warning: "#F57C00",
          info: "#0288D1",
          success: "#2E7D32",
        },
        eye: {
          bg: "#FBF7EE",            // Eye protection warm cream
          surface: "#F3ECD9",       // Eye protection card surface
          card: "#FFFFFF",
          border: "#E2D7BE",
          text: "#3E3B32",
          muted: "#787262"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'grovia': '0 4px 20px -2px rgba(46, 125, 50, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'grovia-hover': '0 10px 25px -3px rgba(46, 125, 50, 0.14), 0 4px 10px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
};
export default config;
