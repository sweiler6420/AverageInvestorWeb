import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom'

import Layout from './components/Layout';
import Research from './components/authenticated/Research';
import Portfolio from './components/authenticated/Portfolio';

import RequireAuth from './components/RequireAuth';
import PersistLogin from './components/PersistLogin';

import Home from './components/home/Home'
import Login from './components/authenticate/Login'
import Recovery from './components/authenticate/Recovery'
import SignUp from './components/authenticate/SignUp'
import Unauthorized from './components/authenticate/Unauthorized'

export default function App() {

  return (
    <Routes>
      <Route element={<PersistLogin/>}>
        <Route path="/" element={<Layout/>}>
          {/* public routes */}
          <Route path="/" element={<Home/>} />
          <Route path="signup" element={<SignUp/>} />
          <Route path="login" element={<Login/>} />
          <Route path="recovery" element={<Recovery/>} />
          <Route path="unauthorized" element={<Unauthorized/>} />

          {/* private routes */}
          <Route element={<RequireAuth allowedPermission={"user"} />}>
            <Route path="research" element={<Research/>} />
            <Route path="portfolio" element={<Portfolio/>} />
          </Route>

          {/* catch all */}
          {/* <Route path="*" element={<Missing/>}/> */}
        </Route>
      </Route>
    </Routes>
  );
}