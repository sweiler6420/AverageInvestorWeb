import React, { useState, useEffect, useRef} from 'react'
import CandleStickChart from './widgets/CandleStickChart'
import Watchlist from './widgets/Watchlist'
import GridLayout from "react-grid-layout";
import '../../css/dashboard.css'

export default function ChartV2() {
    const [ layout, setLayout ] = useState([
        {
            key: 'watchlist',
            dataGrid: {x: 0, y: 0, w: 3, h: 9},
            graph: <Watchlist/>,
            static: true,
            heading: 'Watchlist'
        },
        { 
            key: 'StockChart',
            dataGrid: {x: 0, y: 0, w: 6, h: 6},
            graph: <CandleStickChart/>,
            static: true,
            heading: 'Stock Chart'
        },
    ])


    function something(event) {
        // console.log(event)
    }


    return (
        <div className='w-screen h-screen border border-black'>
            <GridLayout rowHeight={30} width={1200} draggableHandle=".dragMe" onResizeStop={something}>
                <div key="watchlist" data-grid={{x: 0, y: 0, w: 3, h: 9}} className='static bg-background overflow-hidden'>
                    <div className={'heading'}>
                        <div className={'dragMe'}/>
                        'Watchlist'
                    </div>
                    <Watchlist/>
                </div>
                {/* {layout.map(layout => {
                    return (
                        <div key={layout.key} data-grid={{...layout.dataGrid}} onResize={something} className='bg-background'>
                            <div className={'heading'}>
                                <div className={'dragMe'}/>
                                {layout.heading}
                            </div>
                            {layout.graph}
                        </div>
                    )
                })} */}
            </GridLayout>
        </div>
    )
}
