import { useState } from "react";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import useDarkMode from "../../hooks/useDarkMode";
 
export default function Switcher() {
    const [colorTheme, setTheme] = useDarkMode();
    const [darkMode, setDarkMode] = useState(
        colorTheme === "light" ? true : false
    );
 
    const toggleDarkMode = (checked) => {
        setTheme(colorTheme);
        setDarkMode(checked);
    };
 
    return (
        <>
            <DarkModeSwitch
                style={{ marginBottom: "2rem" }}
                checked={darkMode}
                onChange={toggleDarkMode}
                size={30}
            />
        </>
    );
}