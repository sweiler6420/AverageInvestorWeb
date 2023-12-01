import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./AuthProvider"
import { ThemeProvider } from "./ThemeProvider"

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  //<React.StrictMode>
    <ThemeProvider>
      <AuthProvider> 
          <BrowserRouter>
            <App />
          </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  //</React.StrictMode>
);
