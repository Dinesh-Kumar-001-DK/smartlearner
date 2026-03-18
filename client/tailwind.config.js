/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#03040a',
          800: '#0a0d14',
          700: '#12151f',
          600: '#1a1f2a'
        },
        gold: {
          400: '#f8d870',
          500: '#f0c040',
          600: '#d4a830'
        },
        teal: {
          400: '#40e8d0',
          500: '#00d4b4',
          600: '#00b89c'
        },
        violet: {
          400: '#b898ff',
          500: '#9b6dff',
          600: '#7c4dff'
        }
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif']
      }
    },
  },
  plugins: [],
}
