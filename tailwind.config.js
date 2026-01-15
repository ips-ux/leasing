/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lavender: '#C8B6FF',
        mint: '#B4F8C8',
        peach: '#FFB4B4',
        'soft-yellow': '#FFF4B4',
        'pale-blue': '#B4D4FF',
      },
      fontFamily: {
        sans: ['Inter', 'Public Sans', 'sans-serif'],
        mono: ['Space Mono', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px rgba(0,0,0,0.8)',
        'brutal-hover': '6px 6px 0px rgba(0,0,0,0.8)',
        'brutal-active': '2px 2px 0px rgba(0,0,0,0.8)',
        'brutal-lg': '12px 12px 0px rgba(0,0,0,0.9)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s infinite',
        'pulse-urgent': 'pulse-urgent 1.5s infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 180, 180, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 180, 180, 0.6)' },
        },
        'pulse-urgent': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 180, 180, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 180, 180, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};
