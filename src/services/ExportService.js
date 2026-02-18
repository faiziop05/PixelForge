import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

class ExportService {
    async exportProject(layers, canvasSize, options = {}) {
        const {
            format = 'png',
            quality = 1,
            width = canvasSize.width,
            height = canvasSize.height,
        } = options;

        try {
            // This is a simplified export - in production, you'd render layers to canvas
            // For now, we'll just handle basic image export

            const timestamp = Date.now();
            const filename = `pixelforge_${timestamp}.${format}`;

            return {
                success: true,
                filename,
                uri: null, // Would contain actual rendered image URI
            };
        } catch (error) {
            console.log('Error exporting project:', error);
            throw error;
        }
    }

    async saveToGallery(uri) {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();

            if (status !== 'granted') {
                throw new Error('Permission to access media library denied');
            }

            const asset = await MediaLibrary.createAssetAsync(uri);
            await MediaLibrary.createAlbumAsync('PixelForge', asset, false);

            return true;
        } catch (error) {
            console.log('Error saving to gallery:', error);
            throw error;
        }
    }

    async manipulateImage(uri, actions) {
        try {
            const result = await ImageManipulator.manipulateAsync(
                uri,
                actions,
                { compress: 1, format: ImageManipulator.SaveFormat.PNG }
            );

            return result.uri;
        } catch (error) {
            console.log('Error manipulating image:', error);
            throw error;
        }
    }

    async resizeImage(uri, width, height) {
        return this.manipulateImage(uri, [
            { resize: { width, height } }
        ]);
    }

    async cropImage(uri, crop) {
        return this.manipulateImage(uri, [
            { crop }
        ]);
    }

    async rotateImage(uri, degrees) {
        return this.manipulateImage(uri, [
            { rotate: degrees }
        ]);
    }

    async flipImage(uri, direction = 'horizontal') {
        const action = direction === 'horizontal'
            ? { flip: ImageManipulator.FlipType.Horizontal }
            : { flip: ImageManipulator.FlipType.Vertical };

        return this.manipulateImage(uri, [action]);
    }

    async applyFilter(uri, filterType) {
        // Basic filter implementation
        // In production, you'd implement more sophisticated filters
        try {
            switch (filterType) {
                case 'grayscale':
                    // Apply grayscale filter
                    break;
                case 'sepia':
                    // Apply sepia filter
                    break;
                case 'posterize':
                    // Apply posterize effect
                    break;
                default:
                    return uri;
            }

            return uri;
        } catch (error) {
            console.log('Error applying filter:', error);
            return uri;
        }
    }

    getFormatExtension(format) {
        const extensions = {
            png: 'png',
            jpg: 'jpg',
            jpeg: 'jpg',
        };

        return extensions[format.toLowerCase()] || 'png';
    }

    getQualityValue(qualityLevel) {
        const qualities = {
            low: 0.5,
            medium: 0.75,
            high: 0.9,
            max: 1,
        };

        return qualities[qualityLevel] || 1;
    }
}

export default new ExportService();
