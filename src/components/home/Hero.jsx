import React, { useState, useEffect, useContext } from 'react'

export default function Hero() {
    return (
        <div id='top' className='flex flex-col items-center mt-6 lg:mt-20'>
            <h1 className="text-4xl font-gothic font-xl mb-5 md:mb-20">
                <span>
                    <span className="text-neutral-900 dark:text-neutral-100 text-5xl">Research </span>
                    <span className="text-brand-600 dark:text-brand-400 text-5xl">Clearer. </span>
                </span>
                <span className=''>
                    {' '}
                    <span className="text-neutral-900 dark:text-neutral-100 text-5xl">Invest</span>
                    <span className="text-brand-600 dark:text-brand-400 text-5xl"> Sharper.</span>
                </span>
            </h1>
            <p className="font-gothic font-xl text-lg text-center max-w-4xl leading-8 my-10">
                At Anvex, we specialize in democratizing investment research with our cutting-edge 
                stock analysis platform. Designed for individual investors, our platform simplifies the process 
                of stock research and analysis, ensuring you have all the information you need to make 
                informed investment decisions. This eliminates the complexity of traditional financial analysis 
                tools. Subscribers can instantly access detailed stock data, charts, and insights simply by 
                searching for any stock symbol. Plus, track your trades with our AI-powered journaling system 
                for in-depth performance reviews and analysis.
            </p>
            <div className='flex justify-center my-20'>
                <a className='font-gothic font-demi text-white py-3 px-4 mx-3 border rounded-md bg-gradient-to-r from-brand-500 to-brand-700 dark:from-brand-400 dark:to-brand-600 hover:opacity-90 hover:underline' href='/signup'>
                    Start Researching Today
                </a>        
                <a className='font-gothic font-demi py-3 px-4 mx-3 rounded-md border border-neutral-300 dark:border-neutral-700 hover:scale-105 hover:underline' href='#features'>
                    Learn More
                </a>          
            </div>
        </div> 
    )
}