import { createContext, useState, useEffect } from "react"
import { useLocation } from "react-router-dom"

const PathContext = createContext()

export const PathProvider = ({ children }) => {
    const location = useLocation()
    const [path, setPath] = useState(location.pathname)

    useEffect(() => {
        setPath(location.pathname)
    }, [location])

    return(
        <PathContext.Provider value={{ path }}>
            {children}
        </PathContext.Provider>
    )
}

export default PathContext;