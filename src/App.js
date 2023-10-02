import React, { useEffect, useState } from 'react';
import {Routes, Route} from 'react-router-dom'
import styled from 'styled-components'
import ErrorsContext from './ErrorsContext'
import ThemeContext from './ThemeContext'
import { RequireAuth } from 'react-auth-kit';

import Home from './components/Home'
import Login from './components/Login'
import SignUp from './components/SignUp'
import Stocks from './components/Stocks'
import Header from './components/header/Header';

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
`;

export default function App() {

  const [ error, setError ] = useState([])
  const [ theme, setTheme ] = useState(localStorage.theme)

  useEffect(() => {
    if (error.length >= 1) {
      console.log("error")
      console.log(error)
    }
  }, [error])

  return (
    <ErrorsContext.Provider value={{error, setError}}>
      <ThemeContext.Provider value={{theme, setTheme}}>
        <AppContainer>
          <Header/>
          <Routes>
            <Route path='/' element={<Home />}></Route>
            <Route path='/login' element={<Login />}></Route>
            <Route path='/signup' element={<SignUp />}></Route>
            <Route path='/login/stocks' element={<RequireAuth loginPath='/login'><Stocks /></RequireAuth>}></Route>
          </Routes>
        </AppContainer>
      </ThemeContext.Provider>
    </ErrorsContext.Provider>
  );
}
