import React, { useState, useEffect, useContext } from 'react'
import useApi from '../../hooks/useApi'
import { useNavigate } from 'react-router-dom'
import CandleStickChart from './widgets/CandleStickChart'
import Watchlist from './widgets/Watchlist'

export default function Chart() {
    const { apiGet } = useApi()
    const [stock, setStock] = useState("")
    const [response, setResponse] = useState()
    const navigate = useNavigate()


    function getStocks(event) {
        event.preventDefault()
        
        var payload = {
            'limit': 540,
            'offset': 540,
            'search': stock
        };

        apiGet(`v1/stock_data`, payload).then( response => {
            console.log(response)
            if(response.status && response.status === 403){
                console.log("redirect")
                navigate('/login')
            }
            else{
                setResponse(response)
            }
        })
    }

    return (
    <div className="bg-background dark:bg-background">
        <form onSubmit={getStocks}>
            <label className='text-black dark:text-white'> 
                Stock:
                <input className='bg-background dark:bg-background' type="text" onChange={event => setStock(event.target.value)} value={stock}/>
            </label>
            <button className='text-black dark:text-white bg-background dark:bg-background'>Get Stock</button>
        </form>
        {/* <p>{error}</p> */}
        <div className='bg-white flex flex-auto items-center'>
            <Watchlist/>
        </div>
        <div className='bg-white flex flex-auto items-center'>
            <CandleStickChart ticker={response} width={928} height={600}/> 
        </div>
    </div>
    );
}