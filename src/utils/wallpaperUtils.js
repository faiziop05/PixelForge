import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform, Alert, Linking } from 'react-native';
import RnExpoWallpaperManager from 'rn-expo-wallpaper-manager';

class WallpaperUtils {
    async requestPermissions() {
        try {
            const { status: existingStatus, accessPrivileges } = await MediaLibrary.getPermissionsAsync();

            // Check if we have full access (needed for saving)
            if (existingStatus === 'granted' && accessPrivileges !== 'limited') {
                return true;
            }

            // Request permissions - pass false to request full access (not limited)
            const { status, canAskAgain, accessPrivileges: newAccessPrivileges } = await MediaLibrary.requestPermissionsAsync(false);

            if (status === 'granted' && newAccessPrivileges !== 'limited') {
                return true;
            }

            // Handle denied or limited access
            if (status === 'denied' || newAccessPrivileges === 'limited') {
                // If we can't ask again, prompt user to open settings
                if (!canAskAgain || status === 'denied') {
                    Alert.alert(
                        'Permission Required',
                        'Photo library access is required to save wallpapers. Please enable it in Settings.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Open Settings',
                                onPress: () => Linking.openSettings()
                            }
                        ]
                    );
                }
                return false;
            }

            return status === 'granted';
        } catch (error) {
            console.log('Error requesting permissions:', error);
            return false;
        }
    }

    async setWallpaper(uri, options = {}) {
        const { location = 'both' } = options;

        try {
            if (Platform.OS === 'android') {
                console.log('Setting wallpaper using rn-expo-wallpaper-manager');

                // Convert file:// URI to just the path
                let filePath = uri;
                if (uri.startsWith('file://')) {
                    filePath = uri.replace('file://', '');
                }

                console.log('File path for wallpaper:', filePath);

                // Check if wallpaper setting is supported
                const isSupported = RnExpoWallpaperManager.isWallpaperSettingSupported();
                console.log('Wallpaper setting supported:', isSupported);

                if (!isSupported) {
                    throw new Error('Wallpaper setting not supported on this device');
                }

                // Set wallpaper using the library
                const result = await RnExpoWallpaperManager.setWallpaperFromFile(filePath, location);
                console.log('Wallpaper set result:', result);

                if (result.success) {
                    console.log('Wallpaper set successfully!');
                    return true;
                } else {
                    throw new Error(result.message || 'Failed to set wallpaper');
                }

            } else if (Platform.OS === 'ios') {
                // iOS doesn't allow programmatic wallpaper setting
                this.showIOSInstructions();
                return false;
            }
        } catch (error) {
            console.log('Error setting wallpaper with library:', error);
            throw error;
        }
    }

    showIOSInstructions() {
        Alert.alert(
            'Set Wallpaper on iOS',
            'To set this image as your wallpaper:\n\n' +
            '1. Save the image to your Photos\n' +
            '2. Open Settings > Wallpaper\n' +
            '3. Choose "New Wallpaper"\n' +
            '4. Select the saved image from your Photos\n' +
            '5. Choose "Set" and select Lock Screen, Home Screen, or Both',
            [{ text: 'Got it' }]
        );
    }

    async saveToPhotos(uri) {
        try {
            const hasPermission = await this.requestPermissions();

            if (!hasPermission) {
                throw new Error('Permission to access photos denied');
            }

            // Use saveToLibraryAsync for cleaner gallery saving
            await MediaLibrary.saveToLibraryAsync(uri);
            console.log('Saved to gallery successfully');
            return true;
        } catch (error) {
            console.log('Error saving to photos:', error);
            throw error;
        }
    }

    async checkWallpaperSupport() {
        if (Platform.OS === 'ios') {
            return {
                supported: false,
                reason: 'iOS does not allow programmatic wallpaper setting',
            };
        }

        if (Platform.OS === 'android') {
            const isSupported = RnExpoWallpaperManager.isWallpaperSettingSupported();
            return {
                supported: isSupported,
                features: {
                    homeScreen: true,
                    lockScreen: Platform.Version >= 24, // Android N+
                    both: Platform.Version >= 24,
                },
            };
        }

        return {
            supported: false,
            reason: 'Platform not supported',
        };
    }

    getWallpaperLocations() {
        if (Platform.OS === 'android' && Platform.Version >= 24) {
            return [
                { value: 'home', label: 'Home Screen' },
                { value: 'lock', label: 'Lock Screen' },
                { value: 'both', label: 'Both' },
            ];
        }

        return [
            { value: 'home', label: 'Home Screen' },
        ];
    }
}

export default new WallpaperUtils();
