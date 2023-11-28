import { useContext } from "react"
import ThemeContext from '../ThemeProvider'
 
export default function useDarkMode() {
    const { theme } = useContext(ThemeContext)
    return useContext(ThemeContext)
}