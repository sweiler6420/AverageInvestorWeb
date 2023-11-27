import React, { useState, useEffect, useContext } from 'react'
import { useNavigate} from "react-router-dom"
import useApi from '../../../hooks/useApi'
import ErrorsContext from '../../../ErrorsContext'

export default function Chart() {
    const { error, setError } = useContext(ErrorsContext)
    const { apiGet } = useApi()
    const [watchlist, setWatchlist] = useState()

    useEffect(() => {
        var payload = {}

        apiGet(`v1/watchlist`, payload).then( response => {
            if(response.data){
                setWatchlist(response.data)
            }
            else{
                console.log(response)
                //Handle errors
            }
        })
    }, [])

    // useEffect(() => {
    //     if(watchlist){
    //         console.log(watchlist)
    //     }
    // }, [watchlist])

    return (
    <div className="bg-white">
        {watchlist &&
            <>
                <ul className='max-w-md border border-black'>
                    {watchlist.map((stock, index) => 
                        <div className='flex-1 min-w-0'>
                            <li className={`list-none px-3 py-2 border-t border-black ${index === 0 ? "border-none" : ""}`}>
                                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                    {/* <div className="flex-shrink-0">
                                        <img className="w-8 h-8 rounded-full" src="/docs/images/people/profile-picture-1.jpg" alt="Neil image">
                                    </div> */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-md text-black truncate">
                                            {stock.ticker_symbol.toUpperCase()}
                                        </p>
                                        <p className="text-sm text-black truncate">
                                            {stock.company}
                                        </p>
                                    </div>
                                    <div className="inline-flex items-center text-base font-semibold text-black">
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