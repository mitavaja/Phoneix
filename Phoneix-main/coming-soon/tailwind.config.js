/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'midnight-blue': '#0A1F44',
        'electric-orange': '#FF6A00',
        'orange-hover': '#E05D00',
        'steel-gray': '#687280',
        'ice-silver': '#E5E7EB',
        'pure-white': '#FFFFFF',
        brand: {
          dark: '#040B1A',
          deep: '#07142E',
          navy: '#0A1F44',
          surface: '#0F2C59',
          card: 'rgba(10, 31, 68, 0.75)',
          border: 'rgba(255, 106, 0, 0.25)',
          orange: '#FF6A00',
          blue: '#2563eb',
          cyan: '#38bdf8',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'float': 'float 5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%': { opacity: '0.4', filter: 'blur(20px)' },
          '100%': { opacity: '0.8', filter: 'blur(35px)' },
        }
      }
    },
  },
  plugins: [],
}
