import { useContext, useEffect } from "react"
import ThemeContext from '../ThemeContext'
 
export default function useDarkMode() {
    const { theme, setTheme } = useContext(ThemeContext)
    const colorTheme = theme === "dark" ? "light" : "dark";
 
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(colorTheme);
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme, colorTheme]);
 
    return [colorTheme, setTheme]
}