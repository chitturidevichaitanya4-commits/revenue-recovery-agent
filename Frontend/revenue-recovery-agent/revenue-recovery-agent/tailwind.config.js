/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0A0D11',
          900: '#0F141A',
          800: '#141B22',
          700: '#1B242D',
        },
        line: {
          800: '#232D38',
          700: '#2E3A47',
        },
        paper: {
          100: '#E9ECF1',
          400: '#9BA5B4',
          600: '#6B7686',
        },
        gold: {
          400: '#F2B75B',
          500: '#E8A33D',
          600: '#C7822A',
        },
        emerald: {
          400: '#4FC98A',
          500: '#37B478',
          600: '#268F5D',
        },
        indigo: {
          300: '#9AA6F7',
          400: '#7B8CF4',
          500: '#5D6EE8',
        },
        rust: {
          400: '#E0745A',
          500: '#CC5A3E',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '4px',
        md: '6px',
      },
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [],
};
