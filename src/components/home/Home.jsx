import React, { useState, useEffect, useContext } from 'react'
import Hero from './Hero'
import Features from './Features'
import Workflow from './Workflow'
import Pricing from './Pricing'
import Contact from './Contact'
import Footer from './Footer'
import { useNavigate} from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export default function Home() {
    const navigate = useNavigate()
    const { auth } = useAuth()

    return (
        <div className='min-h-screen pt-20 px-6'>
            <Hero/>
            <Features/>
            <Workflow/>
            <Pricing/>
            <Contact/>
            <Footer/>
        </div>
    )
}