import React, { useState, useEffect, useContext } from 'react'

export default function Contact() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    // const isDisabled = !name || !email || !message;
    const isDisabled = true

    function handleSubmit(e){
        e.preventDefault();
        // Handle form submission logic here
      };

    return (
        <div id='contact' className='mt-20'>
            <h2 className='font-gothic font-medium text-3xl sm:text-5xl lg:text-6xl text-center my-8 tracking-wide'>
                Contact
                <span className="font-xl text-brand-600 dark:text-brand-400 text-5xl"> Anvex</span>
                <span className="font-xl text-neutral-800 dark:text-neutral-200 text-5xl"> </span>
            </h2>
            <div className='flex flex-col items-center'>
                <div className='w-full sm:w-3/4 lg:w-1/2 p-2'>
                    <div className='p-10 border border-neutral-200 dark:border-neutral-700 rounded-xl'>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row">
                        <div className="flex flex-col w-full sm:w-1/2 mr-4">
                            <label className="font-gothic font-medium mb-2" htmlFor="name">
                                Name
                            </label>
                            <input type="text" id="name" className="border border-neutral-300 dark:border-neutral-700 rounded-xl p-2 mb-4" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required/>
                            <label className="font-gothic font-medium mb-2" htmlFor="email">
                                Email
                            </label>
                            <input type="email" id="email" className="border border-neutral-300 dark:border-neutral-700 rounded-xl p-2 mb-4" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="flex flex-col w-full sm:w-1/2">
                        <label className="font-gothic font-medium mb-2" htmlFor="message">
                            Message
                        </label>
                        <textarea id="message" className="border border-neutral-300 dark:border-neutral-700 rounded-xl p-2 mb-4 h-32" placeholder="Your Message" value={message} onChange={(e) => setMessage(e.target.value)} required></textarea>
                        <button disabled={isDisabled} type="submit" className={`font-gothic font-medium rounded py-2 px-4 ${isDisabled
                            ? 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed'
                            : 'bg-brand-600 dark:bg-brand-500 text-white hover:opacity-90 hover:underline'}`}>
                            Send
                        </button>
                        </div>
                    </form>
                    </div>
                </div>
            </div>
        </div>
    )
}