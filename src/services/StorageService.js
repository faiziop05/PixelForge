import * as FileSystem from 'expo-file-system/legacy';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase.config';

const DOWNLOADS_DIR = `${FileSystem.documentDirectory}downloads/`;

class StorageService {
    constructor() {
        this.ensureDirectoryExists();
    }

    async ensureDirectoryExists() {
        try {
            const dirInfo = await FileSystem.getInfoAsync(DOWNLOADS_DIR);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(DOWNLOADS_DIR, { intermediates: true });
            }
        } catch (error) {
            console.log('Error creating downloads directory:', error);
        }
    }

    // Local storage
    async downloadWallpaper(url, filename) {
        try {
            await this.ensureDirectoryExists(); // Ensure directory exists before downloading
            const fileUri = `${DOWNLOADS_DIR}${filename}.jpg`;
            const download = await FileSystem.downloadAsync(url, fileUri);
            return download.uri;
        } catch (error) {
            console.log('Error downloading wallpaper:', error);
            throw error;
        }
    }

    async getLocalWallpapers() {
        try {
            const files = await FileSystem.readDirectoryAsync(DOWNLOADS_DIR);
            return files.map(file => ({
                name: file,
                uri: `${DOWNLOADS_DIR}${file}`,
            }));
        } catch (error) {
            console.log('Error reading local wallpapers:', error);
            return [];
        }
    }

    async deleteLocalWallpaper(filename) {
        try {
            const fileUri = `${DOWNLOADS_DIR}${filename}`;
            await FileSystem.deleteAsync(fileUri);
            return true;
        } catch (error) {
            console.log('Error deleting wallpaper:', error);
            return false;
        }
    }

    async getFileInfo(uri) {
        try {
            return await FileSystem.getInfoAsync(uri);
        } catch (error) {
            console.log('Error getting file info:', error);
            return null;
        }
    }

    // Firebase storage
    async uploadToFirebase(localUri, userId, filename) {
        try {
            const response = await fetch(localUri);
            const blob = await response.blob();

            const storageRef = ref(storage, `users/${userId}/projects/${filename}`);
            await uploadBytes(storageRef, blob);

            const downloadUrl = await getDownloadURL(storageRef);
            return downloadUrl;
        } catch (error) {
            console.log('Error uploading to Firebase:', error);
            throw error;
        }
    }

    async deleteFromFirebase(userId, filename) {
        try {
            const storageRef = ref(storage, `users/${userId}/projects/${filename}`);
            await deleteObject(storageRef);
            return true;
        } catch (error) {
            console.log('Error deleting from Firebase:', error);
            return false;
        }
    }

    // Cache management
    async getCacheSize() {
        try {
            const files = await this.getLocalWallpapers();
            let totalSize = 0;

            for (const file of files) {
                const info = await this.getFileInfo(file.uri);
                if (info && info.size) {
                    totalSize += info.size;
                }
            }

            return totalSize;
        } catch (error) {
            console.log('Error calculating cache size:', error);
            return 0;
        }
    }

    async clearCache() {
        try {
            await FileSystem.deleteAsync(DOWNLOADS_DIR, { idempotent: true });
            await this.ensureDirectoryExists();
            return true;
        } catch (error) {
            console.log('Error clearing cache:', error);
            return false;
        }
    }
}

export default new StorageService();
