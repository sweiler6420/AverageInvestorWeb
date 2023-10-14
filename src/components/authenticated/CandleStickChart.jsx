import { React, useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { scaleTime, zoomTransform } from 'd3'
import { scaleDiscontinuous, discontinuityRange } from '@d3fc/d3fc-discontinuous-scale'
import { Underline } from 'react-feather'

export default function CandleStickChart({ticker, width, height}) {

    const [ data, setData ] = useState()
    const [ interval, setInterval ] = useState(5)
    const [ dates, setDates ] = useState()
    const [ rendered, setRendered ] = useState()

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

    useEffect(() => {
        let temp = []
        if(ticker) {
            ticker.forEach(function(d) {
                temp.push(new Date(d.datetime))
                d.date = new Date(d.datetime)
                d.close_price = +d.close_price
                d.open_price = +d.open_price
                d.low_price = +d.low_price
                d.high_price = +d.high_price
            })
            setData(ticker)
            setDates(temp)
        }

    }, [ticker])

    useEffect(() => {if(data && dates) {
        // Declare the start and end date - 1
        const start_date = data.at(0)
        const end_date = (data.at(-1))

        // Create TimeBand to calculate the bandwidth for us!
        const xScale = d3.scaleBand()
            .domain(dates)
            .range([marginLeft, width-marginRight])
            .paddingInner(0.3)

        if (currentZoomState) {
            // console.log(xScale.range())
            xScale.range([marginLeft, width - marginRight].map(d => currentZoomState.applyX(d)))
            // console.log(xScale.range())
            console.log(Math.round(20 / currentZoomState.k))
            //Going to have to create a subset of domain based on where the range gets changed too
            //this will be the basis for our xaxis rendering
            // console.log(xScale.domain())
        }

        let xScalewidth = xScale.bandwidth()
        

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
        const xAxis =  svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(xScale)
            .tickValues(xScale.domain().filter((d,i) => { return !(i%(currentZoomState ? Math.round(30 / currentZoomState.k) : 30))}))
            .tickFormat(d3.utcFormat("%-H:%-M")))
            .call(g => g.select(".domain").remove());

            // .tickSize(-height) to add grid

        const yAxis = svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", `translate(${width - marginRight},0)`)
            .attr("pointerEvents","none")
            .call(d3.axisRight(yScale)
                .tickFormat(d3.format("$~f")))
            .call(g => g.select(".domain").remove());

        // Create a group for each day of data, and append two lines to it.
        const g = svg.append("g")
            .attr("class", "candlestick")
            .attr("clip-path", "url(#chart-area)")
            .attr("stroke-linecap", "round")
            .attr("stroke", "black")
            .attr("pointerEvents","none")
            .selectAll("g")
            .data(data)
            .join("g")
                .attr("transform", d => `translate(${xScale(d.date) + xScalewidth/2},0)`)

        g.append("line")
            .attr("y1", d => yScale(d.low_price))
            .attr("y2", d => yScale(d.high_price))
            .attr("pointerEvents","none")

        g.append("rect")
            .attr("x", -xScalewidth/2)
            .attr("y", d => d.open_price < d.close_price ? yScale(d.close_price) : yScale(d.open_price))
            .attr("width", d => xScalewidth)
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

    }}, [data, dates, currentZoomState])

    function zoomFx(event){
        //select all candles that need to be rerendered
        const zoomState = zoomTransform(svgRef.current)
        setCurrentZoomState(zoomState)
    }

    // function xAxisGenerator() { xScale.domain().filter((d,i) => { return !(i%(currentZoomState ? Math.round(30 / currentZoomState.k) : 30))})}

    function mouseMove(e, xScale, yScale) {
        // pointer returns [x,y] location!
        // gets the dataset linked to current mouse X position
        const mCoord = d3.pointer(e)
        // const x0 = xScale.invert(mCoord[0])
        // const bisectDate = d3.bisector(d => d.date).left
        // const i = bisectDate(data, x0, 1)
        // const d0 = data[i-1]
        // const d1 = data[i]
        // let d = d0
        // if(d1){
        //     d = x0 - d0.date > d1.date - x0 ? d1 : d0
        // }
        let d = data[1]

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
        let dateOffsets = []
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
                dateOffsets.push([
                    new Date(dates[i].split("-")[0], dates[i].split("-")[1], dates[i].split("-")[2], 17, 5, 0, 0),
                    new Date(dates[i+1].split("-")[0], dates[i+1].split("-")[1], dates[i+1].split("-")[2], 7, 55, 0, 0)
                ])
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