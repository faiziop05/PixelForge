import * as ImageManipulator from 'expo-image-manipulator';

class ImageUtils {
    async getImageDimensions(uri) {
        return new Promise((resolve, reject) => {
            const Image = require('react-native').Image;
            Image.getSize(
                uri,
                (width, height) => resolve({ width, height }),
                (error) => reject(error)
            );
        });
    }

    async resizeToFit(uri, maxWidth, maxHeight) {
        try {
            const { width, height } = await this.getImageDimensions(uri);

            const aspectRatio = width / height;
            let newWidth = width;
            let newHeight = height;

            if (width > maxWidth) {
                newWidth = maxWidth;
                newHeight = maxWidth / aspectRatio;
            }

            if (newHeight > maxHeight) {
                newHeight = maxHeight;
                newWidth = maxHeight * aspectRatio;
            }

            if (newWidth !== width || newHeight !== height) {
                const result = await ImageManipulator.manipulateAsync(
                    uri,
                    [{ resize: { width: newWidth, height: newHeight } }],
                    { compress: 1, format: ImageManipulator.SaveFormat.PNG }
                );

                return result.uri;
            }

            return uri;
        } catch (error) {
            console.log('Error resizing image:', error);
            throw error;
        }
    }

    async cropToSquare(uri) {
        try {
            const { width, height } = await this.getImageDimensions(uri);
            const size = Math.min(width, height);
            const offsetX = (width - size) / 2;
            const offsetY = (height - size) / 2;

            const result = await ImageManipulator.manipulateAsync(
                uri,
                [{
                    crop: {
                        originX: offsetX,
                        originY: offsetY,
                        width: size,
                        height: size,
                    }
                }],
                { compress: 1, format: ImageManipulator.SaveFormat.PNG }
            );

            return result.uri;
        } catch (error) {
            console.log('Error cropping to square:', error);
            throw error;
        }
    }

    calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
        const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        return {
            width: srcWidth * ratio,
            height: srcHeight * ratio,
            ratio,
        };
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : null;
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    generateThumbnail(uri, size = 200) {
        return ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: size, height: size } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
    }

    async compressImage(uri, quality = 0.8) {
        try {
            const result = await ImageManipulator.manipulateAsync(
                uri,
                [],
                { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
            );

            return result.uri;
        } catch (error) {
            console.log('Error compressing image:', error);
            throw error;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    getImageOrientation(width, height) {
        if (width > height) return 'landscape';
        if (height > width) return 'portrait';
        return 'square';
    }
}

export default new ImageUtils();
