import { createContext, useState, useEffect } from "react"

const initialValue = "light"

const ThemeContext = createContext(initialValue)

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(initialValue)

    useEffect(() => {
        console.log(theme)
        const root = window.document.documentElement
        root.classList.remove(getPrevious());
        root.classList.add(theme);
    }, [theme])

    function getPrevious(){
        return theme === "dark" ? "light" : "dark"
    }

    function toggleTheme(){
        if (theme === "light"){
            setTheme("dark")
        }else{
            setTheme("light")
        }
    }

    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    )

}

export default ThemeContext