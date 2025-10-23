import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom'

import Layout from './components/Layout';

import RequireAuth from './components/RequireAuth';

import Home from './components/home/Home'
import Login from './components/authenticate/Login'
import Recovery from './components/authenticate/Recovery'
import SignUp from './components/authenticate/SignUp'
import ChartV2 from './components/authenticated/Chart2'

const ROLES = {
  'User': 2001,
  'Editor': 1984,
  'Admin': 5150
}

export default function App() {

  return (
    <Routes>
      <Route path="/" element={<Layout/>}>
        {/* public routes */}
        <Route path="/" element={<Home/>} />
        <Route path="signup" element={<SignUp/>} />
        <Route path="login" element={<Login/>} />
        <Route path="recovery" element={<Recovery/>} />

        {/* private routes */}
        <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
          <Route path="stocks" element={<ChartV2/>} />
        </Route>

        {/* catch all */}
        {/* <Route path="*" element={<Missing/>}/> */}
      </Route>
    </Routes>
  );
}