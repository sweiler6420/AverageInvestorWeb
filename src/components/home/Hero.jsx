import React, { useState, useEffect, useContext } from 'react'

export default function Hero() {
    return (
        <div id='top' className='flex flex-col items-center mt-6 lg:mt-20'>
            <h1 className="text-4xl font-gothic font-xl mb-5 md:mb-20">
                <span>
                    <span className="text-accent-secondary text-5xl">Average</span>
                    <span className="text-primary text-5xl">Investor </span>
                    makes investing
                </span>
                <span className=''>
                    {' '}
                    <span className="text-accent text-5xl">Simple</span>
                    <span className="text-primary text-5xl"> & Smart</span>
                </span>
            </h1>
            <p className="font-gothic font-xl text-lg text-center max-w-4xl leading-8 my-10">
                At AverageInvestor, we specialize in democratizing investment research with our cutting-edge 
                stock analysis platform. Designed for individual investors, our platform simplifies the process 
                of stock research and analysis, ensuring you have all the information you need to make 
                informed investment decisions. This eliminates the complexity of traditional financial analysis 
                tools. Subscribers can instantly access detailed stock data, charts, and insights simply by 
                searching for any stock symbol. Plus, track your trades with our AI-powered journaling system 
                for in-depth performance reviews and analysis.
            </p>
            <div className='flex justify-center my-20'>
                <a className='font-gothic font-demi text-reverse-text py-3 px-4 mx-3 border rounded-md bg-gradient-to-r from-accent-secondary/80 to-primary/80 hover:scale-105 hover:underline' href='/signup'>
                    Start Researching Today
                </a>        
                <a className='font-gothic font-demi py-3 px-4 mx-3 rounded-md border hover:scale-105 hover:underline' href='#features'>
                    Learn More
                </a>          
            </div>
        </div> 
    )
}