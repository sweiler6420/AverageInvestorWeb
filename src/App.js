import React, { useEffect, useState } from 'react';
import {Routes, Route, useLocation} from 'react-router-dom'
import styled from 'styled-components'
import ErrorsContext from './ErrorsContext'
import RequireAuth from './components/RequireAuth';

import { PathProvider } from './PathProvider'

import Home from './components/home/Home'
import Login from './components/authenticate/Login'
import Recovery from './components/authenticate/Recovery'
import SignUp from './components/authenticate/SignUp'
import Chart from './components/authenticated/Chart'
import ChartV2 from './components/authenticated/Chart2'
import Header from './components/header/Header';

import './css/react-grid-layout.css'

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const ROLES = {
  'User': 2001,
  'Editor': 1984,
  'Admin': 5150
}

export default function App() {
  const pathwayInit = [
    { name: 'Home', href: '/', current: false, show: true, requireAuth: false},
    { name: 'Login', href: '/login', current: false, show: false, requireAuth: false},
    { name: 'Signup', href: '/signup', current: false, show: false, requireAuth: false},
    { name: 'Stocks', href: '/login/stocks', current: false, show: true, requireAuth: true}]

  const location = useLocation()
  const [ error, setError ] = useState([])
  const [ theme, setTheme ] = useState(localStorage.theme)
  const [ pathway, setPathway ] = useState(pathwayInit)

  document.body.style.overflow = "hidden"

  useEffect(() => {
    if (error.length >= 1) {
      console.log("error")
      console.log(error)
    }
  }, [error])

  return (
    <ErrorsContext.Provider value={{error, setError}}>
      <PathProvider>
        <AppContainer>
          <Header/>
          <Routes>
            <Route path='/' element={<Home />}></Route>
            <Route path='/login' element={<Login />}></Route>
            <Route path='/signup' element={<SignUp />}></Route>
            <Route path='/login/recovery' element={<Recovery />}></Route>
            <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}> <Route path='/login/stocks' element={<ChartV2 />} /></Route>
          </Routes>
        </AppContainer>
      </PathProvider>
    </ErrorsContext.Provider>
  );
}
