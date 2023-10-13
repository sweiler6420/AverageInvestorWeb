import { React, useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { scaleTime, zoomTransform } from 'd3'
// import * as fc from 'd3fc'
import { Underline } from 'react-feather'
import { scaleDiscontinuous } from './d3fc/@d3fc/d3fc-discontinuous-scale'
import { discontinuityProvider } from './d3fc/@d3fc/d3fc-discontinuous-scale'
import { discontinuitySkipWeeklyPattern } from './d3fc/@d3fc/d3fc-discontinuous-scale'

export default function CandleStickChart({ticker, width, height}) {

    const [ data, setData ] = useState()
    const [ interval, setInterval ] = useState(5)

    const svgRef = useRef()
    const chartListener = useRef()
    const ohlcTooltip = useRef()
    const crosshairX = useRef()
    const crosshairY = useRef()
    const crosshairTextY = useRef()
    const crosshairTooltipBoxY = useRef()
    const crosshairTextX = useRef()
    const crosshairTooltipBoxX = useRef()

    const padding = 2;

    // SVG margin variables
    const marginTop = 15;
    const marginBottom = 20;
    const marginRight = 50;
    const marginLeft = 0;

    const [ currentZoomState, setCurrentZoomState ] = useState()

    const nonTradingHoursPattern = {
        Monday: [
            ['SOD', '08:30'],
            ['17:00', 'EOD']
        ],
        Tuesday: [
            ['SOD', '08:30'],
            ['17:00', 'EOD']
        ],
        Wednesday: [
            ['SOD', '08:30'],
            ['17:00', 'EOD']
        ],
        Thursday: [
            ['SOD', '08:30'],
            ['17:00', 'EOD']
        ],
        Friday: [
            ['SOD', '08:30'],
            ['17:00', 'EOD']
        ],
        Saturday: [['SOD', 'EOD']],
        Sunday: [['SOD', 'EOD']]
    }

    useEffect(() => {
        if(ticker) {
            ticker.forEach(function(d) {
                d.date = new Date(d.datetime)
                d.close_price = +d.close_price
                d.open_price = +d.open_price
                d.low_price = +d.low_price
                d.high_price = +d.high_price
            })
            setData(ticker)
        }

    }, [ticker])

    useEffect(() => {if(data) {
        // Declare the start and end date - 1
        const start_date = data.at(0).date
        const end_date = (data.at(-1).date)

        // Create TimeBand to calculate the bandwidth for us!
        const xBand = d3.scaleBand()
            .domain(d3.timeMinutes(start_date, end_date, interval)) //1440 minutes in a day
            .range([marginLeft, width-marginRight])
            .padding(0.5)    

        let xBandwidth = xBand.bandwidth()
        
        if (currentZoomState) {
            xBandwidth = xBand.bandwidth() * currentZoomState.k
        }

        // const testStart1 = data.at(200).date
        // const testEnd1 = data.at(201).date

        // const testStart2 = data.at(516).date
        // const testEnd2 = data.at(517).date

        // console.log([testStart1, testEnd1], [testStart2, testEnd2])

        // console.log(discontinuityProviderOffset())

        // Testing
        // let xScale = scaleDiscontinuous(scaleTime())
        //     .discontinuityProvider(discontinuitySkipWeeklyPattern(nonTradingHoursPattern))
        //     .domain([start_date, end_date])
        //     .range([marginLeft, width-marginRight])

        // console.log(data)

        let xScale = scaleDiscontinuous(d3.scaleTime())
            .discontinuityProvider(discontinuitySkipWeeklyPattern(nonTradingHoursPattern))
            .domain([start_date, end_date])
            .range([marginLeft, width-marginRight])

        console.log(xScale(data.at(125).date))

        console.log(xScale.invert(200))


        if (currentZoomState) {
            xScale = currentZoomState.rescaleX(xScale)
        }

        // Create xScale ScaleTime
            //domain: array of start date and end date
            //range: px start and px end locations
        // let xScale = d3.scaleTime()
        //     .domain([start_date, end_date])
        //     .range([marginLeft, width-marginRight])

        // if (currentZoomState) {
        //     xScale = currentZoomState.rescaleX(xScale)
        // }

        // Create yScale scaleLog
            //domain: upper and lower limit of the data to scale on the y [lowest price possible, highest possible]
            //rangeRound: approximation of the height range to map to the domain values
        let yScale = d3.scaleLinear()
            .domain([d3.min(data, d => d.low_price), d3.max(data, d => d.high_price)])
            .rangeRound([height - marginBottom, marginTop]);

        if (currentZoomState) {
            yScale = currentZoomState.rescaleY(yScale)
        }

        // Cull svg object before rerender
        d3.select(svgRef.current).selectAll("g").remove()
        d3.select(svgRef.current).selectAll("clipPath").remove()

        // Create the SVG container.
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .style('background', '#d3d3d3')
            .style('margin-top', '50')
            // .style('overflow', 'visible')

        const listeningRect = d3.select(chartListener.current)
            .attr("width", width-marginRight)
            .attr("height", height-marginBottom-marginTop)
            .attr("transform", `translate(0,${marginTop})`)
            .attr("stroke-width", 1)
            .attr("stroke", "#000000")
            .attr("fill", "none")
            .attr("pointer-events", "all")

        const clip = svg.append("clipPath")
            .attr("id", "chart-area")
            .append("rect")
                .attr("width", width-marginRight)
                .attr("height", height-marginBottom-marginTop)
                .attr("transform", `translate(0,${marginTop})`)

        // Append the axes
        const xAxis = svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .attr("pointerEvents","none")
            .call(d3.axisBottom(xScale))
            .call(g => g.select(".domain").remove());

        const yAxis = svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", `translate(${width - marginRight},0)`)
            .attr("pointerEvents","none")
            .call(d3.axisRight(yScale)
                .tickFormat(d3.format("$~f")))
            .call(g => g.select(".domain").remove());

        // Create a group for each day of data, and append two lines to it.
        const g = svg.append("g")
            .attr("clip-path", "url(#chart-area)")
            .attr("stroke-linecap", "round")
            .attr("stroke", "black")
            .attr("pointerEvents","none")
            .selectAll("g")
            .data(data)
            .join("g")
                .attr("transform", d => `translate(${xScale(d.date)},0)`)

        g.append("line")
            .attr("y1", d => yScale(d.low_price))
            .attr("y2", d => yScale(d.high_price))
            .attr("pointerEvents","none")

        g.append("rect")
            .attr("x", -xBandwidth/2)
            .attr("y", d => d.open_price < d.close_price ? yScale(d.close_price) : yScale(d.open_price))
            .attr("width", d => xBandwidth)
            .attr("height", d => d.open_price < d.close_price ? yScale(d.open_price) - yScale(d.close_price) : yScale(d.close_price) - yScale(d.open_price))
            .attr("pointerEvents","none")
            .attr("fill", d => d.open_price > d.close_price ? d3.schemeSet1[0] : d.close_price > d.open_price ? d3.schemeSet1[2] : d3.schemeSet1[8])
            .attr("stroke", "none")


        listeningRect.on("mousemove", (event) => {mouseMove(event, xScale, yScale)})
        // svg.on("mousedown", (event) => {console.log(event)})

        //Zoom and pan behavior setup
        const zoomBehavior = d3.zoom()
            .scaleExtent([1, 20])
            .translateExtent([[0,0], [width, height]])
            .on("zoom", (event) => {zoomFx(event)})

        // attach zoom function
        svg.call(zoomBehavior)

    }}, [data, currentZoomState])

    function zoomFx(){
        //select all candles that need to be rerendered
        const zoomState = zoomTransform(svgRef.current)
        setCurrentZoomState(zoomState)
    }

    function mouseMove(e, xScale, yScale) {
        // pointer returns [x,y] location!
        // gets the dataset linked to current mouse X position
        const mCoord = d3.pointer(e)
        if(mCoord[0] === 0){
            mCoord[0] = 1
        }
        console.log(mCoord[0])
        const x0 = xScale.invert(mCoord[0])
        const bisectDate = d3.bisector(d => d.date).left
        const i = bisectDate(data, x0, 1)
        const d0 = data[i-1]
        const d1 = data[i]
        let d = d0
        if(d1){
            d = x0 - d0.date > d1.date - x0 ? d1 : d0
        }

        // gets the price from the mouse Y position
        const crosshairValueY = yScale.invert(mCoord[1] + marginTop)
        const crosshairValueX = d.date
        
        const formatDate = d3.utcFormat("%Y-%m-%d %I:%M");
        const formatValue = d3.format(".2f");
        const formatChange = ((f) => (y0, y1) => f((y1 - y0) / y0))(d3.format("+.2%"));

        d3.select(ohlcTooltip.current)
            .attr("width", width-marginLeft-marginRight)
            .attr("height", 15)
            .attr("transform", `translate(0,${marginTop-padding})`)
            .html(`Date: ${formatDate(d.date)} Open: ${formatValue(d.open_price)} Close: ${formatValue(d.close_price)} High: ${formatValue(d.high_price)} Low: ${formatValue(d.low_price)} Delta: (${formatChange(d.open_price, d.close_price)})`)
    

        const textXWidth = document.getElementById('crosshair-text-x').getBBox().width
        const textXHeight = document.getElementById('crosshair-text-x').getBBox().height
        const textYWidth = document.getElementById('crosshair-text-y').getBBox().width
        const textYHeight = document.getElementById('crosshair-text-y').getBBox().height

        //Add Crosshair
        d3.select(crosshairX.current)
            .attr("x1", mCoord[0])
            .attr("x2", mCoord[0])
            .attr("y1", marginTop)
            .attr("y2", height - marginBottom)
            .raise()

        d3.select(crosshairY.current)
            .attr("x1", textYWidth - marginLeft)
            .attr("x2", width - marginLeft - marginRight)
            .attr("y1", mCoord[1] + marginTop)
            .attr("y2", mCoord[1] + marginTop)
            .raise()


        d3.select(crosshairTextY.current)
            .attr("transform", `translate(${padding},${mCoord[1] + marginTop + 1})`)
            .html(`$${crosshairValueY.toFixed(2)}`)
        
        d3.select(crosshairTooltipBoxY.current)
            .attr("transform", `translate(${padding},${mCoord[1] + marginTop - 6})`)
            .attr('width', textYWidth)
            .raise()

        d3.select(crosshairTextY.current).raise()


        d3.select(crosshairTextX.current)
            .attr("transform", `translate(${mCoord[0]},${height - marginBottom - textXHeight})`)
            .html(`${formatDate(d.date)}`)
        
        d3.select(crosshairTooltipBoxX.current)
            .attr("x", `${-textXWidth/2}`)
            .attr("transform", `translate(${mCoord[0]},${height - marginBottom - textXHeight})`)
            .attr('width', textXWidth)
            .raise()

        d3.select(crosshairTextX.current).raise()
            
    }

    function discontinuityProviderOffset(){
        const formatDate = d3.utcFormat("%Y-%m-%d");
        let dates = []
        let dateOffsets = undefined
        data.forEach((rec) => {
            let date = formatDate(new Date(rec.datetime))
            if(!dates.includes(date)){
                dates.push(formatDate(new Date(rec.datetime)))
            }
        })

        for (let i = 0; i < dates.length-1; i++) {
            let tempOffset = []
            let date1 = undefined
            let date2 = undefined
            if(dates.length >= 1){
                // console.log(dateOffsets)
                // dateOffsets.push([
                //     new Date(dates[i].split("-")[0], dates[i].split("-")[1], dates[i].split("-")[2], 17, 5, 0, 0),
                //     new Date(dates[i+1].split("-")[0], dates[i+1].split("-")[1], dates[i+1].split("-")[2], 7, 55, 0, 0)
                // ])
                if(!dateOffsets){
                    dateOffsets = [
                        new Date(dates[i].split("-")[0], dates[i].split("-")[1], dates[i].split("-")[2], 17, 5, 0, 0),
                        new Date(dates[i+1].split("-")[0], dates[i+1].split("-")[1], dates[i+1].split("-")[2], 7, 55, 0, 0)
                    ]
                }else{
                    dateOffsets = dateOffsets + [
                        new Date(dates[i].split("-")[0], dates[i].split("-")[1], dates[i].split("-")[2], 17, 5, 0, 0),
                        new Date(dates[i+1].split("-")[0], dates[i+1].split("-")[1], dates[i+1].split("-")[2], 7, 55, 0, 0)
                    ]
                } 
            }
        }
        console.log(dateOffsets)
        return dateOffsets
    }

    return (
        <div className='text-black block m-auto'>
            <svg ref={svgRef} style={{pointerEvents:"none"}}>
                <rect ref={chartListener}></rect>
                <text ref={ohlcTooltip} fontSize={"10px"} style={{pointerEvents:"none"}}></text>
                <line ref={crosshairX} id={"crosshair-x"} style={{stroke:"red", strokeOpacity:0.5, strokeWidth:1, strokeDasharray:2.2, display:"block", pointerEvents:"none"}}></line>
                <line ref={crosshairY} id={"crosshair-y"} style={{stroke:"red", strokeOpacity:0.5, strokeWidth:1, strokeDasharray:2.2, display:"block", pointerEvents:"none"}}></line>
                <rect ref={crosshairTooltipBoxY} style={{position: "absolute", fill:"black", opacity:0.6, height:12, rx:3, strokeOpacity:0.5, strokeWidth:1, stroke:"black", pointerEvents:"none"}}></rect>
                <text ref={crosshairTextY} id={"crosshair-text-y"} dominantBaseline="middle" fontSize={"10px"} style={{position:"absolute", height:12, padding:"5px", fill:"white", opacity:0.8, display:"block", pointerEvents:"none"}}></text>
                <rect ref={crosshairTooltipBoxX} style={{position: "absolute", fill:"black", opacity:0.6, height:12, rx:3, strokeOpacity:0.5, strokeWidth:1, stroke:"black", pointerEvents:"none"}}></rect>
                <text ref={crosshairTextX} id={"crosshair-text-x"} dominantBaseline="hanging" textAnchor='middle' fontSize={"10px"} style={{position:"absolute", height:12, padding:"5px", fill:"white", opacity:0.8, display:"block", pointerEvents:"none"}}></text>
            </svg>
        </div>
    )
}

        // .style("text-anchor", "middle")
        //     .style("dominant-baseline", "auto")