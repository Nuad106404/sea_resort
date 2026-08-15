/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary — bright tropical sea
        aqua: {
          50: '#EFFDFF',
          100: '#D5F7FD',
          200: '#AAEEF9',
          300: '#72E0F2',
          400: '#2ECDE7',
          500: '#0FB6D3',
          600: '#0293B5',
          700: '#07748F',
          800: '#0D5D74',
          900: '#114C60',
          950: '#06313F',
        },
        // Accent — sunlight
        sun: {
          50: '#FFFBEA',
          100: '#FFF3C2',
          200: '#FFE894',
          300: '#FFD95C',
          400: '#FFC634',
          500: '#FDB412',
          600: '#E19500',
          700: '#B87206',
          800: '#94590D',
          900: '#7A4910',
        },
        // Danger only — validation errors, expiry, destructive actions.
        // Kept distinct from `sun` so warnings never read as decoration.
        coral: {
          50: '#FFF2F0',
          100: '#FFE1DC',
          200: '#FFC4BB',
          300: '#FF9C8D',
          400: '#FB7259',
          500: '#EF4E32',
          600: '#D53A1F',
          700: '#B02C16',
          800: '#8C2413',
          900: '#701E12',
        },
        // Neutral — sea foam / sunlit shore
        foam: {
          50: '#FBFEFE',
          100: '#F2FBFC',
          200: '#E4F4F7',
          300: '#D0E8EE',
          400: '#ADD0D9',
          500: '#85ADB8',
          600: '#5F8893',
          700: '#476A73',
          800: '#344F56',
          900: '#21333A',
        },
      },
      fontFamily: {
        display: ['Prompt', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        // Aqua-tinted depth instead of neutral grey
        soft: '0 1px 2px rgba(17, 76, 96, 0.04), 0 4px 12px rgba(17, 76, 96, 0.06)',
        float: '0 2px 4px rgba(17, 76, 96, 0.04), 0 12px 32px rgba(17, 76, 96, 0.10)',
        lift: '0 4px 8px rgba(17, 76, 96, 0.06), 0 24px 48px rgba(17, 76, 96, 0.15)',
        glass: '0 8px 32px rgba(6, 49, 63, 0.16)',
        // Warm sunlight bloom for primary actions
        glow: '0 8px 24px rgba(255, 198, 52, 0.45)',
        'glow-aqua': '0 8px 24px rgba(15, 182, 211, 0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'slow-zoom': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
        // Slow drift for sunlight blooms
        shimmer: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.06)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.6s ease-out both',
        float: 'float 6s ease-in-out infinite',
        'slow-zoom': 'slow-zoom 20s ease-out forwards',
        shimmer: 'shimmer 9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
