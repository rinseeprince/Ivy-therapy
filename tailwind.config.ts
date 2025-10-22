import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#fff7f2",
          100: "#fcefe8",
          200: "#f7e2d6",
        },
        peach: {
          50: "#fff4ed",
          100: "#ffe5d9",
          200: "#ffdcc8",
          300: "#ffcdb3",
        },
        cocoa: {
          900: "#2a1a17",
        },
        maroon: {
          900: "#3d1e1c",
          800: "#4a2825",
        },
        teal: {
          100: "#e0f2f1",
          200: "#b2dfdb",
          500: "#4db6ac",
          600: "#26a69a",
        },
        lavender: {
          100: "#e8e4f3",
          200: "#d4cce8",
        },
        cream: {
          50: "#fffef9",
          100: "#fefce8",
          200: "#fef9dc",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(0, 0, 0, 0.12)",
      },
      backgroundImage: {
        "warm-vignette":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 200, 170, 0.5), transparent 70%), radial-gradient(ellipse 60% 80% at 80% 100%, rgba(255, 230, 200, 0.4), transparent 70%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

