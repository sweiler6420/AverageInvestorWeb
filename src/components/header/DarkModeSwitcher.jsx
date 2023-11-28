import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import useDarkMode from "../../hooks/useDarkMode";
 
export default function Switcher() {
    const { theme, toggleTheme } = useDarkMode();
 
    return (
        <div>
            {theme === "dark" ? <SunIcon onClick={() => toggleTheme()} className='h-12 w-6 text-primary' aria-hidden='true' /> : 
                <MoonIcon onClick={() => toggleTheme()} className='h-12 w-6 text-primary' aria-hidden='true' />}
        </div>
    );
}