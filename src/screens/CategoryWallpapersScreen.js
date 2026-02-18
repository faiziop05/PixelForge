import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import PexelsService from '../services/PexelsService';
import FavoritesService from '../services/FavoritesService';
import WallpaperCard from '../components/common/WallpaperCard';
import { CATEGORIES } from '../constants/categories';
import FilterModal from '../components/common/FilterModal';
import EmptyState from '../components/common/EmptyState';

export default function CategoryWallpapersScreen({ navigation, route }) {
    const { category } = route.params;
    const { theme } = useTheme();
    const { user, isGuest } = useAuth();

    const [wallpapers, setWallpapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [favorites, setFavorites] = useState([]);

    // Filter State
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        size: null,
        color: null,
    });

    useEffect(() => {
        loadWallpapers();
        loadFavorites();
    }, [activeFilters]); // Reload when filters change

    const loadWallpapers = async () => {
        setLoading(true);
        try {
            const searchQuery = category.keywords[0];
            const data = await PexelsService.searchPhotos(searchQuery, 1, 20, activeFilters);
            setWallpapers(data);
            setPage(1);
        } catch (error) {
            console.log('Error loading wallpapers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = (filters) => {
        setActiveFilters(filters);
    };

    const loadMoreWallpapers = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const searchQuery = category.keywords[0];
            const data = await PexelsService.searchPhotos(searchQuery, nextPage, 20, activeFilters);
            setWallpapers(prev => {
                const existingIds = new Set(prev.map(w => w.id));
                const newItems = data.filter(w => !existingIds.has(w.id));
                return [...prev, ...newItems];
            });
            setPage(nextPage);
        } catch (error) {
            console.log('Error loading more:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const loadFavorites = async () => {
        try {
            if (isGuest) {
                const localFavs = await FavoritesService.getLocalFavorites();
                setFavorites(localFavs.map(f => f.id));
            } else if (user) {
                const firebaseFavs = await FavoritesService.getFirebaseFavorites(user.uid);
                setFavorites(firebaseFavs.map(f => f.id));
            }
        } catch (error) {
            console.log('Error loading favorites:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadWallpapers();
        setRefreshing(false);
    };

    const toggleFavorite = async (wallpaper) => {
        const isFav = favorites.includes(wallpaper.id);
        try {
            if (isGuest) {
                if (isFav) {
                    await FavoritesService.removeLocalFavorite(wallpaper.id);
                    setFavorites(prev => prev.filter(id => id !== wallpaper.id));
                } else {
                    await FavoritesService.addLocalFavorite(wallpaper);
                    setFavorites(prev => [...prev, wallpaper.id]);
                }
            } else if (user) {
                if (isFav) {
                    await FavoritesService.removeFirebaseFavorite(user.uid, wallpaper.id);
                    setFavorites(prev => prev.filter(id => id !== wallpaper.id));
                } else {
                    await FavoritesService.addFirebaseFavorite(user.uid, wallpaper);
                    setFavorites(prev => [...prev, wallpaper.id]);
                }
            }
        } catch (error) {
            console.log('Error toggling favorite:', error);
        }
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Other Categories List */}
            <View style={styles.categoriesListContainer}>
                <FlatList
                    data={CATEGORIES.filter(c => c.id !== category.id)}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesListContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.miniCategoryItem, { backgroundColor: theme.surface }]}
                            onPress={() => navigation.replace('CategoryWallpapers', { category: item })}
                        >
                            <Text style={[styles.miniCategoryText, { color: theme.text }]}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id}
                />
            </View>
        </View>
    );

    const renderWallpaper = ({ item, index }) => (
        <View style={index % 2 === 0 ? styles.cardLeft : styles.cardRight}>
            <WallpaperCard
                wallpaper={item}
                onPress={() => navigation.navigate('WallpaperDetail', {
                    wallpaper: item,
                    wallpapers: wallpapers,
                    initialIndex: index,
                })}
                onFavorite={() => toggleFavorite(item)}
                isFavorite={favorites.includes(item.id)}
            />
        </View>
    );

    const styles = createStyles(theme, category);

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.topBar}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={styles.topBarTitle}>{category.name}</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Top Navigation Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>{category.name}</Text>
                <TouchableOpacity
                    style={[
                        styles.backButton,
                        (activeFilters.size || activeFilters.color) && styles.filterButtonActive
                    ]}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <Ionicons
                        name="options-outline"
                        size={20}
                        color={(activeFilters.size || activeFilters.color) ? '#FFF' : theme.text}
                    />
                    {(activeFilters.size || activeFilters.color) && (
                        <View style={styles.filterBadge} />
                    )}
                </TouchableOpacity>
            </View>

            <FlatList
                data={wallpapers}
                renderItem={renderWallpaper}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                numColumns={2}
                ListHeaderComponent={renderHeader}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.primary}
                    />
                }
                onEndReached={loadMoreWallpapers}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <EmptyState
                                icon="images-outline"
                                title="No Wallpapers Found"
                                message="Try adjusting your filters"
                            />
                        </View>
                    )
                }
                ListFooterComponent={
                    loadingMore ? (
                        <View style={styles.footerLoader}>
                            <View style={styles.skeletonCard} />
                            <View style={styles.skeletonCard} />
                        </View>
                    ) : null
                }
                contentContainerStyle={styles.listContent}
            />

            <FilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                onApply={handleApplyFilters}
                initialFilters={activeFilters}
            />
        </SafeAreaView>
    );
}

const createStyles = (theme, category) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    // ... (rest of styles)
    filterButtonActive: {
        backgroundColor: theme.primary,
        borderColor: theme.primary,
    },
    filterBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF375F',
        borderWidth: 1.5,
        borderColor: theme.primary,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: theme.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topBarTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.text,
    },
    headerContainer: {
        padding: 20,
    },
    categoriesListContainer: {
        marginBottom: 0,
    },
    categoriesListContent: {
        gap: 12,
        paddingRight: 20,
    },
    miniCategoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
        gap: 8,
    },
    miniCategoryIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    miniCategoryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    keywordsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    keywordBadge: {
        backgroundColor: theme.surface,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
    },
    keywordText: {
        fontSize: 13,
        color: theme.textSecondary,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 100,
    },
    cardLeft: {
        flex: 1,
        paddingLeft: 16,
        paddingRight: 8,
    },
    cardRight: {
        flex: 1,
        paddingLeft: 8,
        paddingRight: 16,
    },
    footerLoader: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 16,
    },
    skeletonCard: {
        flex: 1,
        height: 200,
        borderRadius: 16,
        backgroundColor: theme.surface,
    },
    emptyContainer: {
        paddingTop: 40,
        minHeight: 300,
    },
});
