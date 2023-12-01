import React, { useState, useEffect} from 'react'
// import CandleStickChart from './widgets/CandleStickChart'
import Watchlist from './widgets/Watchlist'


export default function Chart() {
    const [widgets, setWidgets] = useState([])

    function handleOnDrag(event, widget){
        event.dataTransfer.setData("widget", widget)
    }

    function handleOnDrop(event){
        const widget = event.dataTransfer.getData("widget").toString()
        console.log(widget)
        if(widget === "Watchlist"){
            setWidgets([...widgets, <Watchlist/>])
        }
        else if(widget === "Stock Chart"){
            setWidgets([...widgets, <Watchlist/>])//<CandleStickChart/>
        }
        
    }

    function handleDragOver(event){
        event.preventDefault()
    }

    return (
    <div className="bg-background dark:bg-background">
        <div draggable onDragStart={(e) => handleOnDrag(e, "Watchlist")}>
            Watchlist
        </div>
        <div draggable onDragStart={(e) => handleOnDrag(e, "Stock Chart")}>
            Stock Chart
        </div>
        <div className="border border-black" onDrop={handleOnDrop} onDragOver={handleDragOver}>
            {widgets.map((widget, index) => (
                <div kay={index}>
                    {widget}
                </div>
            ))}

        </div>
        {/* 
        <div className='bg-white flex flex-auto items-center'>
            <CandleStickChart ticker={response} width={928} height={600}/> 
        </div> */}
    </div>
    );
}