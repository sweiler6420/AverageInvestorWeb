import PathwayContext from '../../PathwayContext'
import { Fragment, useContext} from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline'
import DarkModeSwitcher from './DarkModeSwitcher'
import { ReactComponent as Logo } from '../../assets/logo.svg'

const user = [
  { name: 'Profile', href: '#', current: false },
  { name: 'Settings', href: '#', current: false},
  { name: 'Logout', href: '#', current: false},
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Header() {
  const { pathway } = useContext(PathwayContext)

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
                    <Logo className="h-8 w-auto" fill="var(--primary)"/>
                  </div>
                  <div className="hidden sm:ml-6 sm:block">
                    <div className="flex space-x-4">
                      {pathway.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.current ? 'bg-secondary text-text dark:bg-secondary dark:text-text ' : 'text-reverse-text bg-primary hover:bg-secondary hover:text-text',
                            'rounded-md px-3 py-2 text-sm font-medium'
                          )}
                          aria-current={item.current ? 'page' : undefined}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  <DarkModeSwitcher className="h-12 w-6" aria-hidden="true" />
                  {/* Profile dropdown */}
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
                              <a href={item.href} className={classNames(active ? 'bg-secondary text-text' : '', (user.length-1 !== index ? 'block px-4 py-2 text-center text-sm text-text bg-background-sub border-b-2 border-primary' :'block px-4 py-2 text-center text-sm text-text bg-background-sub'))}>
                                {item.name}
                              </a>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </Transition>
                  </Menu>
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
                      item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
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