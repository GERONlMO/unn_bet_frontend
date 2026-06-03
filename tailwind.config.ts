import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        poker: {
          table: "#0f5e3e",
          tableDark: "#0a402a",
          gold: "#eab308",
          dark: "#121212",
          panel: "#1e1e1e",
          accent: "#22c55e",
          danger: "#ef4444"
        },
        'bg-neon': '#0b0c10',
        'bg-casino': '#2a0800',
        'bg-matrix': '#001100',
        'bg-ocean': '#000a1f',
        'bg-lava': '#1a0500',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "poker-neon": "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(34,197,94,0.15), rgba(255,255,255,0))",
        "poker-casino": "radial-gradient(ellipse at center, rgba(255,0,0,0.15), transparent)",
        "poker-matrix": "linear-gradient(rgba(0,255,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,0,0.05) 1px, transparent 1px)",
        "poker-ocean": "radial-gradient(ellipse at top, rgba(0,100,255,0.2), transparent)",
        "poker-lava": "radial-gradient(ellipse at bottom, rgba(255,100,0,0.2), transparent)",
      },
      backgroundSize: {
        "matrix-size": "20px 20px"
      }
    },
  },
  plugins: [],
};
export default config;