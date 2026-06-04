/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep near-black navy base — the canvas of the product.
        base: {
          900: '#070B16', // app background
          850: '#0A0F1E', // primary surface
          800: '#0E1424', // raised surface / cards
          750: '#121A2E', // hover surface
          700: '#16203A', // borders-strong / inputs
        },
        // Single confident accent — electric blue.
        accent: {
          DEFAULT: '#0066FF',
          hover: '#1F7BFF',
          muted: 'rgba(0, 102, 255, 0.12)',
          ring: 'rgba(0, 102, 255, 0.35)',
        },
        // Secondary signal color used very sparingly.
        amber: {
          DEFAULT: '#F59E0B',
          muted: 'rgba(245, 158, 11, 0.12)',
        },
        ok: { DEFAULT: '#22C55E', muted: 'rgba(34, 197, 94, 0.12)' },
        warn: { DEFAULT: '#F59E0B', muted: 'rgba(245, 158, 11, 0.12)' },
        danger: { DEFAULT: '#EF4444', muted: 'rgba(239, 68, 68, 0.12)' },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Syne"', '"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderColor: {
        hair: 'rgba(255, 255, 255, 0.07)',
        'hair-strong': 'rgba(255, 255, 255, 0.12)',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
        pop: '0 24px 64px -24px rgba(0,0,0,0.8)',
        glow: '0 0 0 1px rgba(0,102,255,0.4), 0 8px 32px -8px rgba(0,102,255,0.35)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-fast': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-fast': 'fade-in-fast 0.2s ease-out both',
        'scale-in': 'scale-in 0.18s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slide-in-right 0.28s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}
