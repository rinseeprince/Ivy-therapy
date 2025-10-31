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
          50: '#F9F6F4',
          100: '#F0EAE5',
          200: '#E1D5CB',
          300: '#C8B5A5',
          400: '#A68B75',
          500: '#6B513D',
          600: '#4A3528',
          700: '#2D1810',
          800: '#1F0F0A',
          900: '#150A06',
        },
        maroon: {
          900: "#3d1e1c",
          800: "#4a2825",
        },
        teal: {
          50: '#F0FDF9',
          100: '#CCFBEF',
          200: '#A8E6CF',
          300: '#7FDDB8',
          400: '#5CD4A0',
          500: '#3BC689',
          600: '#2BA86F',
        },
        lavender: {
          100: "#e8e4f3",
          200: "#d4cce8",
        },
        cream: {
          50: '#FFFFFF',
          100: '#FAF8F5',
          200: '#F5F2ED',
          300: '#EDE8E0',
          400: '#E5DFD5',
          500: '#D9D0C3',
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
        'glow-sm': '0 0 15px rgba(92, 212, 160, 0.3)',
        'glow-md': '0 0 30px rgba(92, 212, 160, 0.4)',
      },
      backgroundImage: {
        "warm-vignette":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 200, 170, 0.5), transparent 70%), radial-gradient(ellipse 60% 80% at 80% 100%, rgba(255, 230, 200, 0.4), transparent 70%)",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'count-up': 'countUp 1.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

