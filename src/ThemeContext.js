import React from 'react'

const initialValue = {
    theme: undefined,
    setTheme: localStorage.theme
}
// Context used in React to get current session where needed
const ThemeContext = React.createContext(initialValue)

export default ThemeContext
