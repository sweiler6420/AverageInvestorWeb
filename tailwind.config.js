/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    // screens: {
    //   sm: '480px',
    //   md: '768px',
    //   lg: '976px',
    //   xl: '1440px',
    // },
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
      heading: 'Poppins',
      body: 'Poppins',
    },
    fontWeight: {
      normal: '400',
      bold: '700',
    },
    
    extend: {
      colors: {
        'text': 'var(--text)',
        'reverse-text': 'var(--r-text)',
        'background': 'var(--background)',
        'background-sub': 'var(--background-sub)',
        'background-sub-2': 'var(--background-sub-2)',
        'background-acc': 'var(--background-accent)',
        'primary': 'var(--primary)',
        'secondary': 'var(--secondary)',
        'green-acc': 'var(--g-accent)',
        'red-acc': 'var(--r-accent)',
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