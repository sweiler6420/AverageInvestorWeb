import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { getData } from 'utils'

export default function StockChart() {
    const svgRef = useRef()
    const [data, setData] = useState(null)

    useEffect(() => {
        let isMounted = true
        getData().then(d => {
            if (isMounted) setData(d)
        })
        return () => { isMounted = false }
    }, [])

    useEffect(() => {
        if (!data || !svgRef.current) return

        const margin = { top: 16, right: 24, bottom: 32, left: 48 }
        const width = 640
        const height = 320
        const innerWidth = width - margin.left - margin.right
        const innerHeight = height - margin.top - margin.bottom

        const svg = d3.select(svgRef.current)
        svg.selectAll('*').remove()

        svg
            .attr('width', width)
            .attr('height', height)

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, innerWidth])

        const y = d3.scaleLinear()
            .domain(d3.extent(data, d => d.close))
            .nice()
            .range([innerHeight, 0])

        const xAxis = d3.axisBottom(x)
        const yAxis = d3.axisLeft(y).ticks(6)

        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(xAxis)

        g.append('g')
            .call(yAxis)

        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.close))
            .curve(d3.curveMonotoneX)

        g.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', '#0ea5e9')
            .attr('stroke-width', 2)
            .attr('d', line)

    }, [data])

    return (
        <div className='text-black block m-auto'>
            <svg ref={svgRef}></svg>
        </div>
    )
}



