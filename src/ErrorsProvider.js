import React, { useState, useCallback } from 'react';
import ErrorsContext from './ErrorsContext';

const ErrorsProvider = ({ children }) => {
    const [error, setError] = useState(undefined);

    const handleSetError = useCallback((e) => {
        setError(e);
        setTimeout(() => {
            setError(undefined);
        }, 10000); // 10 seconds
    }, []);

    return (
        <ErrorsContext.Provider value={{ error, setError: handleSetError }}>
            {children}
        </ErrorsContext.Provider>
    );
};

export default ErrorsProvider;

