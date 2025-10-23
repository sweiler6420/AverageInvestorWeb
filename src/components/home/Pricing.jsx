import React, { useState, useEffect, useContext } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function Pricing() {
    return (
        <div id='pricing' className='mt-20'>
            <h2 className='font-gothic font-medium text-3xl sm:text-5xl lg:text-6xl text-center my-8 tracking-wide'>
                Pricing
            </h2>
            <div className='flex flex-wrap '>
                <div className='w-full sm:w-1/2 lg:w-1/3 p-2'>
                    <div className='p-10 border border-neutral-700 rounded-xl hover:scale-105'>
                        <p className='font-gothic font-medium text-4xl mb-8'>
                            Basic
                            <span className='bg-gradient-to-r from-accent-secondary/80 to-primary/80 text-transparent bg-clip-text text-2xl mb-4 ml-2'>
                                {" "}
                                (Free Tier)
                            </span>
                        </p>
                        <p className='mb-8'>
                            <span className='font-gothic font-medium text-5xl mt-6 mr-2'>$0</span>
                            <span className='text-neutral-400 tracking-tight'>/Month</span>
                        </p>
                        <ul className=''>
                            <li className='mt-8 flex items-center'>
                                <CheckCircleIcon className="block h-6 w-6 text-green-500" aria-hidden="true"/>
                                <span className='ml-2'>
                                    Basic Stock Charts
                                </span>
                            </li>
                            <li className='mt-8 flex items-center'>
                                <CheckCircleIcon className="block h-6 w-6 text-green-500" aria-hidden="true"/>
                                <span className='ml-2'>
                                    Up to 5 Watchlist Items
                                </span>
                            </li>
                            <li className='mt-8 flex items-center'>
                                <XCircleIcon className="block h-6 w-6 text-red-500" aria-hidden="true"/>
                                <span className='ml-2'>
                                    Advanced Analytics
                                </span>
                            </li>
                            <li className='mt-8 flex items-center'>
                                <XCircleIcon className="block h-6 w-6 text-red-500" aria-hidden="true"/>
                                <span className='ml-2'>
                                    Portfolio Tracking
                                </span>
                            </li>
                        </ul>
                        <a href="/signup" className='font-gothic font-medium inline-flex justify-center items-center text-center w-full h-12 p-5 mt-20 tracking-tight 
                            text-xl border border-accent rounded-md hover:bg-accent hover:underline hover:text-reverse-text'>
                            Get Started
                        </a>
                    </div>
                </div>
                <div className='w-full sm:w-1/2 lg:w-1/3 p-2'>
                    <div className='p-10 h-full border border-neutral-700 rounded-xl hover:scale-105'>
                        <p className='font-gothic font-medium text-4xl mb-8'>
                            Pro
                        </p>
                        <p className='mb-8'>
                            <span className='font-gothic font-medium text-5xl mt-6 mr-2'>$9.99</span>
                            <span className='text-neutral-400 tracking-tight'>/Month</span>
                        </p>
                        <ul className=''>
                            <li className='mt-8 flex items-center'>
                                <CheckCircleIcon className="block h-6 w-6 text-green-500" aria-hidden="true"/>
                                <span className='ml-2'>
                                    Advanced Charts & Indicators
                                </span>
                            </li>
                            <li className='mt-8 flex items-center'>
                                <CheckCircleIcon className="block h-6 w-6 text-green-500" aria-hidden="true"/>
                                <span className='ml-2'>
                                    Unlimited Watchlists
                                </span>
                            </li>
                            <li className='mt-8 flex items-center'>
                                <CheckCircleIcon className="block h-6 w-6 text-green-500" aria-hidden="true"/>
                                <span className='ml-2'>
                                    Portfolio Analytics
                                </span>
                            </li>
                            <li className='mt-8 flex items-center'>
                                <CheckCircleIcon className="block h-6 w-6 text-green-500" aria-hidden="true"/>
                                <span className='ml-2'>
                                    Real-time Alerts
                                </span>
                            </li>
                        </ul>
                        <a href="/signup" className='font-gothic font-medium inline-flex justify-center items-center text-center w-full h-12 p-5 mt-20 tracking-tight 
                            text-xl border border-accent rounded-md hover:bg-accent hover:underline hover:text-reverse-text'>
                            Subscribe
                        </a>
                    </div>
                </div>
                <div className='w-full sm:w-1/2 lg:w-1/3 p-2'>
                    <div className='p-10 border border-neutral-700 rounded-xl hover:scale-105'>
                        <p className='font-gothic font-medium text-4xl mb-8'>
                            Premium
                            <span className='bg-gradient-to-r from-accent-secondary/80 to-primary/80 text-transparent bg-clip-text text-2xl mb-4 ml-2'>
                                {" "}
                                (Recommended)
                            </span>
                        </p>
                        <p className='mb-8'>
                            <span className='font-gothic font-medium text-5xl mt-6 mr-2'>$19.99</span>
                            <span className='text-neutral-400 tracking-tight'>/Month</span>
                        </p>
                        <ul className=''>
                            <li className='mt-8 flex items-center'>
                                <CheckCircleIcon className="block h-6 w-6 text-green-500" aria-hidden="true"/>
                                <span className='ml-2'>
                                    All Pro Features
                                </span>
                            </li>
                            <li className='mt-8 flex items-center'>
                                <CheckCircleIcon className="block h-6 w-6 text-green-500" aria-hidden="true"/>
                                <span className='ml-2'>
                                    AI-Powered Insights
                                </span>
                            </li>
                            <li className='mt-8 flex items-center'>
                                <CheckCircleIcon className="block h-6 w-6 text-green-500" aria-hidden="true"/>
                                <span className='ml-2'>
                                    Custom Alerts & Notifications
                                </span>
                            </li>
                            <li className='mt-8 flex items-center'>
                                <CheckCircleIcon className="block h-6 w-6 text-green-500" aria-hidden="true"/>
                                <span className='ml-2'>
                                    Priority Support
                                </span>
                            </li>
                        </ul>
                        <a href="/signup" className='font-gothic font-medium inline-flex justify-center items-center text-center w-full h-12 p-5 mt-20 tracking-tight 
                            text-xl border border-accent rounded-md hover:bg-accent hover:underline hover:text-reverse-text'>
                            Subscribe
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
