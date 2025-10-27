import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import useDarkMode from "../../hooks/useDarkMode";
 
export default function Switcher() {
    const { theme, toggleTheme } = useDarkMode();
 
    return (
        <button aria-label='Toggle theme' onClick={() => toggleTheme()} className='rounded-md p-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'>
            {theme === "dark" ? (
                <SunIcon className='h-5 w-5 text-brand-400' aria-hidden='true' />
            ) : (
                <MoonIcon className='h-5 w-5 text-brand-600' aria-hidden='true' />
            )}
        </button>
    );
}