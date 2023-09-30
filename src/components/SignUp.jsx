import React, { useState, useEffect, useContext } from 'react'
import { useSignIn } from 'react-auth-kit'
import useApi from '../hooks/useApi'
import ErrorsContext from '../ErrorsContext'
import { useNavigate } from 'react-router-dom'
import loginImg from '../assets/loginImg2.jpg'
import styles from './Login.styles'
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import validator from 'validator'
import Tooltip from 'react-power-tooltip'

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

    const signIn = useSignIn()

    useEffect( ()=> {
        console.log(response)
        if (error.length === 0 && response !== ""){
            navigate("login")
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

        validateInput()
        
        // if (validate(email)) {
        //     var payload = {
        //         'username': username,
        //         'password': password,
        //         'email': email
        //     };
    
        //     apiPost(`users/`, payload).then( response => {
        //         setResponse(response)
        //     })
        // }
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

        if (password !== "") {
            if (!validator.isStrongPassword(password, {
                    minLength: 7, 
                    minLowerCase: 1,
                    minUppercase: 1, 
                    minNumbers:1, 
                    minSybols: 1})) {
                        setPasswordError("Password Must Obey Rules")
                    }
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
        <div className={styles.login_div}>
            <div className={styles.login_img_div}>
                <img className={styles.login_img} src={loginImg} alt=''/>
                <a className='absolute bottom-1 left-1 text-gray-800' href="http://www.freepik.com/free-ai-image/financial-investment-bull-market_65695918.htm#fromView=search&term=stock&page=1&position=24&track=ais_ai_generated">Image By WangXiNa</a>
            </div>
            <div className={styles.login_form_div}>
                <form className={styles.login_form} onSubmit={signup}>
                    <h2 className={styles.login_form_h2}> SIGN UP</h2>
                    <div className={styles.login_form_label_input_div}>
                        <div className='relative'>
                            <label> Email: </label> 
                            {emailError !== "" ? <label className='absolute text-red-600 right-1'>{emailError}</label> : null}
                        </div>
                        <input className={styles.login_form_input} type="text" onChange={event => setEmail(event.target.value)} value={email}/>
                    </div>
                    <div className={styles.login_form_label_input_div}>
                        <div className='relative'>
                            <label> Username: </label>
                            {usernameError !== "" ? <label className='absolute text-red-600 right-1'>{usernameError}</label> : null}
                        </div>
                        <input className={styles.login_form_input} type="text" onChange={event => setUsername(event.target.value)} value={username}/>
                    </div>
                    <div className='flex flex-col text-gray-400 py-2'>
                        <div className='relative'>
                            <label> Password: </label>
                            {passwordError !== "" ? <label className='absolute text-red-600 right-1 underline' onMouseOver={() => setPasswordTT(true)} onMouseLeave={() => setPasswordTT(false)}>{passwordError}</label> : null}
                            <Tooltip show={passwordTT} color="white" backgroundColor="#111827" arrowAlign='end' position='bottom right' moveRight='-40px' textBoxWidth='auto'>
                                <ul listStyleType='disc'>
                                    <li>Minimum 7 Characters</li>
                                    <li>Atleast 1 Uppercase Character</li>
                                    <li>Atleast 1 Number</li>
                                    <li>Atleast 1 Symbol</li>
                                </ul>
                            </Tooltip>
                        </div>
                        <div className='relative'>
                            <input className='w-full rounded-lg bg-gray-700 mt-2 p-2 focus:border-blue-500 focus:bg-gray-800 focus:outline-black' type={visible ? "text" : "password"} onChange={event => setPassword(event.target.value)} value={password}/> 
                            <div className='absolute top-1 right-1'>
                                {visible ? <EyeOutlined onClick={() => setVisible(false)} className='p-4'/> : 
                                    <EyeInvisibleOutlined onClick={() => setVisible(true)} className='p-4'/>}
                            </div>
                        </div>
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