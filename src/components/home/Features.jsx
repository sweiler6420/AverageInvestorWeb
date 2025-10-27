import React, { useState, useEffect, useContext } from 'react'
import { ChartBarIcon, ArrowTrendingUpIcon, EyeIcon, ClockIcon, UserGroupIcon, CurrencyDollarIcon, Squares2X2Icon } from '@heroicons/react/24/outline'

export default function Features() {
    return (
        <div id='features' className='relative mt-20 border-b border-neutral-200 dark:border-neutral-800'>
            <div className='text-center'>
                <span className='font-gothic bg-neutral-100 dark:bg-neutral-900 text-brand-700 dark:text-brand-400 rounded-full h-6 text-sm font-medium px-2 py-1 uppercase'>
                    Features
                </span>
                <h2 className='font-gothic font-medium text-3xl sm:text-5xl lg:text-6xl mt-10 lg:mt-20 tracking-wide'>
                    <span className="text-brand-600 dark:text-brand-400 font-xl text-5xl">
                            Research {' '}
                    </span>
                    & Analysis Tools
                </h2>
            </div>
            <div className='flex flex-wrap mt-10 lg:mt-20'>
                <div className='w-full sm:1/2 lg:w-1/3'>
                    <div className='flex'>
                        <div className='flex mx-6 h-10 w-10 p-2 bg-neutral-100 dark:bg-neutral-900 text-brand-600 dark:text-brand-400 justify-center items-center rounded-full'>
                            <ChartBarIcon className="block h-6 w-6" aria-hidden="true"/>
                        </div>
                        <div className=''>
                            <h5 className='font-gothic font-medium mt-1 mb-6 text-xl'>
                                Advanced Charting
                            </h5>
                            <p className='font-gothic font-medium text-md p-2 mb-20 text-neutral-600 dark:text-neutral-400'>
                                Access professional-grade candlestick charts and technical indicators to analyze 
                                stock price movements and identify research opportunities with precision.
                            </p>
                        </div>
                    </div>
                </div>
                <div className='w-full sm:1/2 lg:w-1/3'>
                    <div className='flex'>
                        <div className='flex mx-6 h-10 w-10 p-2 bg-neutral-100 dark:bg-neutral-900 text-brand-700 dark:text-brand-400 justify-center items-center rounded-full'>
                            <ArrowTrendingUpIcon className="block h-6 w-6" aria-hidden="true"/>
                        </div>
                        <div className=''>
                            <h5 className='font-gothic font-medium mt-1 mb-6 text-xl'>
                                Real-time Data
                            </h5>
                            <p className='font-gothic font-medium text-md p-2 mb-20 text-neutral-600 dark:text-neutral-400'>
                                Get up-to-the-minute stock prices, market data, and financial metrics to make 
                                informed investment decisions based on the latest market information.
                            </p>
                        </div>
                    </div>
                </div>
                <div className='w-full sm:1/2 lg:w-1/3'>
                    <div className='flex'>
                        <div className='flex mx-6 h-10 w-10 p-2 bg-neutral-100 dark:bg-neutral-900 text-brand-600 dark:text-brand-400 justify-center items-center rounded-full'>
                            <EyeIcon className="block h-6 w-6" aria-hidden="true"/>
                        </div>
                        <div className=''>
                            <h5 className='font-gothic font-medium mt-1 mb-6 text-xl'>
                                Watchlist Management
                            </h5>
                            <p className='font-gothic font-medium text-md p-2 mb-20 text-neutral-600 dark:text-neutral-400'>
                                Create and manage personalized watchlists to track your favorite stocks and 
                                monitor their performance without cluttering your investment strategy.
                            </p>
                        </div>
                    </div>
                </div>
                <div className='w-full sm:1/2 lg:w-1/3'>
                    <div className='flex'>
                        <div className='flex mx-6 h-10 w-10 p-2 bg-neutral-100 dark:bg-neutral-900 text-brand-700 dark:text-brand-400 justify-center items-center rounded-full'>
                            <Squares2X2Icon className="block h-6 w-6" aria-hidden="true"/>
                        </div>
                        <div className=''>
                            <h5 className='font-gothic font-medium mt-1 mb-6 text-xl'>
                                Multi-Window Desktop
                            </h5>
                            <p className='font-gothic font-medium text-md p-2 mb-20 text-neutral-600 dark:text-neutral-400'>
                                Organize multiple research windows like a desktop environment. Compare stocks 
                                side-by-side, keep charts open while analyzing fundamentals - just like professional trading platforms.
                            </p>
                        </div>
                    </div>
                </div>
                <div className='w-full sm:1/2 lg:w-1/3'>
                    <div className='flex'>
                        <div className='flex mx-6 h-10 w-10 p-2 bg-neutral-100 dark:bg-neutral-900 text-brand-600 dark:text-brand-400 justify-center items-center rounded-full'>
                            <UserGroupIcon className="block h-6 w-6" aria-hidden="true"/>
                        </div>
                        <div className=''>
                            <h5 className='font-gothic font-medium mt-1 mb-6 text-xl'>
                                Market Insights
                            </h5>
                            <p className='font-gothic font-medium text-md p-2 mb-20 text-neutral-600 dark:text-neutral-400'>
                                Access anonymous market analytics and research trends. See what stocks are being 
                                researched most, popular analysis patterns, and market sentiment indicators.
                            </p>
                        </div>
                    </div>
                </div>
                <div className='w-full sm:1/2 lg:w-1/3'>
                    <div className='flex'>
                        <div className='flex mx-6 h-10 w-10 p-2 bg-neutral-100 dark:bg-neutral-900 text-brand-700 dark:text-brand-400 justify-center items-center rounded-full'>
                            <CurrencyDollarIcon className="block h-6 w-6" aria-hidden="true"/>
                        </div>
                        <div className=''>
                            <h5 className='font-gothic font-medium mt-1 mb-6 text-xl'>
                                Trade Journaling
                            </h5>
                            <p className='font-gothic font-medium text-md p-2 mb-20 text-neutral-600 dark:text-neutral-400'>
                                Track your trades with AI-powered analysis and in-depth performance reviews. 
                                Journal your investment decisions and learn from your trading patterns.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
