const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'MseGxKYX524v8BYFXJ1mw7NL7EM4sSwkq67K6j3BHqlvbI1A8HmtubO5';
const PEXELS_API_BASE = 'https://api.pexels.com/v1';

const COLOR_MAP = {
    red: 'e60026',
    orange: 'f5a623',
    yellow: 'f8e71c',
    green: '65c15c',
    turquoise: '42b7b2',
    blue: '4c72b0',
    violet: '8f60a8',
    pink: 'f277a1',
    brown: '986e49',
    black: '000000',
    gray: '808080',
    white: 'ffffff'
};

class PexelsService {
    constructor() {
        this.headers = {
            Authorization: PEXELS_API_KEY,
        };
    }

    async searchPhotos(query, page = 1, perPage = 20, filters = {}) {
        try {
            let url = `${PEXELS_API_BASE}/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=portrait`;

            if (filters.size && filters.size !== 'all') {
                url += `&size=${filters.size}`;
            }
            if (filters.color) {
                const colorKey = filters.color.toLowerCase().replace('#', '');
                const hexColor = COLOR_MAP[colorKey] || colorKey;
                url += `&color=${hexColor}`;
            }

            const response = await fetch(url, { headers: this.headers });
            const data = await response.json();

            return this.formatPhotos(data.photos || []);
        } catch (error) {
            console.log('Error searching photos:', error);
            throw error;
        }
    }

    async getCuratedPhotos(page = 1, perPage = 20) {
        try {
            const response = await fetch(
                `${PEXELS_API_BASE}/curated?page=${page}&per_page=${perPage}&orientation=portrait`,
                { headers: this.headers }
            );
            const data = await response.json();
            return this.formatPhotos(data.photos || []);
        } catch (error) {
            console.log('Error fetching curated photos:', error);
            throw error;
        }
    }

    async getPhotoById(id) {
        try {
            const response = await fetch(
                `${PEXELS_API_BASE}/photos/${id}`,
                { headers: this.headers }
            );
            const data = await response.json();
            return this.formatPhoto(data);
        } catch (error) {
            console.log('Error fetching photo by id:', error);
            throw error;
        }
    }

    formatPhotos(photos) {
        return photos.map(photo => this.formatPhoto(photo));
    }

    formatPhoto(photo) {
        return {
            id: photo.id,
            width: photo.width,
            height: photo.height,
            url: photo.url,
            photographer: photo.photographer,
            photographer_url: photo.photographer_url,
            src: {
                original: photo.src.original,
                large: photo.src.large2x,
                medium: photo.src.large,
                small: photo.src.medium,
                portrait: photo.src.portrait,
                landscape: photo.src.landscape,
                tiny: photo.src.tiny,
            },
            alt: photo.alt || 'Wallpaper',
            avgColor: photo.avg_color || '#000000',
        };
    }

    // Get popular keywords
    getPopularKeywords() {
        return [
            'nature', 'abstract', 'city', 'technology', 'minimal',
            'sunset', 'ocean', 'mountains', 'space', 'architecture',
            'art', 'pattern', 'texture', 'dark', 'colorful'
        ];
    }
}

export default new PexelsService();
