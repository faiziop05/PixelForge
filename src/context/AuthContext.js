import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../../firebase.config';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                setIsGuest(false);
                setLoading(false);
            } else {
                // Check if user is in guest mode
                await checkGuestMode();
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const checkGuestMode = async () => {
        try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            const guestMode = await AsyncStorage.getItem('guest_mode');
            setIsGuest(guestMode === 'true');
        } catch (error) {
            console.log('Error checking guest mode:', error);
        }
    };

    const enableGuestMode = async () => {
        try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.setItem('guest_mode', 'true');
            setIsGuest(true);
        } catch (error) {
            console.log('Error enabling guest mode:', error);
        }
    };

    const disableGuestMode = async () => {
        try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.removeItem('guest_mode');
            setIsGuest(false);
        } catch (error) {
            console.log('Error disabling guest mode:', error);
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            await disableGuestMode();
        } catch (error) {
            console.log('Error signing out:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        isGuest,
        isAuthenticated: !!user || isGuest,
        enableGuestMode,
        disableGuestMode,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
