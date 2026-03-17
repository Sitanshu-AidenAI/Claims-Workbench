/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#E7F1FC',
          100: '#C5DEFA',
          200: '#8DBDF5',
          300: '#559CF0',
          400: '#1D7BEB',
          500: '#0052CC',
          600: '#03448C',
          700: '#023672',
          800: '#012858',
          900: '#001A3E',
        },
        accent: {
          50: '#E6FAF4',
          100: '#B3F0DE',
          200: '#80E7C8',
          300: '#4DDDB2',
          400: '#2CC9A2',
          500: '#1AB08C',
          600: '#148A6D',
          700: '#0E644F',
          800: '#083E31',
          900: '#021813',
        },
        dark: {
          DEFAULT: '#26282B',
          50: '#F5F5F6',
          100: '#E0E0E2',
          200: '#B8B9BC',
          300: '#909296',
          400: '#686B70',
          500: '#40444A',
          600: '#26282B',
          700: '#1C1E20',
          800: '#121315',
          900: '#08090A',
        },
        risk: {
          low: '#22C55E',
          moderate: '#F97316',
          high: '#EF4444',
        },
        // Legacy surface tokens for backward compat
        surface: {
          bg: '#F2F6FB',
          dark: '#26282B',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'gradient': 'gradient 3s ease infinite',
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-fast': 'float 3s ease-in-out infinite',
        'glow': 'glowPulse 3s ease-in-out infinite',
        'shimmer': 'shimmerMove 3s linear infinite',
        'spin-slow': 'spinSlow 12s linear infinite',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(44, 201, 162, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(44, 201, 162, 0.3)' },
        },
        shimmerMove: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        spinSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};
