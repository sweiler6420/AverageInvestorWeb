import { React, useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'

export default function Test({data}) {

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
        // setting up svg
        const w = 400
        const h = 100
        const svg = d3.select(svgRef.current)
            .attr('width', w)
            .attr('height', h)
            .style('background', '#d3d3d3')
            .style('margin-top', '50')
            .style('overflow', 'visible')

        // setup the scaling
        const xScale = d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([0, w])
        
        const yScale = d3.scaleLinear()
            .domain([0, h])
            .range([h, 0])

        const generateScaledLine = d3.line()
            .x((d, i) => xScale(i))
            .y(yScale)
            .curve(d3.curveCardinal)

        // setup the axes
        const xAxis = d3.axisBottom(xScale)
            .ticks(data.length)
            .tickFormat(i => i + 1)

        const yAxis = d3.axisLeft(yScale)
            .ticks(5)
        
        svg.append('g')
            .call(xAxis)    
            .attr('transform', `translate(0, ${h})`)

        svg.append('g')
            .call(yAxis)


        // setup the data for the svg
        svg.selectAll('.line')
            .data([data])
            .join('path')   
                .attr('d', d => generateScaledLine(d))
                .attr('fill', 'none')
                .attr('stroke', 'black')
    }, [data])

    return (
        <div className='text-black block m-auto'>
            <svg ref={svgRef}></svg>
        </div>
    )
}
