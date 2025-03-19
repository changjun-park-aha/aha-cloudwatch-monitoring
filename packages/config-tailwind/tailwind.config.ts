/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssTypography from "@tailwindcss/typography";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}", //추가
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontFamily: {
      pretendard: ["Pretendard Variable"],
    },
    fontSize: {
      "3xs": ["0.5rem", "0.75rem"], // 8px, 12px
      "2xs": ["0.75rem", "1rem"], // 12px, 16px
      xs: ["0.8125rem", "1.125rem"], // 13px, 18px
      sm: ["0.875rem", "1.25rem"], // 14px, 20px
      base: ["1rem", "1.5rem"], // 16px, 24px
      lg: ["1.125rem", "1.75rem"], // 18px, 28px
      xl: ["1.25rem", "1.75rem"], // 20px, 28px
      "2xl": ["1.5rem", "2rem"], // 24px, 32px
      "3xl": ["1.875rem", "2.25rem"], // 30px, 36px
      "4xl": ["2.25rem", "2.5rem"], // 36px, 40px
      "5xl": ["3rem", "1"], // 48px, 56px
      "6xl": ["3.75rem", "1"], // 60px, 64px
      "7xl": ["4.5rem", "1"], // 72px, 80px
      "8xl": ["6rem", "1"], // 96px, 104px
      "9xl": ["8rem", "1"], // 128px, 136px
    },
    extend: {
      colors: {
        fill: {
          DEFAULT: "hsl(var(--foreground))",
          card: "var(--fill-card)",
          input: "var(--fill-input)",
          muted: "var(--fill-muted)",
          popover: "var(--fill-popover)",
          strong: "var(--fill-strong)",
          "subtle-1": "var(--fill-subtle-1)",
          "subtle-2": "var(--fill-subtle-2)",
          "subtle-3": "var(--fill-subtle-3)",
          tablecell: "var(--fill-tablecell)",
        },
        interaction: {
          DEFAULT: "var(--interaction-hover)",
          disable: "var(--interaction-disable)",
          hover: "var(--interaction-hover)",
          inactive: "var(--interaction-inactive)",
        },
        inverse: {
          DEFAULT: "var(--inverse-background)",
          background: "var(--inverse-background)",
          label: "var(--inverse-label)",
          primary: "var(--inverse-primary)",
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          "destructive-1": "var(--border-destructive-1)",
          "destructive-2": "var(--border-destructive-2)",
          neutral: "var(--border-neutral)",
          normal: "var(--border-normal)",
          "primary-1": "var(--border-primary-1)",
          "primary-2": "var(--border-primary-2)",
          strong: "var(--border-strong)",
          subtle: "var(--border-subtle)",
        },
        input: {
          DEFAULT: "hsl(var(--input))",
          fill: "var(--fill-input)",
        },
        ring: "hsl(var(--ring))",
        table: {
          DEFAULT: "hsl(var(--background))",
          moved: "hsl(var(--table-moved-row))",
          created: "hsl(var(--table-created-row))",
          deleted: "hsl(var(--table-deleted-row))",
          fill: "var(--fill-tablecell)",
        },
        background: {
          DEFAULT: "hsl(var(--background))",
          alternative: "var(--background-alternative))",
          plain: "hsl(var(--background))", // old default
          normal: "var(--background-normal)",
        },
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          accent: "var(--primary-accent)",
          "assistive-1": "var(--primary-assistive-1)",
          "assistive-2": "var(--primary-assistive-2)",
          "assistive-3": "var(--primary-assistive-3)",
          disabled: "var(--primary-disabled)",
          heavy: "var(--primary-heavy)",
          normal: "var(--primary-normal)",
          strong: "var(--primary-strong)",
        },
        static: {
          DEFAULT: "hsl(var(--static-black))",
          black: "var(--static-black)",
          white: "var(--static-white)",
        },
        status: {
          cautionary: "var(--status-cautionary)",
          destructive: "var(--status-destructive)",
          "destructive-disabled": "var(--status-destructive-disabled)",
          "destructive-hover": "var(--status-destructive-hover)",
          negative: "var(--status-negative)",
          positive: "var(--status-positive)",
        },
        text: {
          active: "var(--text-active)",
          "assistive-1": "var(--text-assistive-1)",
          "assistive-2": "var(--text-assistive-2)",
          "assistive-3": "var(--text-assistive-3)",
          disabled: "var(--text-disabled)",
          neutral: "var(--text-neutral)",
          normal: "var(--text-normal)",
          strong: "var(--text-strong)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
          fill: "var(--fill-muted)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          amber: "var(--accent-amber)",
          black: "var(--accent-black)",
          blue: "var(--accent-blue)",
          crimson: "var(--accent-crimson)",
          gray: "var(--accent-gray)",
          lime: "var(--accent-lime)",
          orange: "var(--accent-orange)",
          teal: "var(--accent-teal)",
          violet: "var(--accent-violet)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
          fill: "var(--fill-popover)",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          fill: "var(--fill-card)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssTypography, tailwindcssAnimate],
} satisfies Config;

export default config;
