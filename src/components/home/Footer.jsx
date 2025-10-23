import React, { useState, useEffect, useContext } from 'react'

export default function Footer() {
    return (
        <footer className='mt-20 border-t py-10 border-neutral-700'>
            <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className=''>
                    <h3 className='font-gothic font-demi text-md font-semibold mb-4'>
                        Resources
                    </h3>
                    <ul className='space-y-2'>
                        <li className=''>
                            <a href="#contact" className='font-gothic font-medium text-neutral-500 hover:text-black'>
                                Contact Us
                            </a>
                        </li>
                        <li className=''>
                            <a href="#" className='font-gothic font-medium text-neutral-500 hover:text-black'>
                                Investment Guides
                            </a>
                        </li>
                    </ul>
                </div>
                <div className=''>
                    <h3 className='font-gothic font-demi text-md font-semibold mb-4'>
                        Platform
                    </h3>
                    <ul className='space-y-2'>
                        <li className=''>
                            <a href="#features" className='font-gothic font-medium text-neutral-500 hover:text-black'>
                                Features
                            </a>
                        </li>
                        <li className=''>
                            <a href="#workflow" className='font-gothic font-medium text-neutral-500 hover:text-black'>
                                How It Works
                            </a>
                        </li>
                        <li className=''>
                            <a href="#pricing" className='font-gothic font-medium text-neutral-500 hover:text-black'>
                                Pricing
                            </a>
                        </li>
                    </ul>
                </div>
                <div className=''>
                    <h3 className='font-gothic font-demi text-md font-semibold mb-4'>
                        Community
                    </h3>
                    <ul className='space-y-2'>
                        <li className=''>
                            <a href="#" className='font-gothic font-medium text-neutral-500 hover:text-black'>
                                Investment Forums
                            </a>
                        </li>
                        <li className=''>
                            <a href="#" className='font-gothic font-medium text-neutral-500 hover:text-black'>
                                Educational Resources
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    )
}
