import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from "react-router-dom"

import { AuthProvider } from "./AuthProvider"

const root = ReactDOM.createRoot(document.getElementById('root'));
//window.location.protocol === "https:"

root.render(
  <React.StrictMode>
    <AuthProvider> 
        <BrowserRouter>
          <App />
        </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
