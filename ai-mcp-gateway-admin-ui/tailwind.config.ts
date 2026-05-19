import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Manrope',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          '"Cascadia Code"',
          'monospace',
        ],
        serif: ['"Instrument Serif"', '"Times New Roman"', 'serif'],
        display: ['"Instrument Serif"', 'Manrope', 'serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        'border-strong': 'hsl(var(--border-strong))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        'background-deep': 'hsl(var(--background-deep))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          glow: 'hsl(var(--primary-glow))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        aurora: {
          1: 'hsl(var(--aurora-1))',
          2: 'hsl(var(--aurora-2))',
          3: 'hsl(var(--aurora-3))',
          4: 'hsl(var(--aurora-4))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-bg))',
          foreground: 'hsl(var(--sidebar-fg))',
          muted: 'hsl(var(--sidebar-muted))',
          hover: 'hsl(var(--sidebar-hover))',
          active: 'hsl(var(--sidebar-active))',
        },
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 8px)',
        md: 'calc(var(--radius) - 4px)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 16px)',
      },
      boxShadow: {
        soft: '0 1px 1px hsl(230 35% 12% / 0.04), 0 8px 24px hsl(230 35% 12% / 0.06), 0 24px 56px hsl(230 35% 12% / 0.05)',
        glow: '0 1px 1px hsl(230 35% 12% / 0.04), 0 8px 24px hsl(252 95% 62% / 0.12), 0 24px 60px hsl(252 95% 62% / 0.08)',
        inner: 'inset 0 1px 0 hsl(0 0% 100% / 0.18)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      backgroundImage: {
        'glass-sheen':
          'linear-gradient(135deg, hsl(0 0% 100% / 0.12) 0%, hsl(0 0% 100% / 0) 60%)',
      },
    },
  },
  plugins: [],
} satisfies Config
