import React, { useState, useEffect, useContext } from 'react'
import useApi from '../../hooks/useApi'
import ErrorsContext from '../../ErrorsContext'
import { useNavigate } from 'react-router-dom'
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
        if (!error && response !== ""){
            var data = {
                'username': username,
                'password': password}

            navigate("/login", {state: data})
        }
    }, [response, error])

    useEffect( ()=> {
        if (error){
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
        <div className="flex flex-col items-center mt-6 lg:mt-20">
            <h1 className="text-4xl font-gothic font-xl mb-5">
                Sign Up
            </h1>
            <div className="p-4 sm:w-1/2 md:w-1/2 lg:w-1/3 xl:w-1/4 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                <form className='mx-5' onSubmit={signup}>
                    <div className="flex flex-col text-neutral-900 dark:text-neutral-200 py-2">
                        <div className='relative'>
                            <label className='font-gothic font-medium mb-2'> Email: </label> 
                            {emailError !== "" ? <label className='font-gothic font-medium absolute text-sm text-red-600 right-1 bottom-0'>{emailError}</label> : null}
                        </div>
                        <input className="border border-neutral-300 dark:border-neutral-700 rounded-xl mt-2 p-2 w-full bg-white dark:bg-neutral-900" 
                            type="text" onChange={event => setEmail(event.target.value)} value={email}/>
                    </div>
                    <div className="flex flex-col text-neutral-900 dark:text-neutral-200 py-2">
                        <div className='relative'>
                            <label className='font-gothic font-medium mb-2'> Username: </label>
                            {usernameError !== "" ? <label className='font-gothic font-medium absolute text-sm text-red-600 right-1 bottom-0'>{usernameError}</label> : null}
                        </div>
                        <input className="border border-neutral-300 dark:border-neutral-700 rounded-xl mt-2 p-2 w-full bg-white dark:bg-neutral-900" 
                            type="text" onChange={event => setUsername(event.target.value)} value={username}/>
                    </div>
                    <div className="flex flex-col text-neutral-900 dark:text-neutral-200 py-2">
                        <div className='relative'>
                            <label className='font-gothic font-medium mb-2'> Password: </label>
                            {passwordError !== "" ? (
                                <>
                                    <label 
                                        className='font-gothic font-medium absolute text-sm text-red-600 right-1 bottom-0 underline' 
                                        onMouseOver={() => setPasswordTT(true)} 
                                        onMouseLeave={() => setPasswordTT(false)}
                                    >
                                        {passwordError}
                                    </label>
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
                                </>
                            ) : null}
                        </div>
                        <div className='relative'>
                            <input className="border border-neutral-300 dark:border-neutral-700 rounded-xl mt-2 p-2 w-full bg-white dark:bg-neutral-900" 
                                type={visible ? "text" : "password"} onChange={event => setPassword(event.target.value)} value={password}/> 
                            <div className='absolute top-1 right-1'>
                                {visible ? <EyeIcon onClick={() => setVisible(false)} className='h-12 w-6 text-brand-600 dark:text-brand-400 pr-1' aria-hidden='true' /> : 
                                    <EyeSlashIcon onClick={() => setVisible(true)} className='h-12 w-6 text-brand-600 dark:text-brand-400 pr-1' aria-hidden='true' />}
                            </div>
                        </div>
                    </div>
                    <div className='relative'>
                        {error ?
                            <p className='font-gothic font-demi text-xs text-center text-red-600'>{error}</p>: null
                        }
                    </div>
                    <button className="font-gothic font-demi text-white w-full my-5 py-2 border rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 dark:from-brand-400 dark:to-brand-600 hover:opacity-90 hover:underline">
                        {error ? "Try Again" : "Sign Up"}
                    </button>
                    <p onClick={() => {navigate("/login")}} className='font-gothic font-medium mb-2 text-sm text-center hover:cursor-pointer hover:underline'>
                        Already Have an Account? Log In Now!
                    </p>
                </form>
            </div>
        </div>
    );
}