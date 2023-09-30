import React, { useEffect, useState } from 'react';
import {Routes, Route} from 'react-router-dom'
import styled from 'styled-components'
import ErrorsContext from './ErrorsContext'
import { RequireAuth } from 'react-auth-kit';

import Home from './components/Home'
import Login from './components/Login'
import SignUp from './components/SignUp'
import Stocks from './components/Stocks'

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
`;

export default function App() {

  const [ error, setError ] = useState([])

  useEffect(() => {
    if (error.length >= 1) {
      console.log("error")
      console.log(error)
    }
  }, [error])

  return (
    <ErrorsContext.Provider value={{error, setError}}>
      <AppContainer>
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/signup' element={<SignUp />}></Route>
          <Route path='/login/stocks' element={<RequireAuth loginPath='/login'><Stocks /></RequireAuth>}></Route>
        </Routes>
      </AppContainer>
    </ErrorsContext.Provider>
  );
}
