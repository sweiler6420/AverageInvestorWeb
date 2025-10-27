import React, { useState, useEffect, useContext } from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import InteractiveDesktop from './InteractiveDesktop'

export default function Workflow() {
    return (
        <div id='workflow' className='mt-20'>
            <h2 className='font-gothic font-medium text-3xl sm:text-5xl lg:text-6xl text-center mt-6 tracking-wide'>
                Smart investing through
                <span className="text-brand-600 dark:text-brand-400 font-xl text-5xl">
                    {" "}
                    Technology
                </span>
            </h2>
            <div className='flex flex-wrap justify-center lg:items-stretch'> 
                <div className='p-2 w-full lg:w-1/2'>
                    <div className='bg-gradient-to-r from-brand-500/10 to-brand-700/10 dark:from-brand-400/10 dark:to-brand-600/10 rounded-lg p-4 relative overflow-hidden h-96 lg:h-full'>
                        <InteractiveDesktop />
                    </div>
                </div>
                <div className='pt-12 w-full lg:w-1/2'>
                    <div className='flex mb-12'>
                        <div className='text-green-500 mx-6 bg-neutral-100 dark:bg-neutral-900 h-10 w-10 p-2 justify-center items-center rounded-full'>
                            <CheckCircleIcon  className="block h-6 w-6" aria-hidden="true"/>
                        </div>
                        <div>
                            <h5 className='font-gothic font-medium mt-1 mb-2 text-xl'>
                                Streamlined Research
                            </h5>
                            <p className='font-gothic font-medium text-md p-2 mb-10 text-neutral-600 dark:text-neutral-400'>
                                AverageInvestor eliminates the complexity of traditional financial analysis tools. 
                                By using our intuitive platform, investors can quickly access comprehensive stock 
                                data and insights, saving valuable time and reducing confusion.
                            </p>
                        </div>
                    </div>
                    <div className='flex mb-12'>
                        <div className='text-green-500 mx-6 bg-neutral-100 dark:bg-neutral-900 h-10 w-10 p-2 justify-center items-center rounded-full'>
                            <CheckCircleIcon  className="block h-6 w-6" aria-hidden="true"/>
                        </div>
                        <div>
                            <h5 className='font-gothic font-medium mt-1 mb-2 text-xl'>
                                Instant Market Access
                            </h5>
                            <p className='font-gothic font-medium text-md p-2 mb-10 text-neutral-600 dark:text-neutral-400'>
                                With AverageInvestor, investors have immediate access to real-time market data 
                                at their fingertips. This on-demand availability allows traders to respond to 
                                market movements faster, making them more effective in their investment decisions.
                            </p>
                        </div>
                    </div>
                    <div className='flex mb-12'>
                        <div className='text-green-500 mx-6 bg-neutral-100 dark:bg-neutral-900 h-10 w-10 p-2 justify-center items-center rounded-full'>
                            <CheckCircleIcon  className="block h-6 w-6" aria-hidden="true"/>
                        </div>
                        <div>
                            <h5 className='font-gothic font-medium mt-1 mb-2 text-xl'>
                                Multi-Window Research Environment
                            </h5>
                            <p className='font-gothic font-medium text-md p-2 mb-10 text-neutral-600 dark:text-neutral-400'>
                                Experience desktop-like functionality with multiple research windows. Compare stocks 
                                side-by-side, keep charts open while analyzing fundamentals, and organize your workspace 
                                like a professional trading platform - all in your browser.
                            </p>
                        </div>
                    </div>
                    <div className='flex mb-12'>
                        <div className='text-green-500 mx-6 bg-neutral-100 dark:bg-neutral-900 h-10 w-10 p-2 justify-center items-center rounded-full'>
                            <CheckCircleIcon  className="block h-6 w-6" aria-hidden="true"/>
                        </div>
                        <div>
                            <h5 className='font-gothic font-medium mt-1 mb-2 text-xl'>
                                AI-Powered Trade Journaling
                            </h5>
                            <p className='font-gothic font-medium text-md p-2 mb-10 text-neutral-600 dark:text-neutral-400'>
                                Track your trades with intelligent analysis and performance reviews. Our AI system 
                                helps you learn from your investment patterns, identify strengths and weaknesses, 
                                and continuously improve your research and decision-making process.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
