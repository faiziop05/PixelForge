const DATAMUSE_API = 'https://api.datamuse.com/sug';

export const getSuggestions = async (query) => {
    if (!query || query.length < 2) return [];

    try {
        const response = await fetch(`${DATAMUSE_API}?s=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data.slice(0, 8).map(item => item.word); // Limit to top 8
    } catch (error) {
        console.warn('Error fetching suggestions:', error);
        return [];
    }
};

export default {
    getSuggestions
};
