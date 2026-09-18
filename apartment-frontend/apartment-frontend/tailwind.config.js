/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1C2321',
        paper: '#FAFAF8',
        forest: {
          50: '#EAF1EE',
          100: '#CFE0D8',
          200: '#9FC1B1',
          300: '#6FA28A',
          400: '#457D66',
          500: '#2D5A4A',
          600: '#24493C',
          700: '#1B372D',
          800: '#12261F',
          900: '#0A1512',
        },
        gold: {
          50: '#FBF6E7',
          100: '#F3E5B4',
          200: '#EAD481',
          300: '#DEC154',
          400: '#D2AF3D',
          500: '#C9A227',
          600: '#A3811E',
          700: '#7C6117',
          800: '#55420F',
          900: '#2E2308',
        },
        slate: {
          50: '#F5F6F5',
          100: '#E7E9E7',
          400: '#8B928C',
          500: '#6B7280',
          600: '#565E56',
          700: '#3E453F',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '10px',
      },
    },
  },
  plugins: [],
}
