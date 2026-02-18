import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase.config';

const FAVORITES_KEY = 'favorites';

class FavoritesService {
    // Local favorites (for guest mode)
    async getLocalFavorites() {
        try {
            const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
            return favoritesJson ? JSON.parse(favoritesJson) : [];
        } catch (error) {
            console.log('Error getting local favorites:', error);
            return [];
        }
    }

    async addLocalFavorite(item) {
        try {
            const favorites = await this.getLocalFavorites();
            const exists = favorites.find(fav => fav.id === item.id);

            if (!exists) {
                favorites.push({
                    ...item,
                    favoritedAt: new Date().toISOString(),
                });
                await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
            }

            return favorites;
        } catch (error) {
            console.log('Error adding local favorite:', error);
            throw error;
        }
    }

    async removeLocalFavorite(itemId) {
        try {
            const favorites = await this.getLocalFavorites();
            const filtered = favorites.filter(fav => fav.id !== itemId);
            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
            return filtered;
        } catch (error) {
            console.log('Error removing local favorite:', error);
            throw error;
        }
    }

    async isLocalFavorite(itemId) {
        try {
            const favorites = await this.getLocalFavorites();
            return favorites.some(fav => fav.id === itemId);
        } catch (error) {
            console.log('Error checking local favorite:', error);
            return false;
        }
    }

    // Firebase favorites (for logged-in users)
    async getFirebaseFavorites(userId) {
        try {
            const docRef = doc(db, 'favorites', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data().items || [];
            }

            return [];
        } catch (error) {
            console.log('Error getting Firebase favorites:', error);
            return [];
        }
    }

    async addFirebaseFavorite(userId, item) {
        try {
            const docRef = doc(db, 'favorites', userId);
            const favoriteItem = {
                ...item,
                favoritedAt: new Date().toISOString(),
            };

            await setDoc(docRef, {
                items: arrayUnion(favoriteItem),
                updatedAt: new Date().toISOString(),
            }, { merge: true });

            return true;
        } catch (error) {
            console.log('Error adding Firebase favorite:', error);
            throw error;
        }
    }

    async removeFirebaseFavorite(userId, itemId) {
        try {
            const favorites = await this.getFirebaseFavorites(userId);
            const item = favorites.find(fav => fav.id === itemId);

            if (item) {
                const docRef = doc(db, 'favorites', userId);
                await updateDoc(docRef, {
                    items: arrayRemove(item),
                    updatedAt: new Date().toISOString(),
                });
            }

            return true;
        } catch (error) {
            console.log('Error removing Firebase favorite:', error);
            throw error;
        }
    }

    async isFirebaseFavorite(userId, itemId) {
        try {
            const favorites = await this.getFirebaseFavorites(userId);
            return favorites.some(fav => fav.id === itemId);
        } catch (error) {
            console.log('Error checking Firebase favorite:', error);
            return false;
        }
    }

    // Sync local to Firebase when user logs in
    async syncLocalToFirebase(userId) {
        try {
            const localFavorites = await this.getLocalFavorites();

            if (localFavorites.length > 0) {
                for (const item of localFavorites) {
                    await this.addFirebaseFavorite(userId, item);
                }

                // Clear local favorites after sync
                await AsyncStorage.removeItem(FAVORITES_KEY);
            }

            return true;
        } catch (error) {
            console.log('Error syncing favorites:', error);
            return false;
        }
    }
}

export default new FavoritesService();
