/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./src/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'brand-orange': '#FF6B35',
        'safety-green': '#2ECC71',
        'danger-red': '#E74C3C',
        'warm-white': '#FFF8F0',
        'dark-text': '#2C3E50',
      },
      fontFamily: {
        title: ['ZCOOL KuaiLe', 'cursive'],
        body: ['Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'bounce-in': 'bounceIn 0.6s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(46, 204, 113, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(46, 204, 113, 0)' },
        },
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(231, 76, 60, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(231, 76, 60, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
