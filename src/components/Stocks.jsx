import React, { useState, useEffect, useContext } from 'react'
import { useSignIn } from 'react-auth-kit'
import useApi from '../hooks/useApi'
import ErrorsContext from '../ErrorsContext'
import { useNavigate } from 'react-router-dom'

export default function Stocks() {
    const { error, setError } = useContext(ErrorsContext)
    const { apiGet } = useApi()
    const [stock, setStock] = useState("")
    const [response, setResponse] = useState("")

    const navigate = useNavigate()

    const signIn = useSignIn()

    useEffect( ()=> {
        console.log(response)
        if (error.length === 0 && response !== ""){
            // navigate("stocks")
        }
    }, [response])

    function signin(event) {
        event.preventDefault()
        
        var payload = {
            'limit': 108,
            'offset': 0,
            'search': stock
        };

        apiGet(`stock_data/`, payload).then( response => {
            setResponse(response)
        })
    }

    return (
    <div className="Login">
        <form onSubmit={signin}>
            <label> 
                Stock:
                <input type="text" onChange={event => setStock(event.target.value)} value={stock}/>
            </label>
            <button>Get Stock</button>
        </form>
        <p>{error}</p>
    </div>
    );
}