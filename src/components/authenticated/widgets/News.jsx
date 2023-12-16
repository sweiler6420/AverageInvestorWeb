import { useState, useEffect } from 'react'
import useApi from '../../../hooks/useApi'

export default function News() {
    const { apiGet } = useApi()
    const [newslist, setNewslist] = useState()
    const newsHeight = 100

    useEffect(() => {
        apiGet(`v1/news`, {}).then( response => {
            if(response.data){
                setNewslist(response.data)
            }
            else{
                console.log(response)
                //Handle errors
            }
        })
    }, [])

    function openArticle(event){
        event.preventDefault();
        window.open(event.currentTarget.id, "_blank", "noreferrer");
    }

    return(
        <div style={{height: newsHeight}}>
            {!newslist ? "No Relevant News Found":
            <div className=''>
                <ul className='bg-white'> 
                    {newslist.articles?.map((news, index) => 
                        <li id={news.url} className='p-1' onClick={(event) => {openArticle(event)}}>
                            <div className='p-1 hover:bg-secondary hover:cursor-pointer border rounded-lg border-black'>
                                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                    <div>
                                        <img className="w-16 h-16 rounded-lg object-cover" src={news.urlToImage} alt="Neil image" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="flex justify-between">
                                            <p className="font-bold text-sm text-black truncate">
                                                {news.source.name}
                                            </p>
                                            <p className="font-bold text-sm text-black truncate">
                                                {news.author}
                                            </p>
                                        </span>
                                        <p className="font-bold text-sm text-black truncate">
                                            {news.title}
                                        </p>
                                        <p className="text-sm text-black truncate">
                                            {news.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    )}
                </ul>
            </div>}
        </div>
    )
}