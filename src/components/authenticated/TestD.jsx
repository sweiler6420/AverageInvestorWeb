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
        end_date.setDate(end_date.getDate() + 1);

        // Create x scaleBand 
            //domain: an array of dates between start and end
            //range: pixel dimensions of the start of the data to the end
            //padding: extra padding between bands!
        const x = d3.scaleBand()
            .domain(d3.utcDay.range(start_date, end_date))
            .range([marginLeft, width - marginRight])
            .padding(0.2);

        // FILTER WEEKENDS IF NEEDED
        // console.log(d3.utcDay.range(start_date, end_date).filter(d => d.getUTCDay() !== 0 && d.getUTCDay() !== 1))

        // Create y scaleLog
            //domain: upper and lower limit of the data to scale on the y [lowest price possible, highest possible]
            //rangeRound: approximation of the height range to map to the domain values
        const y = d3.scaleLog()
            .domain([d3.min(data, d => d.low_price), d3.max(data, d => d.high_price)])
            .rangeRound([height - marginBottom, marginTop]);

        // Create the SVG container.
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .style('background', '#d3d3d3')
            .style('margin-top', '50')
            .style('overflow', 'visible')

        // Append the axes.
        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(x)
                .tickValues(d3.utcMonday
                    .every(width > 720 ? 1 : 2)
                    .range(data.at(0).date, data.at(-1).date))
                .tickFormat(d3.utcFormat("%-m/%-d")))
            .call(g => g.select(".domain").remove());

        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y)
                .tickFormat(d3.format("$~f"))
                .tickValues(d3.scaleLinear().domain(y.domain()).ticks()))
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
                .attr("transform", d => `translate(${x(d.date)},0)`)

        console.log(data.at(0).date)

        g.append("line")
            .attr("y1", d => y(d.low_price))
            .attr("y2", d => y(d.high_price));

        g.append("line")
            .attr("y1", d => y(d.open_price))
            .attr("y2", d => y(d.close_price))
            .attr("stroke-width", x.bandwidth())
            .attr("stroke", d => d.open_price > d.close_price ? d3.schemeSet1[0]
                : d.close_price > d.open_price ? d3.schemeSet1[2]
                : d3.schemeSet1[8]);

        // Append a title (tooltip).
        const formatDate = d3.utcFormat("%B %-d, %Y");
        const formatValue = d3.format(".2f");
        const formatChange = ((f) => (y0, y1) => f((y1 - y0) / y0))(d3.format("+.2%"));

        g.append("title")
            .text(d => `${formatDate(d.date)}
            Open: ${formatValue(d.open_price)}
            Close: ${formatValue(d.close_price)} (${formatChange(d.open_price, d.close_price)})
            Low: ${formatValue(d.low_price)}
            High: ${formatValue(d.high_price)}`);
    }}, [data])

    return (
        <div className='text-black block m-auto'>
            <svg ref={svgRef}></svg>
        </div>
    )
}
