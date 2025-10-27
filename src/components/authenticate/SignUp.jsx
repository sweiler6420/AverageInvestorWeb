import React, { useState, useEffect, useContext } from 'react'
import useApi from '../../hooks/useApi'
import ErrorsContext from '../../ErrorsContext'
import { useNavigate } from 'react-router-dom'
import loginImg from '../../assets/loginImg2.jpg'
import styles from '../styles/Form.styles'
import validator from 'validator'
import Tooltip from 'react-power-tooltip'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import useDarkMode from "../../hooks/useDarkMode";

export default function SignUp() {
    const { error } = useContext(ErrorsContext)
    const { theme } = useDarkMode();
    const { apiSignUp } = useApi()
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

    // useEffect(() => {
    //     if(isAuthenticated()){
    //         navigate("/login/stocks")
    //     }
    // }, [])

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
    
            apiSignUp(`v1/users`, payload).then( response => {
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
        <div className='grid grid-cols-1 sm:grid-cols-2 h-screen w-full bg-white dark:bg-neutral-950'>
            <div className='hidden sm:block'>
                <img className='w-full h-full object-cover' src={loginImg} alt=''/>
                <a className='absolute bottom-1 left-1 text-neutral-800 dark:text-neutral-300' href="http://www.freepik.com/free-ai-image/financial-investment-bull-market_65695918.htm#fromView=search&term=stock&page=1&position=24&track=ais_ai_generated">Image By WangXiNa</a>
            </div>
            <div className={styles.form_div}>
                <form className={styles.form_style} onSubmit={signup}>
                    <h2 className={styles.form_header}> SIGN UP</h2>
                    <div className={styles.form_input_div}>
                        <div className='relative'>
                            <label> Email: </label> 
                            {emailError !== "" ? <label className='absolute text-red-600 dark:text-red-400 right-1'>{emailError}</label> : null}
                        </div>
                        <input className='border border-neutral-300 dark:border-neutral-700 rounded-xl mt-2 p-2 w-full bg-white dark:bg-neutral-900' type="text" onChange={event => setEmail(event.target.value)} value={email}/>
                    </div>
                    <div className={styles.form_input_div}>
                        <div className='relative'>
                            <label> Username: </label>
                            {usernameError !== "" ? <label className='absolute text-red-600 dark:text-red-400 right-1'>{usernameError}</label> : null}
                        </div>
                        <input className='border border-neutral-300 dark:border-neutral-700 rounded-xl mt-2 p-2 w-full bg-white dark:bg-neutral-900' type="text" onChange={event => setUsername(event.target.value)} value={username}/>
                    </div>
                    <div className={styles.form_input_div}>
                        <div className='relative'>
                            <label> Password: </label>
                            {passwordError !== "" ? <label className='absolute text-red-600 dark:text-red-400 right-1 underline' onMouseOver={() => setPasswordTT(true)} onMouseLeave={() => setPasswordTT(false)}>{passwordError}</label> : null}
                            {theme === "light" ?
                                <Tooltip className='bg-red-500' show={passwordTT} color="#030104" backgroundColor="#f5f5f5" shadow="white" arrowAlign='end' position='bottom right' moveRight='-40px' textBoxWidth='auto'>
                                    <ul className='text-sm'>
                                        <li style={{fontWeight:500}}>Minimum 7 Characters</li>
                                        <li style={{fontWeight:500}}>Atleast 1 Uppercase</li>
                                        <li style={{fontWeight:500}}>Atleast 1 Number</li>
                                        <li style={{fontWeight:500}}>Atleast 1 Symbol</li>
                                    </ul>
                                </Tooltip> :
                                <Tooltip className='bg-red-500' show={passwordTT} color="#fdfbfe" backgroundColor="#0a0a0a" shadow="white" arrowAlign='end' position='bottom right' moveRight='-40px' textBoxWidth='auto'>
                                    <ul className='text-sm'>
                                        <li style={{fontWeight:400}}>Minimum 7 Characters</li>
                                        <li style={{fontWeight:400}}>Atleast 1 Uppercase</li>
                                        <li style={{fontWeight:400}}>Atleast 1 Number</li>
                                        <li style={{fontWeight:400}}>Atleast 1 Symbol</li>
                                    </ul>
                                </Tooltip>
                            }
                        </div>
                        <div className='relative'>
                            <input className='border border-neutral-300 dark:border-neutral-700 rounded-xl mt-2 p-2 w-full bg-white dark:bg-neutral-900' type={visible ? "text" : "password"} onChange={event => setPassword(event.target.value)} value={password}/> 
                            <div className='absolute top-1 right-1'>
                            {visible ? <EyeIcon onClick={() => setVisible(false)} className='h-12 w-6 text-brand-600 dark:text-brand-400 pr-1' aria-hidden='true' /> : 
                                    <EyeSlashIcon onClick={() => setVisible(true)} className='h-12 w-6 text-brand-600 dark:text-brand-400 pr-1' aria-hidden='true' />}
                            </div>
                        </div>
                    </div>
                    <button className='w-full my-5 py-2 rounded-lg font-semibold bg-brand-600 dark:bg-brand-500 text-white hover:opacity-90'>Sign Up</button>
                    <div className='relative'>
                        {error && error.length !== 0 ?
                            <p className='text-xs text-center text-red-600 dark:text-red-400'>{error}</p>: null
                        }
                    </div>
                    <p onClick={() => {navigate("/login")}} className='text-sm text-neutral-900 dark:text-neutral-200 text-center hover:cursor-pointer hover:underline'>
                        Already Have an Account? Log In Now!
                    </p>
                </form>
            </div>
        </div>
    );
}