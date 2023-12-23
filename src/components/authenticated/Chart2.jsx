import React, { useState, useEffect, useRef, useLayoutEffect} from 'react'
import CandleStickChart from './widgets/CandleStickChart.jsx'
import Watchlist from './widgets/Watchlist'
import News from './widgets/News'
import GridLayout, {WidthProvider} from "react-grid-layout";

import { getData } from "./utils";
import { calculateNewValue } from '@testing-library/user-event/dist/utils/index.js';

const Grid = WidthProvider(GridLayout)

export default function ChartV2() {
    // const [ layout, setLayout ] = useState([
    //     {
    //         key: 'watchlist',
    //         dataGrid: {x: 0, y: 0, w: 2, h: 9, maxW: 4},
    //         graph: <Watchlist/>,
    //         static: true,
    //         heading: 'Watchlist'
    //     },
    //     { 
    //         key: 'StockChart',
    //         dataGrid: {x: 0, y: 0, w: 6, h: 6},
    //         graph: <CandleStickChart/>,
    //         static: true,
    //         heading: 'Stock Chart'
    //     },
    // ])

    const [data, setData] = useState(null);
    const chartRef = useRef(null)
    const [chartWidth, setChartWidth] = useState(0)
    const [chartHeight, setChartHeight] = useState(0)

    useEffect(() => {
        getData().then((data) => {
            setData(data);
        });
    }, []);

    useEffect(() => {
        if(chartRef.current){
            setChartWidth(chartRef.current.offsetWidth)
            setChartHeight(chartRef.current.offsetHeight)
        }
    }, [])

    async function handleResize(event){
        await setTimeout(1000)
        // setChartWidth(chartRef.current.offsetWidth)
        // setChartHeight(chartRef.current.offsetHeight)
    }

    return (
        <div className='bg-background dark:bg-background w-screen h-screen'>
            <Grid rowHeight={30} draggableHandle="#dragMe" onResizeStop={() => {handleResize()}} > 
                {/* <div key="chart" data-grid={{x: 2, y: 0, w: 8, h: 15, maxW: 10, isBounded: true}} className='overflow-hidden border bg-background-sub dark:bg-background-sub outline outline-primary dark:outline-none dark:shadow-neon-primary-sm focus:bg-background dark:focus:bg-background'>
                    <div ref={chartRef} className="h-full w-full">
                        <div className="flex relative justify-center align-middle hover:bg-secondary cursor-move">
                            <div id="dragMe" style={{position:"absolute", height:"100%", width:"100%"}}/>
                            <div className="text-black dark:text-white">
                                Chart
                            </div>
                        </div>
                        <div>
                            {data && 
                                <CandleStickChart containerWidth={chartWidth} containerHeight={chartHeight}/>
                            }
                        </div>
                    </div>
                </div> */}
                <div key="watchlist" data-grid={{x: 0, y: 0, w: 2, h: 9, maxW: 4, isBounded: true}} className='overflow-hidden border bg-background-sub dark:bg-background-sub outline outline-primary dark:outline-none dark:shadow-neon-primary-sm focus:bg-background dark:focus:bg-background'>
                    <div className="flex relative justify-center align-middle hover:bg-secondary cursor-move">
                        <div id="dragMe" style={{position:"absolute", height:"100%", width:"100%"}}/>
                        <div className="text-black dark:text-white">
                            Watchlist
                        </div>
                    </div>
                    <div style={{height: 'calc(100% - 38px)'}} className='overflow-auto w-full'>
                        <Watchlist/>
                    </div>
                    <div style={{height: 'calc(100% - 14px)'}}>
                    </div>
                </div> 
                <div key="news" data-grid={{x: 0, y: 0, w: 2, h: 9, maxW: 4, isBounded: true}} className='border bg-background-sub dark:bg-background-sub outline outline-primary dark:outline-none dark:shadow-neon-primary-sm focus:bg-background dark:focus:bg-background'>
                    <div className="flex relative justify-center align-middle hover:bg-secondary cursor-move">
                        <div id="dragMe" style={{position:"absolute", height:"100%", width:"100%"}}/>
                        <div className="text-black dark:text-white">
                            News
                        </div>
                    </div>
                    <div style={{height: 'calc(100% - 38px)'}} className='overflow-auto w-full'>
                        <News/>
                    </div>
                    <div style={{height: 'calc(100% - 14px)'}}>
                    </div>
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