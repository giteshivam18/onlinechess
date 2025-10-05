/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chess-light': '#f0d9b5',
        'chess-dark': '#b58863',
        'chess-highlight': '#ffff99',
        'chess-selected': '#4ade80',
        'chess-check': '#ef4444',
      },
      fontFamily: {
        'chess': ['Chess', 'serif'],
      },
      animation: {
        'piece-move': 'pieceMove 0.3s ease-in-out',
        'piece-capture': 'pieceCapture 0.2s ease-in-out',
        'check-flash': 'checkFlash 0.5s ease-in-out',
      },
      keyframes: {
        pieceMove: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        pieceCapture: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.2) rotate(5deg)' },
          '100%': { transform: 'scale(0) rotate(10deg)' },
        },
        checkFlash: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: '#ef4444' },
        },
      },
    },
  },
  plugins: [],
}