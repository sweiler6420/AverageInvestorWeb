import PathwayContext from '../../PathwayContext'
import { Fragment, useContext, useState} from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline'
import DarkModeSwitcher from './DarkModeSwitcher'
import { ReactComponent as Logo } from '../../assets/Changed_Logo.svg'
import { useSignOut, useIsAuthenticated } from 'react-auth-kit'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export default function Header() {
  const { pathway } = useContext(PathwayContext)
  const location = useLocation()
  const navigate = useNavigate()
  const signOut = useSignOut()
  const isAuthenticated = useIsAuthenticated()
  const [ currentRoute, setCurrentRoute ] = useState()

  const user = [
    { name: 'Profile', href: '#', current: false },
    { name: 'Settings', href: '#', current: false},
  ]

  useEffect(() => {
    if(pathway){
      for(var i=0; i < pathway.length; i++){
        if(pathway[i].current){
          setCurrentRoute(pathway[i].href)
        }
      }
    }
  },[pathway])
  
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }

  function logout() {
    console.log("log out")
    signOut()
    navigate("login")
  }

  return (
      <Disclosure as="nav" className="relative bg-background-sub dark:bg-background-sub outline outline-primary dark:outline-none dark:shadow-neon-primary">
        {({ open }) => (
          <>
            <div className="mx-auto w-full px-2 sm:px-6 lg:px-8">
              <div className="relative flex h-16 items-center justify-between">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  {/* Mobile menu button*/}
                  <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-primary hover:bg-secondary hover:text-primary focus:outline-none">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex flex-shrink-0 items-center">
                    <Logo className="h-10 w-auto" fill="var(--primary)"/>
                  </div>
                  <div className="hidden sm:ml-6 sm:block">
                    <div className="flex space-x-4">
                      {pathway.map((item) => (
                        <a key={item.name} href={item.href} className={classNames(item.current ? 'bg-secondary text-text dark:bg-secondary dark:text-text ' : 'text-reverse-text bg-primary hover:bg-secondary hover:text-text','rounded-md px-3 py-2 text-sm font-medium')}aria-current={item.current ? 'page' : undefined}>
                          {item.name}
                        </a> 
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  {!isAuthenticated() ?
                  <div className='flex space-x-4'>
                    {currentRoute && currentRoute !== '/login' ?
                      <a href="/login" className='bg-secondary text-text dark:bg-secondary dark:text-text hover:bg-primary hover:text-reverse-text rounded-md px-3 py-2 text-sm font-medium' aria-current='page'>
                      Login
                      </a> : null
                    }
                    {currentRoute && currentRoute !== '/signup' ?
                      <a
                        href="/signup"
                        className='hidden md:block bg-primary text-text dark:bg-primary dark:text-reverse-text hover:bg-secondary hover:text-text rounded-md px-3 py-2 text-sm font-medium' aria-current='page'>
                        <b>Get Started</b> - it's FREE
                      </a> : null
                    }
                  </div> : 
                  <>
                    <DarkModeSwitcher className="h-12 w-6" aria-hidden="true" />
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="relative flex rounded-full text-sm focus:outline-none transform active:scale-75 transition-transform">
                          <span className="absolute -inset-1.5" />
                          <span className="sr-only">Open user menu</span>
                          <UserIcon className="h-8 w-8 text-primary"></UserIcon>
                        </Menu.Button>
                      </div>
                      <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                        <Menu.Items className="absolute rounded-sm right-0 z-10 mt-2 w-auto origin-top-right bg-background-sub dark:bg-background-sub outline outline-primary dark:shadow-neon-primary">
                          {user.map((item, index) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <a href={item.href} className={classNames(active ? 'bg-secondary text-text' : '', 'block px-4 py-2 text-center text-sm text-text bg-background-sub w-full border-b-2 border-primary')}>
                                  {item.name}
                                </a>
                              )}
                            </Menu.Item>
                          ))}
                          <Menu.Item>
                              {({ active }) => (
                                <button onClick={() => logout()} className={classNames(active ? 'bg-secondary text-text' : '', 'block px-4 py-2 text-center text-sm text-text bg-background-sub w-full')}>
                                  Logout
                                </button>
                              )}
                            </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu> 
                  </>}
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {pathway.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                      item.current ? 'bg-secondary text-text' : 'text-text hover:bg-secondary',
                      'block rounded-md px-3 py-2 text-base font-medium'
                    )}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
  )
}