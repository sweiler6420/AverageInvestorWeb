import React from 'react'

const initialValue = {
    error: undefined,
    setError: (e) => console.error(e)
}
// Context used in React to get current session where needed
const ErrorsContext = React.createContext(initialValue)
export default ErrorsContext
