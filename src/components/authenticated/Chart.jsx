import React, { useState, useEffect, useContext } from 'react'
import { useSignIn } from 'react-auth-kit'
import useApi from '../../hooks/useApi'
import ErrorsContext from '../../ErrorsContext'
import { useNavigate } from 'react-router-dom'
import CandleStickChart from './CandleStickChart'

export default function Chart() {
    const { error, setError } = useContext(ErrorsContext)
    const { apiGet } = useApi()
    const [stock, setStock] = useState("")
    const [response, setResponse] = useState()

    function signin(event) {
        event.preventDefault()
        
        var payload = {
            'limit': 540,
            'offset': 540,
            'search': stock
        };

        apiGet(`v1/stock_data`, payload).then( response => {
            setResponse(response)
        })
    }

    return (
    <div className="bg-background dark:bg-background">
        <form onSubmit={signin}>
            <label className='text-black dark:text-white'> 
                Stock:
                <input className='bg-background dark:bg-background' type="text" onChange={event => setStock(event.target.value)} value={stock}/>
            </label>
            <button className='text-black dark:text-white bg-background dark:bg-background'>Get Stock</button>
        </form>
        <p>{error}</p>
        <div className='bg-white flex flex-auto items-center'>
            <CandleStickChart ticker={response} width={928} height={600}/> 
        </div>
    </div>
    );
}