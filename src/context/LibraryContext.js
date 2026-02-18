import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import FavoritesService from '../services/FavoritesService';
import StorageService from '../services/StorageService';
import { useAuth } from './AuthContext';

const LibraryContext = createContext();

export const useLibrary = () => {
    const context = useContext(LibraryContext);
    if (!context) {
        throw new Error('useLibrary must be used within a LibraryProvider');
    }
    return context;
};

export const LibraryProvider = ({ children }) => {
    const { user, isGuest } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [downloads, setDownloads] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load favorites
    const loadFavorites = useCallback(async () => {
        try {
            if (isGuest) {
                const localFavs = await FavoritesService.getLocalFavorites();
                setFavorites(localFavs);
            } else if (user) {
                const firebaseFavs = await FavoritesService.getFirebaseFavorites(user.uid);
                setFavorites(firebaseFavs);
            }
        } catch (error) {
            console.log('Error loading favorites:', error);
        }
    }, [user, isGuest]);

    // Load downloads
    const loadDownloads = useCallback(async () => {
        try {
            const localDownloads = await StorageService.getLocalWallpapers();
            setDownloads(localDownloads);
        } catch (error) {
            console.log('Error loading downloads:', error);
        }
    }, []);

    // Initial load
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([loadFavorites(), loadDownloads()]);
            setLoading(false);
        };
        init();
    }, [loadFavorites, loadDownloads]);

    // Add to favorites
    const addFavorite = useCallback(async (wallpaper) => {
        try {
            if (isGuest) {
                await FavoritesService.addLocalFavorite(wallpaper);
            } else if (user) {
                await FavoritesService.addFirebaseFavorite(user.uid, wallpaper);
            }
            // Update state immediately
            setFavorites(prev => {
                if (prev.some(f => f.id === wallpaper.id)) return prev;
                return [...prev, wallpaper];
            });
            return true;
        } catch (error) {
            console.log('Error adding favorite:', error);
            return false;
        }
    }, [user, isGuest]);

    // Remove from favorites
    const removeFavorite = useCallback(async (wallpaperId) => {
        try {
            if (isGuest) {
                await FavoritesService.removeLocalFavorite(wallpaperId);
            } else if (user) {
                await FavoritesService.removeFirebaseFavorite(user.uid, wallpaperId);
            }
            // Update state immediately
            setFavorites(prev => prev.filter(f => f.id !== wallpaperId));
            return true;
        } catch (error) {
            console.log('Error removing favorite:', error);
            return false;
        }
    }, [user, isGuest]);

    // Check if favorited
    const isFavorite = useCallback((wallpaperId) => {
        return favorites.some(f => f.id === wallpaperId);
    }, [favorites]);

    // Add download (call this after downloading)
    const addDownload = useCallback(async (filename, uri) => {
        setDownloads(prev => {
            if (prev.some(d => d.name === filename)) return prev;
            return [...prev, { name: filename, uri }];
        });
    }, []);

    // Refresh all data
    const refreshLibrary = useCallback(async () => {
        await Promise.all([loadFavorites(), loadDownloads()]);
    }, [loadFavorites, loadDownloads]);

    const value = {
        favorites,
        downloads,
        loading,
        addFavorite,
        removeFavorite,
        isFavorite,
        addDownload,
        refreshLibrary,
        loadFavorites,
        loadDownloads,
    };

    return (
        <LibraryContext.Provider value={value}>
            {children}
        </LibraryContext.Provider>
    );
};
