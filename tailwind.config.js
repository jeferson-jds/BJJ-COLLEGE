/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gorillaz: {
          black: '#0a0a0a',
          blackSoft: '#141414',
          blackCard: '#1a1a1a',
          red: '#dc2626',
          redBright: '#ef4444',
          redDark: '#991b1b',
          redGlow: 'rgba(220, 38, 38, 0.4)',
          gray: '#6b7280',
          grayLight: '#9ca3af',
          grayDark: '#374151',
          white: '#ffffff',
          offWhite: '#f5f5f5',
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'red-glow': '0 0 20px rgba(220, 38, 38, 0.3)',
        'red-glow-lg': '0 0 40px rgba(220, 38, 38, 0.5)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'gorillaz-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #141414 50%, #7f1d1d 100%)',
        'gorillaz-radial': 'radial-gradient(circle at top, #7f1d1d 0%, #0a0a0a 70%)',
        'card-gradient': 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(220, 38, 38, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};
