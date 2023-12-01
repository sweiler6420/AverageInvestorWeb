import { createContext, useState, useEffect } from "react";

const initialValue = {
    "roles": localStorage.getItem('auth_roles'),
    "access_token": localStorage.getItem('auth_access_token'),
}

const AuthContext = createContext(initialValue);

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(initialValue);
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('auth_access_token') != 'undefined')

    useEffect(() => {
        localStorage.setItem('auth_roles', auth.roles)
        localStorage.setItem('auth_access_token', auth.access_token)
    }, [auth])

    function login(access_token, roles) {
        setAuth({"access_token": access_token, "roles": roles})
        setIsAuthenticated(true)
    }

    function logout() {
        setAuth({"access_token": undefined, "roles": undefined})
        setIsAuthenticated(false)
    }

    return (
        <AuthContext.Provider value={{ auth, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;