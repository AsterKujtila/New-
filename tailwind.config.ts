import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-figtree)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        spin: { to: { transform: 'rotate(360deg)' } },
        dotb: {
          '0%,100%': { transform: 'translateY(0) scale(1)', opacity: '0.4' },
          '50%': { transform: 'translateY(-5px) scale(1.15)', opacity: '1' },
        },
        msgIn: {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.97)' },
          to: { opacity: '1', transform: 'none' },
        },
        pageIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        ping: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        fade: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        spin: 'spin .7s linear infinite',
        dotb0: 'dotb .72s ease-in-out 0s infinite',
        dotb1: 'dotb .72s ease-in-out .15s infinite',
        dotb2: 'dotb .72s ease-in-out .30s infinite',
        msgIn: 'msgIn .3s ease',
        pageIn: 'pageIn 350ms cubic-bezier(0.25,0.1,0.25,1) forwards',
        ping: 'ping 1.4s ease-out infinite',
        fade: 'fade .3s ease',
      },
    },
  },
  plugins: [],
}
export default config
