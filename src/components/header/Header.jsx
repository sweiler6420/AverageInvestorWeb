import { useState } from 'react'
import { Bars3Icon, XMarkIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { ReactComponent as Logo } from '../../assets/Changed_Logo.svg'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth';
import useDarkMode from '../../hooks/useDarkMode';

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
    const { theme, toggleTheme } = useDarkMode()

    function toggleNavbar(){
        setDrawerOpen(!drawerOpen)
    }

    return (
        <nav className='sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800'>
            <div className='px-3 mx-auto relative text-sm'>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center flex-shrink-0'> 
                        {/* Desktop: Full name */}
                        <div className="hidden md:block">
                            <h1 className="font-gothic font-xl text-2xl">
                                <span className="text-neutral-900 dark:text-neutral-100">Anvex</span>
                            </h1>
                        </div>
                        {/* Mobile: Icon */}
                        <div className="md:hidden">
                            <Logo className="h-7 w-auto text-brand-600 dark:text-brand-400" fill="currentColor"/>
                        </div>
                    </div>
                    <ul className='hidden lg:flex ml-14 space-x-12'>
                        {(auth?.access_token ? authenticatedNavItems : navItems).map((item, index) => (
                            <li key={index}>
                                <a className='font-gothic font-demi text-lg text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white hover:underline' href={item.href}>
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className='hidden lg:flex justify-center space-x-4 items-center'>
                    <button
                        aria-label='Toggle theme'
                        onClick={toggleTheme}
                        className='rounded-md p-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    >
                        {theme === 'dark' ? (
                            <SunIcon className="h-5 w-5 text-brand-400" />
                        ) : (
                            <MoonIcon className="h-5 w-5 text-brand-600" />
                        )}
                    </button>
                    {auth?.access_token ? (
                        <div className="flex space-x-4">
                            <button className='font-gothic font-demi py-2 px-3 border border-neutral-300 dark:border-neutral-700 rounded-md hover:scale-105 hover:underline' onClick={() => {logout(); navigate("/#")}}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex space-x-4">
                            <a className='font-gothic font-demi py-2 px-3 border border-neutral-300 dark:border-neutral-700 rounded-md hover:scale-105 hover:underline' href='/login'>
                                Login In
                            </a>
                            <a className='font-gothic font-demi text-white py-2 px-3 border rounded-md bg-gradient-to-r from-brand-500 to-brand-700 dark:from-brand-400 dark:to-brand-600 hover:opacity-90 hover:underline' href='/signup'>
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
                    <div className='fixed right-0 mt-3 z-20 bg-neutral-100 dark:bg-neutral-900 w-full p-12 flex flex-col justify-center items-center lg:hidden border-t border-neutral-200 dark:border-neutral-800'>
                        <ul>
                            {(auth?.access_token ? authenticatedNavItems : navItems).map((item, index) => (
                                <li key={index} className='py-2'>
                                    <a className='font-gothic font-demi text-lg text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white hover:underline' href={item.href}>
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <div className='flex items-center space-x-6 mt-4'>
                            <button
                                aria-label='Toggle theme'
                                onClick={toggleTheme}
                                className='rounded-md p-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                            >
                                {theme === 'dark' ? (
                                    <SunIcon className="h-5 w-5 text-brand-400" />
                                ) : (
                                    <MoonIcon className="h-5 w-5 text-brand-600" />
                                )}
                            </button>
                        {auth?.access_token ? (
                            <div className="flex space-x-6">
                                <button className='font-gothic font-demi py-2 px-3 border border-neutral-300 dark:border-neutral-700 rounded-md hover:scale-105 hover:underline' onClick={() => {logout(); navigate("/#")}}>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className='flex space-x-6'>
                                <a className='font-gothic font-demi py-2 px-3 border border-neutral-300 dark:border-neutral-700 rounded-md hover:scale-105 hover:underline' href='/login'>
                                    Login In
                                </a>    
                                <a className='font-gothic font-demi text-white py-2 px-3 border rounded-md bg-gradient-to-r from-brand-500 to-brand-700 dark:from-brand-400 dark:to-brand-600 hover:opacity-90 hover:underline' href='/signup'>
                                    Create an Account
                                </a>  
                            </div>
                        )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}