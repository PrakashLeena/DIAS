/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    container: { center: true, padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2.5rem' }, screens: { '2xl': '1200px' } },
    extend: {
      colors: {
        maroon: { 900: '#4A0E22', 700: '#7A1636', 600: '#8E1B3A', 500: '#A8244A', 100: '#F3DDE2' },
        rose: { 600: '#B3122E', 400: '#D9475F' },
        blush: { 200: '#F4C9CF', 100: '#FBE7EA' },
        gold: { 300: '#F2D27A', 500: '#D4A845', 700: '#9C7426' },
        flame: { 200: '#FFE9B0' },
        champagne: { 100: '#F7EEDC', 200: '#EFE1C2', 400: '#D9C29A', 600: '#A88E64' },
        ivory: { 50: '#FDFAF4', 100: '#FBF7EF' },
        ink: { 900: '#1E1114', 800: '#2A1A1D', 700: '#3B2A2D', 500: '#6B5A5C', 300: '#A8999A' },
        success: '#3E8E4F', warning: '#C98A16', danger: '#B3122E', info: '#5A6E8C',
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'var(--font-tamil-serif)', 'Times New Roman', 'serif'],
        sans: ['var(--font-jost)', 'var(--font-tamil-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xs: '6px', sm: '10px', md: '14px', lg: '20px', xl: '28px' },
      boxShadow: {
        1: '0 1px 2px rgba(42,26,29,.06),0 2px 8px rgba(42,26,29,.06)',
        2: '0 6px 24px rgba(42,26,29,.10),0 2px 6px rgba(42,26,29,.06)',
        3: '0 24px 60px rgba(30,17,20,.28),0 8px 20px rgba(30,17,20,.16)',
        glass: '0 20px 50px rgba(10,4,6,.35),inset 0 1px 0 rgba(255,240,210,.18)',
        gold: '0 0 0 1.5px rgba(242,210,122,.85),0 0 28px 4px rgba(242,190,80,.45)',
      },
      transitionTimingFunction: { out: 'cubic-bezier(.22,1,.36,1)' },
      letterSpacing: { eyebrow: '.22em', button: '.08em' },
    },
  },
  plugins: [],
};
