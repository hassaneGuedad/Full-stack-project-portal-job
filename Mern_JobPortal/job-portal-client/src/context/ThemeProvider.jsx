import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        // Récupérer le mode depuis le localStorage s'il existe
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : false;
    });

    // Appliquer le thème au document
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        // Sauvegarder le mode dans localStorage
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;