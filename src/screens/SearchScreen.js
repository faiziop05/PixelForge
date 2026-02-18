import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import PexelsService from '../services/PexelsService';
import FavoritesService from '../services/FavoritesService';
import SuggestionService from '../services/SuggestionService';
import WallpaperCard from '../components/common/WallpaperCard';
import EmptyState from '../components/common/EmptyState';
import { SEARCH_SUGGESTIONS } from '../constants/categories';
import FilterModal from '../components/common/FilterModal';

export default function SearchScreen({ navigation, route }) {
    const { theme } = useTheme();
    const { user, isGuest } = useAuth();
    const [searchQuery, setSearchQuery] = useState(route.params?.search || '');
    const [hasSearched, setHasSearched] = useState(!!route.params?.search);
    const [apiSuggestions, setApiSuggestions] = useState([]);
    const searchTimeout = useRef(null);
    const [wallpapers, setWallpapers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);

    // Filter State
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        size: null,
        color: null,
    });

    useEffect(() => {
        if (hasSearched && searchQuery) {
            performSearch(searchQuery);
        }
        loadFavorites();
        loadRecentSearches();
    }, [activeFilters]); // Trigger search when filters change

    const loadRecentSearches = async () => {
        try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            const searches = await AsyncStorage.getItem('recent_searches');
            if (searches) {
                setRecentSearches(JSON.parse(searches));
            }
        } catch (error) {
            console.log('Error loading recent searches:', error);
        }
    };

    const saveRecentSearch = async (query) => {
        try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            const searches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
            await AsyncStorage.setItem('recent_searches', JSON.stringify(searches));
            setRecentSearches(searches);
        } catch (error) {
            console.log('Error saving recent search:', error);
        }
    };

    const removeSearch = async (query) => {
        try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            const searches = recentSearches.filter(s => s !== query);
            await AsyncStorage.setItem('recent_searches', JSON.stringify(searches));
            setRecentSearches(searches);
        } catch (error) {
            console.log('Error removing search:', error);
        }
    };

    const clearAllSearches = async () => {
        try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.removeItem('recent_searches');
            setRecentSearches([]);
        } catch (error) {
            console.log('Error clearing searches:', error);
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

    const performSearch = async (query) => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const data = await PexelsService.searchPhotos(query, 1, 30, activeFilters);
            setWallpapers(data);
            saveRecentSearch(query);
        } catch (error) {
            console.log('Error searching:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        Keyboard.dismiss();
        setHasSearched(true);
        performSearch(searchQuery);
    };

    const handleTextChange = (text) => {
        setSearchQuery(text);
        setHasSearched(false);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (text.length > 2) {
            searchTimeout.current = setTimeout(async () => {
                const results = await SuggestionService.getSuggestions(text);
                setApiSuggestions(results);
            }, 300);
        } else {
            setApiSuggestions([]);
        }
    };

    const handleSuggestionClick = (query) => {
        Keyboard.dismiss();
        setSearchQuery(query);
        setHasSearched(true);
        performSearch(query);
    };

    const handleApplyFilters = (filters) => {
        setActiveFilters(filters);
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

    const SearchSuggestion = ({ text, onPress }) => (
        <TouchableOpacity
            style={styles.suggestionItem}
            onPress={onPress}
        >
            <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
            <Text style={[styles.suggestionText, { color: theme.text }]}>{text}</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
        </TouchableOpacity>
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

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            );
        }

        if (!hasSearched) {
            const query = searchQuery.toLowerCase().trim();
            const filteredRecent = recentSearches.filter(s => s.toLowerCase().includes(query));
            const filteredPopular = SEARCH_SUGGESTIONS.filter(s => s.toLowerCase().includes(query));

            return (
                <ScrollView
                    style={styles.suggestionsContainer}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {apiSuggestions.length > 0 && (
                        <View style={styles.suggestionSection}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Suggestions</Text>
                            {apiSuggestions.map((item, index) => (
                                <SearchSuggestion
                                    key={`api-${index}`}
                                    text={item}
                                    onPress={() => handleSuggestionClick(item)}
                                />
                            ))}
                        </View>
                    )}

                    {filteredRecent.length > 0 && (
                        <View style={styles.suggestionSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                    {query ? 'Matching Recent' : 'Recent Searches'}
                                </Text>
                                {!query && (
                                    <TouchableOpacity onPress={clearAllSearches}>
                                        <Text style={[styles.clearButton, { color: theme.error }]}>Clear All</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            {filteredRecent.map((search, index) => (
                                <TouchableOpacity
                                    key={`recent-${index}`}
                                    style={styles.suggestionItem}
                                    onPress={() => handleSuggestionClick(search)}
                                >
                                    <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
                                    <Text style={[styles.suggestionText, { color: theme.text }]}>{search}</Text>
                                    <TouchableOpacity
                                        onPress={() => removeSearch(search)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Ionicons name="close" size={18} color={theme.error} />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {filteredPopular.length > 0 && (
                        <View style={styles.suggestionSection}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                {query ? 'Popular' : 'Popular Searches'}
                            </Text>
                            {filteredPopular.map((suggestion, index) => (
                                <SearchSuggestion
                                    key={`pop-${index}`}
                                    text={suggestion}
                                    onPress={() => handleSuggestionClick(suggestion)}
                                />
                            ))}
                        </View>
                    )}
                </ScrollView>
            );
        }

        if (wallpapers.length === 0) {
            return (
                <EmptyState
                    icon="search-outline"
                    title="No Results Found"
                    message="Try searching for something different"
                />
            );
        }

        return (
            <FlatList
                data={wallpapers}
                renderItem={renderWallpaper}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.listContent}
            />
        );
    };

    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.searchContainer}>
                {navigation.canGoBack() && (
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                )}

                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={theme.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search wallpapers..."
                        placeholderTextColor={theme.textSecondary}
                        value={searchQuery}
                        onChangeText={handleTextChange}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => handleTextChange('')}>
                            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    ) : null}
                </View>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        (activeFilters.size || activeFilters.color) && styles.filterButtonActive
                    ]}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <Ionicons
                        name="options-outline"
                        size={24}
                        color={(activeFilters.size || activeFilters.color) ? '#FFF' : theme.text}
                    />
                    {(activeFilters.size || activeFilters.color) && (
                        <View style={styles.filterBadge} />
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                {renderContent()}
            </KeyboardAvoidingView>

            <FilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                onApply={handleApplyFilters}
                initialFilters={activeFilters}
            />
        </SafeAreaView>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    searchContainer: {
        padding: 16,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.border,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surface,
        paddingHorizontal: 16,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: theme.border,
    },
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.border,
    },
    filterButtonActive: {
        backgroundColor: theme.primary,
        borderColor: theme.primary,
    },
    filterBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF375F',
        borderWidth: 1.5,
        borderColor: theme.primary,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: theme.text,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    suggestionsContainer: {
        flex: 1,
        padding: 16,
    },
    suggestionSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    clearButton: {
        fontSize: 14,
        fontWeight: '600',
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: theme.border,
    },
    suggestionText: {
        marginLeft: 12,
        fontSize: 16,
        flex: 1,
    },
    listContent: {
        paddingBottom: 150,
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
});
