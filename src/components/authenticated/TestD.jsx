import { React, useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'

export default function TestD({ticker}) {

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
        console.log(data)

        // Declare the chart dimensions and margins.
        const width = 928;
        const height = 600;
        const marginTop = 20;
        const marginRight = 30;
        const marginBottom = 30;
        const marginLeft = 40;

        // Declare the start and end date - 1
        const start_date = data.at(0).date
        const end_date = (data.at(-1).date)

        console.log([start_date, end_date])


        // Create xScale ScaleTime
            //domain: array of start date and end date
            //range: px start and px end locations
        const xScale = d3.scaleTime()
            .domain([start_date, end_date])
            .range([marginLeft, width - marginRight])

        // Create yScale scaleLog
            //domain: upper and lower limit of the data to scale on the y [lowest price possible, highest possible]
            //rangeRound: approximation of the height range to map to the domain values
        const yScale = d3.scaleLog()
            .domain([d3.min(data, d => d.low_price), d3.max(data, d => d.high_price)])
            .rangeRound([height - marginBottom, marginTop]);

        // Create the SVG container.
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .style('background', '#d3d3d3')
            .style('margin-top', '50')
            .style('overflow', 'visible')

        // Append the axes
        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(xScale)
                .tickValues(d3.utcMonday
                    .every(width > 720 ? 1 : 2)
                    .range(data.at(0).date, data.at(-1).date))
                .tickFormat(d3.utcFormat("%-m/%-d")))
            .call(g => g.select(".domain").remove());

        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(yScale)
                .tickFormat(d3.format("$~f"))
                .tickValues(d3.scaleLinear().domain(yScale.domain()).ticks()))
            .call(g => g.selectAll(".tick line").clone()
                .attr("stroke-opacity", 0.2)
                .attr("x2", width - marginLeft - marginRight))
            .call(g => g.select(".domain").remove());

        // Create a group for each day of data, and append two lines to it.
        const g = svg.append("g")
            .attr("stroke-linecap", "round")
            .attr("stroke", "black")
            .selectAll("g")
            .data(data)
            .join("g")
                .attr("transform", d => `translate(${xScale(d.date)},0)`)

        g.append("line")
            .attr("y1", d => yScale(d.low_price))
            .attr("y2", d => yScale(d.high_price));


        g.append("line")
            .attr("y1", d => yScale(d.open_price))
            .attr("y2", d => yScale(d.close_price))
            .attr("stroke-width", 2)
            .attr("stroke", d => d.open_price > d.close_price ? d3.schemeSet1[0]
                : d.close_price > d.open_price ? d3.schemeSet1[2]
                : d3.schemeSet1[8]);

        const listeningRect = d3.select(chartListener.current)
            .attr("width", width)
            .attr("height", height)

        listeningRect.on("mousemove", (event) => {mouseMove(event, xScale)})
        // svg.on("mousedown", (event) => {console.log(event)})

    }}, [data])

    function mouseMove(e, xScale) {
        // pointer returns [x,y] location!
        const xCoord = d3.pointer(e)
        const x0 = xScale.invert(xCoord[0])
        const bisectDate = d3.bisector(d => d.date).left
        const i = bisectDate(data, x0, 1)
        const d0 = data[i-1]
        const d1 = data[i]
        const d = x0 - d0.date > d1.date - x0 ? d1 : d0

        const formatDate = d3.utcFormat("%B %-d, %Y");
        const formatValue = d3.format(".2f");
        const formatChange = ((f) => (y0, y1) => f((y1 - y0) / y0))(d3.format("+.2%"));

        d3.select(ohlcTooltip.current)
            .html(`Date: ${formatDate(d.date)} Open: ${formatValue(d.open_price)} Close: ${formatValue(d.close_price)} High: ${formatValue(d.high_price)} Low: ${formatValue(d.low_price)} Delta: (${formatChange(d.open_price, d.close_price)})`)

    }

    return (
        <div className='text-black block m-auto'>
            <svg ref={svgRef}>
                <rect ref={chartListener} width='100%' height='100%' fillOpacity={0}></rect>
                <text ref={ohlcTooltip} width='100%' style={{fontSize:'12px'}}></text>
            </svg>
        </div>
    )
}
