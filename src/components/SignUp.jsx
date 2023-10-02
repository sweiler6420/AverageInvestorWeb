import React, { useState, useEffect, useContext } from 'react'
import useApi from '../hooks/useApi'
import ErrorsContext from '../ErrorsContext'
import { useNavigate } from 'react-router-dom'
import loginImg from '../assets/loginImg2.jpg'
import styles from './Login.styles'
import validator from 'validator'
import Tooltip from 'react-power-tooltip'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function SignUp() {
    const { error } = useContext(ErrorsContext)
    const { apiPost } = useApi()
    const [email, setEmail] = useState("")
    const [emailError, setEmailError] = useState("")
    const [usernameError, setUsernameError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [passwordTT, setPasswordTT] = useState(false)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [visible, setVisible] = useState(true)
    const [response, setResponse] = useState("")

    const navigate = useNavigate()

    useEffect( ()=> {
        if (error.length === 0 && response !== ""){
            var data = {
                'username': username,
                'password': password}

            navigate("/login", {state: data})
        }
    }, [response])

    useEffect( ()=> {
        if (error.length >= 1){
            setUsername("")
            setPassword("")
            setEmail("")
        }
    }, [error])

    function signup(event) {
        event.preventDefault()

        if (validateInput()) {
            var payload = {
                'username': username,
                'password': password,
                'email': email.toLowerCase()
            };
    
            apiPost(`v1/users`, payload).then( response => {
                setResponse(response)
            })
        }
    }

    function validateInput() {
        let valid = true
        setEmailError("")
        setPasswordError("")
        setUsernameError("")

        if (email !== "") {
            if (!validator.isEmail(email)) {
                setEmailError("Not A Valid Email")
                valid = false
            }
        }else {
            setEmailError("Please Enter an Email")
            valid = false
        }

        if (!validator.isStrongPassword(password, {
                minLength: 7, 
                minLowerCase: 1,
                minUppercase: 1, 
                minNumbers:1, 
                minSybols: 1})) {
                    setPasswordError("Password Must Obey Rules")
                    valid = false
        }

        if (username !== "") {
            if (username.length < 7) {
                setUsernameError("Username must be 7+ characters")
                valid = false
            }
            if (email !== "" && username === email){
                setUsernameError("Username Cannot Be Your Email")
                valid = false
            }
        }else {
            setUsernameError("Please Enter a Username")
            valid = false
        }
        return valid
    }

    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 h-screen w-full'>
            <div className='hidden sm:block'>
                <img className='w-full h-full object-cover' src={loginImg} alt=''/>
                <a className='absolute bottom-1 left-1 text-gray-800' href="http://www.freepik.com/free-ai-image/financial-investment-bull-market_65695918.htm#fromView=search&term=stock&page=1&position=24&track=ais_ai_generated">Image By WangXiNa</a>
            </div>
            <div className={styles.login_form_div}>
                <form className='bg-background-acc-color dark:bg-background-acc-color shadow-inner shadow-primary-color max-w-[400px] w-full mx-auto p-8 rounded-lg' onSubmit={signup}>
                    <h2 className='text-4xl text-text-color dark:text-text-color font-bold text-center'> SIGN UP</h2>
                    <div className='flex flex-col text-text-color dark:text-text-color py-2'>
                        <div className='relative'>
                            <label> Email: </label> 
                            {emailError !== "" ? <label className='absolute text-red-acc-color dark:text-red-acc-color right-1'>{emailError}</label> : null}
                        </div>
                        <input className='rounded-lg bg-background-color dark:bg-background-color outline-none shadow focus:shadow-primary-color dark:focus:shadow-primary-color mt-2 p-2' type="text" onChange={event => setEmail(event.target.value)} value={email}/>
                    </div>
                    <div className='flex flex-col text-text-color dark:text-text-color py-2'>
                        <div className='relative'>
                            <label> Username: </label>
                            {usernameError !== "" ? <label className='absolute text-red-acc-color dark:text-red-acc-color right-1'>{usernameError}</label> : null}
                        </div>
                        <input className='rounded-lg bg-background-color dark:bg-background-color outline-none shadow focus:shadow-primary-color dark:focus:shadow-primary-color mt-2 p-2' type="text" onChange={event => setUsername(event.target.value)} value={username}/>
                    </div>
                    <div className='flex flex-col text-text-color dark:text-text-color py-2'>
                        <div className='relative'>
                            <label> Password: </label>
                            {passwordError !== "" ? <label className='absolute text-red-acc-color dark:text-red-acc-color right-1 underline' onMouseOver={() => setPasswordTT(true)} onMouseLeave={() => setPasswordTT(false)}>{passwordError}</label> : null}
                            <Tooltip show={passwordTT} color="white" backgroundColor="#0a0a0a" shadow="white" arrowAlign='end' position='bottom right' moveRight='-40px' textBoxWidth='auto'>
                                <ul className='text-sm'>
                                    <li>Minimum 7 Characters</li>
                                    <li>Atleast 1 Uppercase Character</li>
                                    <li>Atleast 1 Number</li>
                                    <li>Atleast 1 Symbol</li>
                                </ul>
                            </Tooltip>
                        </div>
                        <div className='relative'>
                            <input className='w-full rounded-lg bg-background-color dark:bg-background-color outline-none shadow focus:shadow-primary-color dark:focus:shadow-primary-color mt-2 p-2' type={visible ? "text" : "password"} onChange={event => setPassword(event.target.value)} value={password}/> 
                            <div className='absolute top-1 right-1'>
                            {visible ? <EyeIcon onClick={() => setVisible(false)} className='h-12 w-6' aria-hidden='true' /> : 
                                    <EyeSlashIcon onClick={() => setVisible(true)} className='h-12 w-6' aria-hidden='true' />}
                            </div>
                        </div>
                    </div>
                    <button className={styles.login_form_button}>Login</button>
                    <div className='relative'>
                        {error && error.length !== 0 ?
                            <p className='text-xs text-center text-red-acc-color dark:text-red-acc-color'>{error}</p>: null
                        }
                    </div>
                </form>
            </div>
        </div>
    );
}