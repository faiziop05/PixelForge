import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME_MODES, LIGHT_THEME, DARK_THEME } from '../constants/theme';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [themeMode, setThemeMode] = useState(THEME_MODES.DARK);
    const [theme, setTheme] = useState(DARK_THEME);

    useEffect(() => {
        loadTheme();
    }, []);

    useEffect(() => {
        updateTheme(themeMode);
    }, [themeMode]);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme_mode');
            if (savedTheme) {
                setThemeMode(savedTheme);
            }
        } catch (error) {
            console.log('Error loading theme:', error);
        }
    };

    const updateTheme = (mode) => {
        switch (mode) {
            case THEME_MODES.LIGHT:
                setTheme(LIGHT_THEME);
                break;
            case THEME_MODES.DARK:
                setTheme(DARK_THEME);
                break;
            default:
                setTheme(DARK_THEME);
        }
    };

    const changeTheme = async (mode) => {
        try {
            await AsyncStorage.setItem('theme_mode', mode);
            setThemeMode(mode);
        } catch (error) {
            console.log('Error saving theme:', error);
        }
    };

    const value = {
        theme,
        themeMode,
        changeTheme,
        isDark: themeMode !== THEME_MODES.LIGHT,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
