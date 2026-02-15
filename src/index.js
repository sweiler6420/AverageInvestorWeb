import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./AuthProvider"
import { ThemeProvider } from "./ThemeProvider"
import ErrorsProvider from './ErrorsProvider'

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  //<React.StrictMode>
    <ThemeProvider>
      <AuthProvider> 
        <ErrorsProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ErrorsProvider>
      </AuthProvider>
    </ThemeProvider>
  //</React.StrictMode>
);
