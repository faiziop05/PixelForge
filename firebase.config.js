import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
    apiKey: "AIzaSyB-oECi42xBLMKGtK0uF3VcO5vE7quMb5k",
    authDomain: "kokonano-fdfcd.firebaseapp.com",
    projectId: "kokonano-fdfcd",
    storageBucket: "kokonano-fdfcd.firebasestorage.app",
    messagingSenderId: "874455386843",
    appId: "1:874455386843:web:e25971f9384d37dff21afe",
    measurementId: "G-0SMNZ52KLE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize other Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
