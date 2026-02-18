import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import PexelsService from '../services/PexelsService';
import WallpaperCard from '../components/common/WallpaperCard';
import CategoryCard from '../components/common/CategoryCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { CATEGORIES } from '../constants/categories';

const { width } = Dimensions.get('window');
const HORIZONTAL_CARD_WIDTH = width * 0.38;

// Themed sections configuration
const THEMED_SECTIONS = [
    { id: 'nature', title: 'Nature & Landscapes', query: 'nature landscape', category: CATEGORIES.find(c => c.id === 'nature') },
    { id: 'abstract', title: 'Abstract Art', query: 'abstract art colorful', category: CATEGORIES.find(c => c.id === 'abstract') },
    { id: 'dark', title: 'Dark & Moody', query: 'dark moody aesthetic', category: CATEGORIES.find(c => c.id === 'dark') || CATEGORIES.find(c => c.id === 'amoled') },
    { id: 'space', title: 'Space & Galaxy', query: 'space galaxy stars', category: CATEGORIES.find(c => c.id === 'space') },
];

export default function HomeScreen({ navigation }) {
    const { theme } = useTheme();
    const { isFavorite, addFavorite, removeFavorite } = useLibrary();
    const [featuredWallpapers, setFeaturedWallpapers] = useState([]);
    const [sectionWallpapers, setSectionWallpapers] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            // Load featured wallpapers
            const featured = await PexelsService.getCuratedPhotos(1, 10);
            setFeaturedWallpapers(featured);

            // Load themed sections in parallel
            const sectionPromises = THEMED_SECTIONS.map(async (section) => {
                const data = await PexelsService.searchPhotos(section.query, 1, 8);
                return { id: section.id, data };
            });

            const results = await Promise.all(sectionPromises);
            const sectionsData = {};
            results.forEach(result => {
                sectionsData[result.id] = result.data;
            });
            setSectionWallpapers(sectionsData);
        } catch (error) {
            console.log('Error loading wallpapers:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadAllData();
        setRefreshing(false);
    }, []);

    const toggleFavorite = async (wallpaper) => {
        const isFav = isFavorite(wallpaper.id);
        if (isFav) {
            await removeFavorite(wallpaper.id);
        } else {
            await addFavorite(wallpaper);
        }
    };

    const handleCategoryPress = (category) => {
        navigation.navigate('CategoryWallpapers', { category });
    };

    const handleSeeMore = (section) => {
        if (section.category) {
            navigation.navigate('CategoryWallpapers', { category: section.category });
        } else {
            navigation.navigate('Search', { search: section.query });
        }
    };

    const handleWallpaperPress = (wallpaper, wallpapers, index) => {
        navigation.navigate('WallpaperDetail', {
            wallpaper,
            wallpapers,
            initialIndex: index,
        });
    };

    // Horizontal wallpaper card for sections
    const HorizontalWallpaperCard = ({ wallpaper, wallpapers, index }) => (
        <TouchableOpacity
            style={styles.horizontalCard}
            activeOpacity={0.9}
            onPress={() => handleWallpaperPress(wallpaper, wallpapers, index)}
        >
            <LinearGradient
                colors={['#2a2a2a', '#333333', '#2a2a2a']}
                style={[styles.horizontalCardImage, { position: 'absolute' }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <Image
                source={{ uri: wallpaper.src.medium }}
                style={styles.horizontalCardImage}
                resizeMode="cover"
            />
            <TouchableOpacity
                style={styles.horizontalFavoriteBtn}
                onPress={() => toggleFavorite(wallpaper)}
            >
                <Ionicons
                    name={isFavorite(wallpaper.id) ? 'heart' : 'heart-outline'}
                    size={18}
                    color={isFavorite(wallpaper.id) ? theme.error : '#FFF'}
                />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    // Section component
    const WallpaperSection = ({ section }) => {
        const wallpapers = sectionWallpapers[section.id] || [];
        if (wallpapers.length === 0) return null;

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        {section.title}
                    </Text>
                    <TouchableOpacity
                        style={styles.seeMoreBtn}
                        onPress={() => handleSeeMore(section)}
                    >
                        <Text style={[styles.seeAll, { color: theme.primary }]}>See More</Text>
                        <Ionicons name="chevron-forward" size={16} color={theme.primary} />
                    </TouchableOpacity>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                >
                    {wallpapers.map((wallpaper, index) => (
                        <HorizontalWallpaperCard
                            key={wallpaper.id}
                            wallpaper={wallpaper}
                            wallpapers={wallpapers}
                            index={index}
                        />
                    ))}
                </ScrollView>
            </View>
        );
    };

    const styles = createStyles(theme);

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Discover</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.surface }]}>
                            <Ionicons name="search-outline" size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                </View>
                <SkeletonLoader count={6} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.primary}
                    />
                }
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Discover</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: theme.surface }]}
                            onPress={() => navigation.navigate('Search')}
                        >
                            <Ionicons name="search-outline" size={20} color={theme.text} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: theme.surface }]}
                            onPress={() => navigation.navigate('Settings')}
                        >
                            <Ionicons name="settings-outline" size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Categories Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            Categories
                        </Text>
                        <TouchableOpacity
                            style={styles.seeMoreBtn}
                            onPress={() => navigation.navigate('Categories')}
                        >
                            <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
                            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesContainer}
                    >
                        {CATEGORIES.slice(0, 10).map(category => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                onPress={() => handleCategoryPress(category)}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* Themed Sections */}
                {THEMED_SECTIONS.map(section => (
                    <WallpaperSection key={section.id} section={section} />
                ))}

                {/* Featured Section - 2 column grid at bottom */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            Featured Wallpapers
                        </Text>
                    </View>
                    <View style={styles.featuredGrid}>
                        {featuredWallpapers.map((wallpaper, index) => (
                            <View key={wallpaper.id} style={index % 2 === 0 ? styles.cardLeft : styles.cardRight}>
                                <WallpaperCard
                                    wallpaper={wallpaper}
                                    onPress={() => handleWallpaperPress(wallpaper, featuredWallpapers, index)}
                                    onFavorite={() => toggleFavorite(wallpaper)}
                                    isFavorite={isFavorite(wallpaper.id)}
                                />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Bottom padding */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 5,
        paddingBottom: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    seeMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '600',
    },
    categoriesContainer: {
        paddingHorizontal: 16,
    },
    horizontalList: {
        paddingHorizontal: 16,
        gap: 12,
    },
    horizontalCard: {
        width: HORIZONTAL_CARD_WIDTH,
        height: HORIZONTAL_CARD_WIDTH * 1.6,
        borderRadius: 16,
        overflow: 'hidden',
    },
    horizontalCardImage: {
        width: '100%',
        height: '100%',
    },
    horizontalFavoriteBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    featuredGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 8,
    },
    cardLeft: {
        width: '50%',
        paddingLeft: 8,
        paddingRight: 4,
        marginBottom: 8,
    },
    cardRight: {
        width: '50%',
        paddingLeft: 4,
        paddingRight: 8,
        marginBottom: 8,
    },
});
