import React, { useState, useEffect, useContext } from 'react'
import useApi from '../../hooks/useApi'
import ErrorsContext from '../../ErrorsContext'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Recovery() {
    const { error, setError } = useContext(ErrorsContext)
    const { apiRecovery } = useApi()
    const [username, setUsername] = useState("")
    const [usernameError, setUsernameError] = useState("")
    const [response, setResponse] = useState("")
    const [success, setSuccess] = useState(false)

    const navigate = useNavigate()
    const location = useLocation()

    // Clear error when component mounts or route changes
    useEffect(() => {
        return () => {
            // Clear error when component unmounts (navigating away)
            if (setError) {
                setError(undefined)
            }
        }
    }, [location.pathname, setError])

    useEffect(() => {
        if (!error && response && response?.status === 200) {
            setSuccess(true)
            setTimeout(() => {
                navigate("/login", { replace: true })
            }, 3000)
        }
    }, [response, error, navigate])

    useEffect(() => {
        if (error) {
            setUsername("")
        }
    }, [error])

    function handleRecovery(event) {
        event.preventDefault()

        if (validateInput()) {
            var payload = {
                'username': username
            };

            apiRecovery(`v1/recovery`, payload).then(response => {
                setResponse(response)
            })
        }
    }

    function validateInput() {
        let valid = true
        setUsernameError("")

        if (username === "") {
            setUsernameError("Please Enter a Username")
            valid = false
        }

        return valid
    }

    function setFormValue(key) {
        return (ev) => {
            if (key === "username") {
                setUsername(ev.target.value)
            }
            setUsernameError("")
        }
    }

    return (
        <div className="flex flex-col items-center mt-6 lg:mt-20">
            <h1 className="text-4xl font-gothic font-xl mb-5">
                Password Recovery
            </h1>
            <div className="p-4 sm:w-1/2 md:w-1/2 lg:w-1/3 xl:w-1/4 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                <form className='mx-5' onSubmit={handleRecovery}>
                    {success ? (
                        <div className="flex flex-col items-center py-8">
                            <p className='font-gothic font-medium text-center text-neutral-900 dark:text-neutral-200 mb-4'>
                                Recovery request submitted successfully! You will be redirected to the login page shortly.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col text-neutral-900 dark:text-neutral-200 py-2">
                                <div className='relative'>
                                    <label className='font-gothic font-medium mb-2'> Username: </label> 
                                    {usernameError !== "" ? <label className='font-gothic font-medium absolute text-sm text-red-600 right-1 bottom-0'>{usernameError}</label> : null}
                                </div>
                                <input className="border border-neutral-300 dark:border-neutral-700 rounded-xl mt-2 p-2 w-full bg-white dark:bg-neutral-900" 
                                    type="text" onChange={setFormValue("username")} value={username} maxLength="50"/>
                            </div>
                            <div className='relative'>
                                {error ?
                                    <p className='font-gothic font-demi text-xs text-center text-red-600'>{error}</p>: null
                                }
                            </div>
                            <button className="font-gothic font-demi text-white w-full my-5 py-2 border rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 dark:from-brand-400 dark:to-brand-600 hover:opacity-90 hover:underline">
                                {error ? "Try Again" : "Submit"}
                            </button>
                            <p onClick={() => {navigate("/login")}} className='font-gothic font-medium mb-2 text-sm text-center hover:cursor-pointer hover:underline'>
                                Back to Login
                            </p>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
