import React, { useState, useEffect, useContext } from 'react'
import useApi from '../../hooks/useApi'
import useAuth from '../../hooks/useAuth';
import ErrorsContext from '../../ErrorsContext'
import { useNavigate, useLocation } from 'react-router-dom'
import loginImg from '../../assets/loginImg2.jpg'
import styles from '../styles/Form.styles'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { Underline } from 'react-feather'


export default function Login() {
    const { error } = useContext(ErrorsContext)
    const { apiLogin } = useApi()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [visible, setVisible] = useState(false)
    const [response, setResponse] = useState("")
    const [rememberMe, setRememberMe] = useState(localStorage.rememberMe === 'true')

    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth();
    const signUpData = location.state
    

    useEffect(() => {
        localStorage.setItem('rememberMe', rememberMe)
    }, [rememberMe])

    useEffect(() => {
        if(rememberMe){
            setUsername(localStorage.username !== "" ? JSON.parse(localStorage.getItem('username')) : "")
            setPassword(localStorage.pass !== "" ? JSON.parse(localStorage.getItem('pass')) : "")
        }
    }, [])

    useEffect(()=> {
        if (error.length === 0 && response !== ""){
            const access_token = response.access_token
            const roles = 2001
            login(access_token, roles)

            if(rememberMe){
                localStorage.setItem("username", JSON.stringify(username));
                localStorage.setItem("pass", JSON.stringify(password));
            }else{
                localStorage.setItem('username', "")
                localStorage.setItem('pass', "")
            }

            navigate("stocks")
        }
    }, [response])

    useEffect(()=> {
        if (signUpData && signUpData.length !== 0){
            setUsername(signUpData.username)
            setPassword(signUpData.password)
        }
    }, [signUpData])

    useEffect(()=> {
        if (error.length >= 1){
            setUsername("")
            setPassword("")
        }
    }, [error])

    function signin(event) {
        event.preventDefault()
        
        if (validated()) {
            var payload = {
                'username': username,
                'password': password,
            };
    
            apiLogin(`v1/login`, payload).then( response => {
                if(!!response.access_token){
                    setResponse(response)
                }
            })
        }
    }

    function validated() {
        if (username !== "" && username !== undefined && password !== "" && password !== undefined) {
            return true
        }
        else{
            return false
        }
    }

    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 h-screen w-full'>
            <div className='hidden sm:block'>
                <img className='w-full h-full object-cover' src={loginImg} alt=''/>
                <a className='absolute bottom-1 left-1 text-gray-800' href="http://www.freepik.com/free-ai-image/financial-investment-bull-market_65695918.htm#fromView=search&term=stock&page=1&position=24&track=ais_ai_generated">Image By WangXiNa</a>
            </div>
            <div className={styles.form_div}>
                <form className={styles.form_style} onSubmit={signin}>
                    <h2 className={styles.form_header}> SIGN IN</h2>
                    <div className={styles.form_input_div}>
                        <label> Username: </label>
                        <input className={styles.form_input} type="text" onChange={event => setUsername(event.target.value)} value={username ? username : ""}/>
                    </div>
                    <div className={styles.form_input_div}>
                        <label> Password: </label>
                        <div className='relative'>
                            <input className={styles.form_input} type={visible ? "text" : "password"} onChange={event => setPassword(event.target.value)} value={password ? password : ""}/> 
                            <div className='absolute top-1 right-1'>
                                {visible ? <EyeIcon onClick={() => setVisible(false)} className='h-12 w-6 text-primary pr-1' aria-hidden='true' /> : 
                                    <EyeSlashIcon onClick={() => setVisible(true)} className='h-12 w-6 text-primary pr-1' aria-hidden='true' />}
                            </div>
                        </div>
                    </div>
                    <div className='flex justify-between text-text dark:text-text py-2'>
                        <p className='flex items-center'><input className='mr-2' type='checkbox' onChange={() => setRememberMe(!rememberMe)} checked={rememberMe}/> Remember Me</p>
                        <p onClick={() => {navigate("recovery")}} className='hover:cursor-pointer hover:underline'>Forgot Password</p>
                    </div>
                    {error && error.length !== 0 ?
                        <> <button className={styles.form_button}>Try Again</button> </>: 
                        <> <button className={styles.form_button}>Login</button> </>
                    }
                    <p onClick={() => {navigate("/signup")}} className='text-sm text-text dark:text-text text-center hover:cursor-pointer hover:underline'>
                        Don't Have an Account? Sign Up Today!
                    </p>
                </form>
        </div>
    </div>
    );
}