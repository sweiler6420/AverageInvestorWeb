/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '2000px'
    },
    fontSize: {
      sm: '0.800rem',
      base: '1rem',
      xl: '1.250rem',
      '2xl': '1.563rem',
      '3xl': '1.954rem',
      '4xl': '2.442rem',
      '5xl': '3.053rem',
    },
    fontFamily: {
      base: 'Poppins',
      gothic: ['RTFont', 'Poppins', 'sans-serif'],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      demi: '600',
      bold: '700',
      xl: '800',
    },
    
    extend: {
      colors: {
        'text': 'rgba(var(--text), 1)',
        'reverse-text': 'rgba(var(--reverse-text), 1)',
        'primary':  ({ opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(var(--primary), ${opacityValue})`
          }
          return `rgba(var(--primary), 1)`
        },
        'secondary':  ({ opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(var(--secondary), ${opacityValue})`
          }
          return `rgba(var(--secondary), 1)`
        },
        'accent':  ({ opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(var(--accent), ${opacityValue})`
          }
          return `rgba(var(--accent), 1)`
        },
        'accent-secondary':  ({ opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(var(--accent-secondary), ${opacityValue})`
          }
          return `rgba(var(--accent-secondary), 1)`
        },
        'background':  ({ opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(var(--background), ${opacityValue})`
          }
          return `rgba(var(--background), 1)`
        },
       },
      boxShadow: {
        DEFAULT: '0 0 5px 0px rgba(0, 0, 0, 0.1)',
        lg: '0 0 2px 2px #fff, 0 0 5px #08f, 0 0 15px #08f, 0 0 30px #08f',
        'neon-primary': '0 0 3px 2px #ffffff,0 0 5px var(--primary),0 0 10px var(--primary),0 0 25px var(--primary)',
        'neon-primary-sm': '0 0 2px 1px #ffffff,0 0 5px var(--primary),0 0 7px var(--primary),0 0 15px var(--primary)',
      }
    },
  },
  plugins: [],
}