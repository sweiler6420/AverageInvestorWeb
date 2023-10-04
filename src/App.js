import React, { useEffect, useState } from 'react';
import {Routes, Route, useLocation} from 'react-router-dom'
import styled from 'styled-components'
import ErrorsContext from './ErrorsContext'
import ThemeContext from './ThemeContext'
import PathwayContext from './PathwayContext'
import { RequireAuth } from 'react-auth-kit'

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
  const pathwayInit = [
    { name: 'Home', href: '/', current: false },
    { name: 'Login', href: '/login', current: false },
    { name: 'Signup', href: '/signup', current: false },
    { name: 'Stocks', href: '/login/stocks', current: false }]

  const location = useLocation()
  const [ error, setError ] = useState([])
  const [ theme, setTheme ] = useState(localStorage.theme)
  const [ pathway, setPathway ] = useState(pathwayInit)

  useEffect(() => {
    if (error.length >= 1) {
      console.log("error")
      console.log(error)
    }
  }, [error])
  
  useEffect(()=> {
    let pathway_temp = pathwayInit
    for (var i=0; i < pathway.length; i++){
      if(pathway_temp[i].href == location.pathname){
        pathway_temp[i].current = true
      }
    }
    setPathway(pathway_temp)
  }, [location])

  return (
    <ErrorsContext.Provider value={{error, setError}}>
      <ThemeContext.Provider value={{theme, setTheme}}>
        <PathwayContext.Provider value={{pathway, setPathway}}>
        <AppContainer>
          <Header/>
          <Routes>
            <Route path='/' element={<Home />}></Route>
            <Route path='/login' element={<Login />}></Route>
            <Route path='/signup' element={<SignUp />}></Route>
            <Route path='/login/stocks' element={<RequireAuth loginPath='/login'><Stocks /></RequireAuth>}></Route>
          </Routes>
        </AppContainer>
        </PathwayContext.Provider>
      </ThemeContext.Provider>
    </ErrorsContext.Provider>
  );
}
