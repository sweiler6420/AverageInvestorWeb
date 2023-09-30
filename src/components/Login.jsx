import React, { useState, useEffect, useContext } from 'react'
import { useSignIn } from 'react-auth-kit'
import useApi from '../hooks/useApi'
import ErrorsContext from '../ErrorsContext'
import { useNavigate } from 'react-router-dom'
import loginImg from '../assets/loginImg2.jpg'
import styles from './Login.styles'
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'

export default function Login() {
    const { error } = useContext(ErrorsContext)
    const { apiPost } = useApi()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [visible, setVisible] = useState(true)
    const [response, setResponse] = useState("")

    const navigate = useNavigate()

    const signIn = useSignIn()

    useEffect( ()=> {
        console.log(response)
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
    
            apiPost(`login`, payload).then( response => {
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
        <div className={styles.login_div}>
            <div className={styles.login_img_div}>
                <img className={styles.login_img} src={loginImg} alt=''/>
                <a className='absolute bottom-1 left-1 text-gray-800' href="http://www.freepik.com/free-ai-image/financial-investment-bull-market_65695918.htm#fromView=search&term=stock&page=1&position=24&track=ais_ai_generated">Image By WangXiNa</a>
            </div>
            <div className={styles.login_form_div}>
                <form className={styles.login_form} onSubmit={signin}>
                    <h2 className={styles.login_form_h2}> SIGN IN</h2>
                    <div className={styles.login_form_label_input_div}>
                        <label> Username: </label>
                        <input className={styles.login_form_input} type="text" onChange={event => setUsername(event.target.value)} value={username}/>
                    </div>
                    <div className='flex flex-col text-gray-400 py-2'>
                        <label> Password: </label>
                        <div className='relative'>
                            <input className='w-full rounded-lg bg-gray-700 mt-2 p-2 focus:border-blue-500 focus:bg-gray-800 focus:outline-black' type={visible ? "text" : "password"} onChange={event => setPassword(event.target.value)} value={password}/> 
                            <div className='absolute top-1 right-1'>
                                {visible ? <EyeOutlined onClick={() => setVisible(false)} className='p-4'/> : 
                                    <EyeInvisibleOutlined onClick={() => setVisible(true)} className='p-4'/>}
                            </div>
                        </div>
                    </div>
                    <div className={styles.login_form_submit_div}>
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