import { useState } from "react";
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import useDarkMode from "../../hooks/useDarkMode";
 
export default function Switcher() {
    const [colorTheme, setTheme] = useDarkMode();
    const [darkMode, setDarkMode] = useState(colorTheme === "light" ? true : false);
 
    const toggleDarkMode = () => {
        if (colorTheme === "light"){
            setDarkMode(false)
        }else{
            setDarkMode(true)
        }

        setTheme(colorTheme)
    };
 
    return (
        <div>
            {darkMode ? <SunIcon onClick={() => toggleDarkMode()} className='h-12 w-6 text-primary' aria-hidden='true' /> : 
                <MoonIcon onClick={() => toggleDarkMode()} className='h-12 w-6 text-primary' aria-hidden='true' />}
        </div>
    );
}