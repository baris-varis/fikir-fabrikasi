/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        fab: {
          bg: '#0a0e1a',
          surface: '#111827',
          card: '#1a2235',
          border: '#1e293b',
          accent: '#3b82f6',
          'accent-light': '#60a5fa',
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
          text: '#f1f5f9',
          muted: '#64748b',
          'muted-light': '#94a3b8',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui'],
        body: ['var(--font-body)', 'system-ui'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'score-fill': 'scoreFill 1.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(59, 130, 246, 0.15)' },
          '50%': { boxShadow: '0 0 24px rgba(59, 130, 246, 0.35)' },
        },
        scoreFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--score-width)' },
        },
      },
    },
  },
  plugins: [],
};
