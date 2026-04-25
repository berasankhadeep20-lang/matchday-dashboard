/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pitch: '#070B09',
        'pitch-dark': '#0D1210',
        'pitch-card': '#111816',
        'pitch-card-alt': '#141F1B',
        'pitch-border': '#1E2C27',
        'pitch-muted': '#5C7A6E',
        neon: '#00FF87',
        'neon-dim': '#00C864',
        goal: '#F5C842',
        loss: '#FF4040',
        draw: '#7A9690',
        'text-bright': '#EDF5F0',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"Barlow"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'slide-up': 'slideUp 0.35s ease-out',
        'fade-in': 'fadeIn 0.25s ease-out',
        'pulse-green': 'pulseGreen 1.8s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        pulseGreen: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
