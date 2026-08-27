import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Initialize state from localStorage or default to 'light'
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
    });

    // Apply theme to DOM whenever it changes
    useEffect(() => {
        const htmlElement = document.documentElement;
        const body = document.body;

        // Add smooth transition for background/color changes
        try {
            body.style.transition = 'background-color 300ms ease';
            htmlElement.style.transition = 'color 300ms ease, background-color 300ms ease';
        } catch {
            // ignore if styles cannot be applied (very old browsers)
        }

        if (theme === 'dark') {
            htmlElement.classList.add('dark');
            htmlElement.classList.remove('light');
            // remove any explicit light background so dark styles can take over
            body.style.backgroundColor = '';
        } else {
            htmlElement.classList.add('light');
            htmlElement.classList.remove('dark');
            // force white background on body for light mode
            body.style.backgroundColor = '#ffffff';
        }

        // Save theme preference to localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Toggle between light and dark modes
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    // Manually set theme to a specific value
    const setThemeMode = (mode) => {
        if (mode === 'light' || mode === 'dark') {
            setTheme(mode);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
