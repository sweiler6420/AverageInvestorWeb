import React, { useState, useEffect, useContext } from 'react'
import { useNavigate} from "react-router-dom"
import useApi from '../../../hooks/useApi'
import ErrorsContext from '../../../ErrorsContext'

export default function Chart() {
    const { error, setError } = useContext(ErrorsContext)
    const { apiGet } = useApi()
    const [watchlist, setWatchlist] = useState()
    const navigate = useNavigate()

    useEffect(() => {
        var payload = {}

        apiGet(`v1/watchlist`, payload).then( response => {
            if(response.status && response.status === 403){
                navigate('/login')
            }
            setWatchlist(response)
        })
    }, [])

    useEffect(() => {
        if(watchlist){
            console.log(watchlist)
        }
    }, [watchlist])

    return (
    <div className="bg-white">
        {watchlist &&
            <>
                <ul className='max-w-md border border-black'>
                    {watchlist.map((stock, index) => 
                        <div className='flex-1 min-w-0'>
                            <li class={`list-none px-3 py-2 border-t border-black ${index === 0 ? "border-none" : ""}`}>
                                <div class="flex items-center space-x-4 rtl:space-x-reverse">
                                    {/* <div class="flex-shrink-0">
                                        <img class="w-8 h-8 rounded-full" src="/docs/images/people/profile-picture-1.jpg" alt="Neil image">
                                    </div> */}
                                    <div class="flex-1 min-w-0">
                                        <p class="font-bold text-md text-black truncate">
                                            {stock.ticker_symbol.toUpperCase()}
                                        </p>
                                        <p class="text-sm text-black truncate">
                                            {stock.company}
                                        </p>
                                    </div>
                                    <div class="inline-flex items-center text-base font-semibold text-black">
                                        $320
                                    </div>
                                </div>
                            </li>
                        </div>
                    )}
                </ul>
            </>
        }
    </div>
    );
}