import React, { useState, useEffect, useContext } from 'react'
import { useSignIn } from 'react-auth-kit'
import useApi from '../hooks/useApi'
import ErrorsContext from '../ErrorsContext'
import { useNavigate, useLocation } from 'react-router-dom'
import loginImg from '../assets/loginImg2.jpg'
import loginImg_dark from '../assets/loginImg2-dark.jpg'
import styles from './Login.styles'
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import DarkModeSwitcher from './header/DarkModeSwitcher'

export default function Login() {
    const { error } = useContext(ErrorsContext)
    const { apiPost } = useApi()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [visible, setVisible] = useState(true)
    const [response, setResponse] = useState("")

    const navigate = useNavigate()
    const location = useLocation()
    const data = location.state

    const signIn = useSignIn()

    useEffect( ()=> {
        if (error.length === 0 && response !== ""){
            signIn({
                token: response.access_token,
                expiresIn: 3600,
                tokenType: "Bearer",
                authState: { user_id: "test"}
            })
            navigate("stocks")
        }
    }, [response])

    useEffect( ()=> {
        if (data && data.length !== 0){
            setUsername(data.username)
            setPassword(data.password)
        }
    }, [data])

    useEffect( ()=> {
        if (error.length >= 1){
            setUsername("")
            setPassword("")
        }
    }, [error])

    function signin(event) {
        event.preventDefault()
        
        if (validated) {
            var payload = {
                'username': username,
                'password': password,
            };
    
            apiPost(`v1/login`, payload).then( response => {
                setResponse(response)
            })
        }
    }

    function validated() {
        if (username !== "" && password !== "") {
            return true
        }
    }

    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 h-screen w-full'>
            <div className='hidden sm:block'>
                <img className='w-full h-full object-cover' src={loginImg_dark} alt=''/>
                <a className='absolute bottom-1 left-1 text-gray-800' href="http://www.freepik.com/free-ai-image/financial-investment-bull-market_65695918.htm#fromView=search&term=stock&page=1&position=24&track=ais_ai_generated">Image By WangXiNa</a>
            </div>
            <div className={styles.login_form_div}>
                <DarkModeSwitcher/>
                <form className='bg-background-acc-color dark:bg-background-acc-color shadow shadow-primary-color max-w-[400px] w-full mx-auto p-8 rounded-lg' onSubmit={signin}>
                    <h2 className='text-4xl text-text-color dark:text-text-color font-bold text-center'> SIGN IN</h2>
                    <div className='flex flex-col text-text-color dark:text-text-color py-2'>
                        <label> Username: </label>
                        <input className='rounded-lg bg-background-color dark:bg-background-color outline-none shadow focus:shadow-primary-color dark:focus:shadow-primary-color mt-2 p-2' type="text" onChange={event => setUsername(event.target.value)} value={username}/>
                    </div>
                    <div className='flex flex-col text-text-color dark:text-text-color py-2'>
                        <label> Password: </label>
                        <div className='relative'>
                            <input className='w-full rounded-lg bg-background-color dark:bg-background-color outline-none shadow focus:shadow-primary-color dark:focus:shadow-primary-color mt-2 p-2 ' type={visible ? "text" : "password"} onChange={event => setPassword(event.target.value)} value={password}/> 
                            <div className='absolute top-1 right-1'>
                                {visible ? <EyeOutlined onClick={() => setVisible(false)} className='p-4'/> : 
                                    <EyeInvisibleOutlined onClick={() => setVisible(true)} className='p-4'/>}
                            </div>
                        </div>
                    </div>
                    <div className='flex justify-between text-text-color dark:text-text-color py-2'>
                        <p className='flex items-center'><input className='mr-2' type='checkbox' /> Remember Me</p>
                        <p>Forgot Password</p>
                    </div>
                    {error && error.length !== 0 ?
                        <> <button className={styles.login_form_button}>Try Again</button> </>: 
                           <> <button className={styles.login_form_button}>Login</button> </>
                    }
                </form>
            </div>
        </div>
    );
}