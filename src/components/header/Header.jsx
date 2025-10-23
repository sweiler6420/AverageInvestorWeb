import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { ReactComponent as Logo } from '../../assets/Changed_Logo.svg'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth';

const navItems = [
    { label: 'Home', href: '/#'},
    { label: 'Features', href: '/#features'},
    { label: 'Workflow', href: '/#workflow'},
    { label: 'Pricing', href: '/#pricing'},
    { label: 'Contact Us', href: '/#contact'},
  ]

const authenticatedNavItems = [
    { label: 'Home', href: '/#'},
    { label: 'Stocks', href: '/stocks'},
  ]

export default function Header() {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const { auth, logout } = useAuth()
    const navigate = useNavigate()

    function toggleNavbar(){
        setDrawerOpen(!drawerOpen)
    }

    return (
        <nav className='sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-neutral-700/80'>
            <div className='px-3 mx-auto relative text-sm'>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center flex-shrink-0'> 
                        {/* Desktop: Full name */}
                        <div className="hidden md:block">
                            <h1 className="font-gothic font-xl text-2xl">
                                <span className="text-accent-secondary">Average</span>
                                <span className="text-primary">Investor</span>
                            </h1>
                        </div>
                        {/* Mobile: Icon */}
                        <div className="md:hidden">
                            <Logo className="h-7 w-auto" fill="var(--primary)"/>
                        </div>
                    </div>
                    <ul className='hidden lg:flex ml-14 space-x-12'>
                        {(auth?.access_token ? authenticatedNavItems : navItems).map((item, index) => (
                            <li key={index}>
                                <a className='font-gothic font-demi text-lg hover:underline' href={item.href}>
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className='hidden lg:flex justify-center space-x-12 items-center'>
                    {auth?.access_token ? (
                        <div className="flex space-x-4">
                            <button className='font-gothic font-demi py-2 px-3 border border-neutral-700/80 rounded-md hover:scale-105 hover:underline' onClick={() => {logout(); navigate("/#")}}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex space-x-4">
                            <a className='font-gothic font-demi py-2 px-3 border border-neutral-700/80 rounded-md hover:scale-105 hover:underline' href='/login'>
                                Login In
                            </a>
                            <a className='font-gothic font-demi text-reverse-text py-2 px-3 border rounded-md bg-gradient-to-r from-accent-secondary/80 to-primary/80 hover:scale-105 hover:underline' href='/signup'>
                                Create an Account
                            </a>
                        </div>
                    )} 
                    </div>
                    <div className='lg:hidden md:flex flex-col justify-end'>
                        <button onClick={toggleNavbar}>
                            {drawerOpen ? <XMarkIcon className="block h-6 w-6" aria-hidden="true"/> : <Bars3Icon className="block h-6 w-6" aria-hidden="true"/>}
                        </button>
                    </div>
                </div>
                {drawerOpen && (
                    <div className='fixed right-0 mt-3 z-20 bg-gray-200 w-full p-12 flex flex-col justify-center items-center lg:hidden'>
                        <ul>
                            {(auth?.access_token ? authenticatedNavItems : navItems).map((item, index) => (
                                <li key={index} className='py-2'>
                                    <a className='font-gothic font-demi text-lg hover:underline' href={item.href}>
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        {auth?.access_token ? (
                            <div className="flex space-x-6 mt-4">
                                <button className='font-gothic font-demi py-2 px-3 border border-neutral-700/80 rounded-md hover:scale-105 hover:underline' onClick={() => {logout(); navigate("/#")}}>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className='flex space-x-6 mt-4'>
                                <a className='font-gothic font-demi py-2 px-3 border border-neutral-700/80 rounded-md hover:scale-105 hover:underline' href='/login'>
                                    Login In
                                </a>    
                                <a className='font-gothic font-demi text-reverse-text py-2 px-3 border rounded-md bg-gradient-to-r from-accent-secondary/80 to-primary/80 hover:scale-105 hover:underline' href='/signup'>
                                    Create an Account
                                </a>  
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}