import { useState, useEffect } from 'react'
import { Bars3Icon, XMarkIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { ReactComponent as Logo } from '../../assets/Changed_Logo.svg'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth';
import useDarkMode from '../../hooks/useDarkMode';

const navItems = [
    { label: 'Home', href: '/#', isLink: false},
    { label: 'Features', href: '/#features', isLink: false},
    { label: 'Workflow', href: '/#workflow', isLink: false},
    { label: 'Pricing', href: '/#pricing', isLink: false},
    { label: 'Contact Us', href: '/#contact', isLink: false},
  ]

const authenticatedNavItems = [
    { label: 'Research', href: '/research', isLink: true},
    { label: 'Portfolio', href: '/portfolio', isLink: true},
  ]

export default function Header() {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [currentHash, setCurrentHash] = useState(window.location.hash)
    const [visibleSection, setVisibleSection] = useState(null)
    const { auth, setAuth } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const { theme, toggleTheme } = useDarkMode()

    // Listen for hash changes
    useEffect(() => {
        const handleHashChange = () => {
            setCurrentHash(window.location.hash)
        }
        window.addEventListener('hashchange', handleHashChange)
        return () => window.removeEventListener('hashchange', handleHashChange)
    }, [])

    // Track which section is visible using Intersection Observer
    useEffect(() => {
        if (location.pathname !== '/' || auth?.accessToken) {
            return // Only track sections on unauthenticated home page
        }

        const sections = ['features', 'workflow', 'pricing', 'contact']
        const observers = []

        sections.forEach((sectionId) => {
            const element = document.getElementById(sectionId)
            if (element) {
                const observer = new IntersectionObserver(
                    (entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                // Check if section is significantly visible (at least 30% in viewport)
                                const rect = entry.boundingClientRect
                                const viewportHeight = window.innerHeight
                                const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
                                const visibleRatio = visibleHeight / viewportHeight
                                
                                if (visibleRatio > 0.3) {
                                    setVisibleSection(sectionId)
                                }
                            }
                        })
                    },
                    {
                        threshold: [0, 0.3, 0.5, 0.7, 1],
                        rootMargin: '-20% 0px -20% 0px' // Only trigger when section is in middle 60% of viewport
                    }
                )
                observer.observe(element)
                observers.push(observer)
            }
        })

        // Also check scroll position on scroll
        const handleScroll = () => {
            let currentSection = null
            let maxVisible = 0

            sections.forEach((sectionId) => {
                const element = document.getElementById(sectionId)
                if (element) {
                    const rect = element.getBoundingClientRect()
                    const viewportHeight = window.innerHeight
                    const visibleTop = Math.max(0, -rect.top)
                    const visibleBottom = Math.min(rect.height, viewportHeight - rect.top)
                    const visibleHeight = Math.max(0, visibleBottom - visibleTop)
                    const visibleRatio = visibleHeight / viewportHeight

                    if (visibleRatio > 0.3 && visibleRatio > maxVisible) {
                        maxVisible = visibleRatio
                        currentSection = sectionId
                    }
                }
            })

            if (currentSection) {
                setVisibleSection(currentSection)
            } else {
                // If no section is significantly visible, check if we're at the top
                if (window.scrollY < 100) {
                    setVisibleSection(null)
                }
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // Initial check

        return () => {
            observers.forEach(observer => observer.disconnect())
            window.removeEventListener('scroll', handleScroll)
        }
    }, [location.pathname, auth?.accessToken])

    const isActiveRoute = (href) => {
        if (href.startsWith('/#')) {
            // For hash links, check if we're on the home page
            if (location.pathname !== '/' || auth?.accessToken) {
                return false
            }
            // If href is just '/#', check if there's no visible section
            if (href === '/#') {
                return !visibleSection && (!currentHash || currentHash === '#')
            }
            // For other hash links, check if the section is currently visible
            const sectionId = href.substring(2) // Remove '/#'
            return visibleSection === sectionId
        }
        return location.pathname === href
    }

    function toggleNavbar(){
        setDrawerOpen(!drawerOpen)
    }

    function logout() {
        setAuth({});
        localStorage.removeItem('refresh_token');
        navigate('/#');
    }

    return (
        <nav className='sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800'>
            <div className='px-3 mx-auto relative text-sm'>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center flex-shrink-0'> 
                        {/* Desktop: Full name */}
                        <div className="hidden md:block">
                            <h1 className="font-gothic font-xl text-2xl">
                                <span className="text-brand-600 dark:text-brand-400">Anvex</span>
                            </h1>
                        </div>
                        {/* Mobile: Icon */}
                        <div className="md:hidden">
                            <Logo className="h-7 w-auto text-brand-600 dark:text-brand-400" fill="currentColor"/>
                        </div>
                    </div>
                    <ul className='hidden lg:flex ml-14 space-x-12'>
                        {(auth?.accessToken ? authenticatedNavItems : navItems).map((item, index) => {
                            const isActive = isActiveRoute(item.href)
                            const linkClasses = `font-gothic font-demi text-lg ${
                                isActive 
                                    ? 'text-brand-600 dark:text-brand-400 font-bold underline' 
                                    : 'text-neutral-700 hover:text-brand-600 dark:text-neutral-300 dark:hover:text-brand-400 hover:underline'
                            }`
                            return (
                                <li key={index}>
                                    {item.isLink ? (
                                        <Link className={linkClasses} to={item.href}>
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <a className={linkClasses} href={item.href}>
                                            {item.label}
                                        </a>
                                    )}
                                </li>
                            )
                        })}
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
                    {auth?.accessToken ? (
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
                            {(auth?.accessToken ? authenticatedNavItems : navItems).map((item, index) => {
                                const isActive = isActiveRoute(item.href)
                                const linkClasses = `font-gothic font-demi text-lg ${
                                    isActive 
                                        ? 'text-brand-600 dark:text-brand-400 font-bold underline' 
                                        : 'text-neutral-700 hover:text-brand-600 dark:text-neutral-300 dark:hover:text-brand-400 hover:underline'
                                }`
                                return (
                                    <li key={index} className='py-2'>
                                        {item.isLink ? (
                                            <Link className={linkClasses} to={item.href} onClick={() => setDrawerOpen(false)}>
                                                {item.label}
                                            </Link>
                                        ) : (
                                            <a className={linkClasses} href={item.href} onClick={() => setDrawerOpen(false)}>
                                                {item.label}
                                            </a>
                                        )}
                                    </li>
                                )
                            })}
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
                        {auth?.accessToken ? (
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