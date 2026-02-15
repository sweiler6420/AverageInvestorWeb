import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

import useApi from '../../hooks/useApi'
import useAuth from '../../hooks/useAuth';
import ErrorsContext from '../../ErrorsContext'

const defaultloginForm = {
    username: '', password: ''
}

export default function Login() {
    const [loginForm, setLoginForm] = useState(defaultloginForm)
    const [loginError, setLoginError] = useState(defaultloginForm)
    const [visible, setVisible] = useState(false)
    const [response, setResponse] = useState("")
    const [rememberMe, setRememberMe] = useState(localStorage.rememberMe === 'true')

    const { setAuth } = useAuth();
    const {error} = useContext(ErrorsContext)
    const {apiLogin} = useApi()
    const navigate = useNavigate()
    const location = useLocation()
    const signUpData = location.state

    const from = location.pathname === "/login" ? "/research" : location.state?.from?.pathname || "/research";
    

    useEffect(() => {
        localStorage.setItem('rememberMe', rememberMe)
        // Clear localStorage and form fields when rememberMe is unchecked
        if (!rememberMe) {
            localStorage.setItem('username', "")
            localStorage.setItem('pass', "")
            setLoginForm({ username: '', password: '' })
        }
    }, [rememberMe])


    useEffect(() => {
        if(rememberMe){
            setLoginForm(prevState => ({
                ...prevState,
                ["username"]: localStorage.username !== "" ? JSON.parse(localStorage.getItem('username')) : "",
                ["password"]: localStorage.pass !== "" ? JSON.parse(localStorage.getItem('pass')) : ""
            }));
        }
    }, [])


    useEffect(()=> {
        if (signUpData && (!!signUpData?.username || !!signUpData?.password)){
            setLoginForm(prevState => ({
                ...prevState,
                ["username"]: signUpData.username,
                ["password"]: signUpData.password
            }));
        }
    }, [signUpData])


    useEffect(() => {
        if (!!response && !!response?.access_token){
            const accessToken = response?.access_token
            const refreshToken = response?.refresh_token
            const permission = "user"
            
            // Store refresh token in localStorage for persistence
            if (refreshToken) {
                localStorage.setItem('refresh_token', refreshToken);
            }
            
            // Set auth state with new token structure
            setAuth({ permission, accessToken, refreshToken })

            if(rememberMe){
                localStorage.setItem("username", JSON.stringify(loginForm.username));
                localStorage.setItem("pass", JSON.stringify(loginForm.password));
            }else{
                localStorage.setItem('username', "")
                localStorage.setItem('pass', "")
            }
            navigate(from, { replace: true })
        }
    }, [response])


    function signin(event) {
        event.preventDefault()
        
        if (validated()) {
            var payload = {
                'username': loginForm.username,
                'password': loginForm.password,
            };
    
            apiLogin(`v1/login`, payload).then(response => {
                if(response?.status === 200 || response?.status === 202){
                    setResponse(response?.data)
                }
            })
        }
    }

    function validated() {
        let valid = true
        if (loginForm.username === ""){
            setErrorValue("username", "Invalid Input")
            valid = false
        }
        
        if (loginForm.password === ""){
            setErrorValue("password", "Please Enter Your Password")
            valid = false
        }
        return valid
    }

    function setFormValue(key){
        return (ev) => {
            setLoginForm(prevState => ({
                ...prevState,
                [key]: ev.target.value
            }));
            setLoginError(prevState => ({
                ...prevState,
                [key]: ""
            }));
        }
    }


    function setErrorValue(key, error_text){
        setLoginError(prevState => ({
            ...prevState,
            [key]: error_text
        }));
    }


    return (
        <div className="flex flex-col items-center mt-6 lg:mt-20">
            <h1 className="text-4xl font-gothic font-xl mb-5">
                Log In
            </h1>
            <div className="p-4 sm:w-1/2 md:w-1/2 lg:w-1/3 xl:w-1/4 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                <form className='mx-5' onSubmit={signin}>
                    <div className="flex flex-col text-neutral-900 dark:text-neutral-200 py-2">
                        <div className='relative'>
                            <label className='font-gothic font-medium mb-2'> Username: </label> 
                            {loginError.username !== "" ? <label className='font-gothic font-medium absolute text-sm text-red-600 right-1 bottom-0'>{loginError.username}</label> : null}
                        </div>
                        <input className="border border-neutral-300 dark:border-neutral-700 rounded-xl mt-2 p-2 w-full bg-white dark:bg-neutral-900" 
                            type="text" onChange={setFormValue("username")} value={loginForm.username} maxLength="50"/>
                    </div>
                    <div className="flex flex-col text-neutral-900 dark:text-neutral-200 py-2">
                        <div className='relative'>
                            <label className='font-gothic font-medium mb-2'> Password: </label>
                            {loginError.password !== "" ? <label className='font-gothic font-medium absolute text-sm text-red-600 right-1 bottom-0' >{loginError.password}</label> : null}
                        </div>
                        <div className='relative'>
                            <input className="border border-neutral-300 dark:border-neutral-700 rounded-xl mt-2 p-2 w-full bg-white dark:bg-neutral-900" 
                                type={visible ? "text" : "password"} onChange={setFormValue("password")} value={loginForm.password} autoComplete={rememberMe ? "current-password" : "off"}/> 
                            <div className='absolute top-1 right-1'>
                            {visible ? <EyeIcon onClick={() => setVisible(false)} className='h-12 w-6 text-brand-600 dark:text-brand-400 pr-1' aria-hidden='true' /> : 
                                    <EyeSlashIcon onClick={() => setVisible(true)} className='h-12 w-6 text-brand-600 dark:text-brand-400 pr-1' aria-hidden='true' />}
                            </div>
                        </div>
                    </div>
                    <div className='flex justify-between text-neutral-900 dark:text-neutral-200 py-2'>
                        <label className='font-gothic font-medium flex items-center hover:cursor-pointer'>
                            <input className='mr-2' type='checkbox' onChange={() => setRememberMe(!rememberMe)} checked={rememberMe}/>
                            Remember Me
                        </label>
                        <p onClick={() => {navigate("/recovery")}} className='ml-5 font-gothic font-medium hover:cursor-pointer hover:underline'>Forgot Password</p>
                    </div>
                    <div className='relative'>
                        {!!error ?
                            <p className='font-gothic font-demi text-xs text-center text-red-600'>{error}</p>: null
                        }
                    </div>
                    <button className="font-gothic font-demi text-white w-full my-5 py-2 border rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 dark:from-brand-400 dark:to-brand-600 hover:opacity-90 hover:underline">
                        {!!error ? "Try Again" : "Login"}
                    </button>
                    <p onClick={() => {navigate("/signup")}} className='font-gothic font-medium mb-2 text-sm text-center hover:cursor-pointer hover:underline'>
                        Don't Have an Account? Sign Up Now!
                    </p>
                </form>
            </div>
        </div>
    );
}