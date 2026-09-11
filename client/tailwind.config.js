/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F1B2D',
        overcast: '#EDF1F5',
        surface: '#FFFFFF',
        sunbreak: '#E8A33D',
        steel: '#4C6B8A',
        storm: '#B5533C',
      },
      fontFamily: {
        display: ['Newsreader', 'serif'],
        body: ['IBM Plex Sans', 'sans-serif'],
      },
      borderRadius: {
        card: '6px',
      },
    },
  },
  plugins: [],
};