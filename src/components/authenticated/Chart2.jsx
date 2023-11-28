import React, { useState, useEffect, useRef} from 'react'
import CandleStickChart from './widgets/CandleStickChart'
import Watchlist from './widgets/Watchlist'
import GridLayout, {WidthProvider} from "react-grid-layout";

const Grid = WidthProvider(GridLayout)

export default function ChartV2() {
    const [ layout, setLayout ] = useState([
        {
            key: 'watchlist',
            dataGrid: {x: 0, y: 0, w: 2, h: 9, maxW: 4},
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

    return (
        <div className='bg-white dark:bg-black w-screen h-screen'>
            <Grid rowHeight={30} draggableHandle="#dragMe">
                <div key="watchlist" data-grid={{x: 0, y: 0, w: 2, h: 9, maxW: 4, isBounded: true}} className='overflow-hidden border bg-background-sub dark:bg-background-sub outline outline-primary dark:outline-none dark:shadow-neon-primary-sm focus:bg-background dark:focus:bg-background'>
                    <div className="flex relative justify-center align-middle hover:bg-secondary cursor-move">
                        <div id="dragMe" style={{position:"absolute", height:"100%", width:"100%"}}/>
                        <div className="text-black dark:text-white">
                            Watchlist
                        </div>
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
            </Grid>
        </div>
    )
}
