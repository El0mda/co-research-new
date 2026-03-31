import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
    extend: {
      fontFamily: {
        heading: ['"Cormorant Garamond"', '"Georgia"', 'serif'],
        body:    ['"IBM Plex Sans Arabic"', '"IBM Plex Sans"', 'sans-serif'],
        sans:    ['"IBM Plex Sans Arabic"', '"IBM Plex Sans"', 'sans-serif'],
      },
      colors: {
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",

        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /* ── Custom palette tokens ── */
        gold: {
          DEFAULT: "hsl(var(--gold))",
          light:   "hsl(var(--gold-light))",
          muted:   "hsl(var(--gold-muted))",
        },
        navy: {
          DEFAULT: "hsl(var(--navy))",
          deep:    "hsl(var(--navy-deep))",
          mid:     "hsl(var(--navy-mid))",
          surface: "hsl(var(--navy-surface))",
        },
        cream: "hsl(var(--cream))",

        sidebar: {
          DEFAULT:              "hsl(var(--navy-deep))",
          foreground:           "hsl(var(--cream))",
          primary:              "hsl(var(--gold))",
          "primary-foreground": "hsl(var(--navy-deep))",
          accent:               "hsl(var(--navy-mid))",
          "accent-foreground":  "hsl(var(--cream))",
          border:               "hsl(var(--navy-mid))",
          ring:                 "hsl(var(--gold))",
        },
      },
      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
        xl:  "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 10px)",
      },
      boxShadow: {
        card:     "0 1px 2px hsl(222 25% 12% / 0.04), 0 2px 8px hsl(222 25% 12% / 0.06)",
        "card-hover": "0 4px 20px hsl(222 52% 22% / 0.10), 0 1px 4px hsl(42 85% 50% / 0.10)",
        gold:     "0 4px 18px hsl(42 85% 50% / 0.35)",
        navy:     "0 4px 18px hsl(222 52% 22% / 0.30)",
        featured: "0 8px 40px hsl(222 52% 22% / 0.12), 0 2px 8px hsl(42 85% 50% / 0.14), inset 0 1px 0 hsl(42 85% 50% / 0.18)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.96)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(16px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in-up":     "fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in":        "fadeIn 0.5s ease both",
        "scale-in":       "scaleIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-in":       "slideIn 0.4s ease both",
        shimmer:          "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;