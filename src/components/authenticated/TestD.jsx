import { React, useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { zoomTransform } from 'd3'

export default function TestD({ticker, width, height}) {

    const [ data, setData ] = useState()

    // [close_price: 305.18
    // date: "2023-10-04"
    // high_price: 305.31
    // low_price: 305.05
    // open_price: 305.31
    // stock_id: "f4ba1944-a269-499c-bc2e-b99c51619de1"
    // time: "17:00:00"
    // volume: 8115]

    const svgRef = useRef()
    const chartListener = useRef()
    const ohlcTooltip = useRef()
    const crosshairX = useRef()
    const crosshairY = useRef()
    const crosshairTextY = useRef()
    const crosshairTooltipBoxY = useRef()

    const padding = 2;

    // SVG margin variables
    const marginTop = 15;
    const marginBottom = 30;
    const marginRight = 40;
    const marginLeft = 40;

    const [ currentZoomState, setCurrentZoomState ] = useState()

    useEffect(() => {
        if(ticker) {
            const formatDate = d3.utcFormat("%B %-d, %Y")
            ticker.forEach(function(d) {
                d.date = new Date(d.date)
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

        // Create xScale ScaleTime
            //domain: array of start date and end date
            //range: px start and px end locations
        let xScale = d3.scaleTime()
            .domain([start_date, end_date])
            .range([0, width-marginRight])

        if (currentZoomState) {
            xScale = currentZoomState.rescaleX(xScale)
        }

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
            .style('overflow', 'visible')

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


        g.append("line")
            .attr("y1", d => yScale(d.open_price))
            .attr("y2", d => yScale(d.close_price))
            .attr("pointerEvents","none")
            .attr("stroke-width", 2)
            .attr("stroke", d => d.open_price > d.close_price ? d3.schemeSet1[0]
                : d.close_price > d.open_price ? d3.schemeSet1[2]
                : d3.schemeSet1[8]);


        const crosshairTooltipX = svg.append("g")
            .attr("class", "crosshair-tooltip-x")
            .attr("stroke", "black")
            .attr("pointerEvents","none")

        crosshairTooltipX.append("rect")
            .attr("stroke","black")
            .attr("y","-12")
            .attr("fill", "black")
            .attr("opacity", "0.6")
            .attr("rx", "3")
            .attr("width","0px")
            .attr("height","12px")
            .attr("pointerEvents", "none")

        crosshairTooltipX.append("text")
            .attr("id", "crosshair-tooltip-text-x")
            .attr("y","-3")
            .style("text-anchor", "middle")
            .style("dominant-baseline", "auto")
            .style("font-size", "10px")
            .attr("fill", "white")
            .attr("opacity", "0.8")
            .attr("stroke", "none")
            .attr("pointerEvents", "none")

        listeningRect.on("mousemove", (event) => {mouseMove(event, xScale, yScale)})
        // svg.on("mousedown", (event) => {console.log(event)})

        //Zoom and pan behavior setup
        const zoomBehavior = d3.zoom()
            .scaleExtent([1, 10])
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
        
        const formatDate = d3.utcFormat("%B %-d, %Y");
        const formatValue = d3.format(".2f");
        const formatChange = ((f) => (y0, y1) => f((y1 - y0) / y0))(d3.format("+.2%"));

        d3.select(ohlcTooltip.current)
            .attr("width", width-marginLeft-marginRight)
            .attr("height", 15)
            .attr("transform", `translate(0,${marginTop-padding})`)
            .html(`Date: ${formatDate(d.date)} Open: ${formatValue(d.open_price)} Close: ${formatValue(d.close_price)} High: ${formatValue(d.high_price)} Low: ${formatValue(d.low_price)} Delta: (${formatChange(d.open_price, d.close_price)})`)
    

        const textXWidth = document.getElementById('crosshair-tooltip-text-x').getBBox().width
        const textYWidth = document.getElementById('crosshair-text-y').getBBox().width
        // const textXHeight = document.getElementById('crosshair-text-x').getBBox().height

        //Add Crosshair
        d3.select(crosshairX.current)
            .attr("x1", mCoord[0])
            .attr("x2", mCoord[0])
            .attr("y1", marginTop)
            .attr("y2", height - marginBottom)
            .raise()

        d3.select(crosshairY.current)
            .attr("x1", textYWidth)
            .attr("x2", width - marginLeft)
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

        d3.select(svgRef.current).select(".crosshair-tooltip-x")
            .attr("transform", `translate(${mCoord[0]},${height})`)

        d3.select(svgRef.current).select(".crosshair-tooltip-x").select("rect")
            .attr('width', textXWidth)
            .attr("x", `${-textXWidth/2}`)

        d3.select(svgRef.current).select(".crosshair-tooltip-x").select("text")
            .html(`${formatDate(d.date)}`)
            
    }

    return (
        <div className='text-black block m-auto'>
            <svg ref={svgRef} style={{pointerEvents:"none"}}>
                <rect ref={chartListener}></rect>
                <text ref={ohlcTooltip} fontSize={"10px"} style={{pointerEvents:"none"}}></text>
                <line ref={crosshairX} id={"crosshair-x"} style={{stroke:"red", strokeOpacity:0.5, strokeWidth:1, strokeDasharray:2.2, display:"block", pointerEvents:"none"}}></line>
                <line ref={crosshairY} id={"crosshair-y"} style={{stroke:"red", strokeOpacity:0.5, strokeWidth:1, strokeDasharray:2.2, display:"block", pointerEvents:"none"}}></line>
                <rect ref={crosshairTooltipBoxY} style={{position: "absolute", fill:"black", opacity:0.6, height:12, rx:3, strokeOpacity:0.5, strokeWidth:1, stroke:"black", pointerEvents:"none"}}></rect>
                <text ref={crosshairTextY} id={"crosshair-text-y"} dominant-baseline="middle" fontSize={"10px"} style={{position:"absolute", height:12, padding:"5px", fill:"white", opacity:0.8, display:"block", pointerEvents:"none"}}></text>
            </svg>
        </div>
    )
}
