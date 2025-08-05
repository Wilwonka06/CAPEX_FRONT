// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'nunito': ['Nunito', 'sans-serif'],
        'lato': ['Lato', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
      },
      colors: {
        'primary': '#A0522D',
        'primary-dark': '#4B2A2A',
        'accent': '#D2B48C',
        'accent-light': '#F7DAA2',
        'text-main': '#1E1E1E',
      }
    },
  },
  plugins: [],
}
