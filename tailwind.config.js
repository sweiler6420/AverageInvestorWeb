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
        'text-color': 'var(--text-color)',
        'reverse-text-color': 'var(--r-text-color)',
        'background-color': 'var(--background-color)',
        'background-acc-color': 'var(--background-accent-color)',
        'primary-color': 'var(--primary-color)',
        'secondary-color': 'var(--secondary-color)',
        'green-acc-color': 'var(--g-accent-color)',
        'red-acc-color': 'var(--r-accent-color)',
       },
      boxShadow: {
        DEFAULT: '0 0 5px 0px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}