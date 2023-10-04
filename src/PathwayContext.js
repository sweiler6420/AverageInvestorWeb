import React from 'react'

const initialValue = {
    pathway: undefined,
    setPathway: undefined
}
// Context used in React to get current session where needed
const PathwayContext = React.createContext(initialValue)

export default PathwayContext
