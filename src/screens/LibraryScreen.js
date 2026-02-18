import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLibrary } from '../context/LibraryContext';
import { Ionicons } from '@expo/vector-icons';
import WallpaperCard from '../components/common/WallpaperCard';
import EmptyState from '../components/common/EmptyState';

export default function LibraryScreen({ navigation }) {
    const { theme } = useTheme();
    const { favorites, downloads, loading, removeFavorite, isFavorite } = useLibrary();
    const [activeTab, setActiveTab] = React.useState('favorites');

    const tabs = [
        { id: 'favorites', label: 'Favorites', icon: 'heart' },
        { id: 'downloads', label: 'Downloads', icon: 'download' },
    ];

    const handleRemoveFavorite = async (itemId) => {
        await removeFavorite(itemId);
    };

    const renderContent = () => {
        const items = activeTab === 'favorites' ? favorites : downloads;

        if (items.length === 0) {
            return (
                <EmptyState
                    icon={activeTab === 'favorites' ? 'heart-outline' : 'download-outline'}
                    title={activeTab === 'favorites' ? 'No Favorites Yet' : 'No Downloads Yet'}
                    message={
                        activeTab === 'favorites'
                            ? 'Wallpapers you love will appear here'
                            : 'Downloaded wallpapers will appear here'
                    }
                />
            );
        }

        // For downloads, the structure is different (name, uri instead of Pexels structure)
        if (activeTab === 'downloads') {
            return (
                <ScrollView
                    contentContainerStyle={styles.gridContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.grid}>
                        {items.map((item, index) => {
                            // Convert download item to wallpaper-like structure
                            const downloadItem = {
                                id: item.name || `download-${index}`,
                                src: {
                                    medium: item.uri,
                                    large: item.uri,
                                    large2x: item.uri,
                                    original: item.uri,
                                },
                                photographer: 'Downloaded',
                            };
                            return (
                                <View key={item.name || index} style={index % 2 === 0 ? styles.cardLeft : styles.cardRight}>
                                    <WallpaperCard
                                        wallpaper={downloadItem}
                                        onPress={() => navigation.navigate('WallpaperDetail', {
                                            wallpaper: downloadItem,
                                            wallpapers: items.map((d, i) => ({
                                                id: d.name || `download-${i}`,
                                                src: { medium: d.uri, large: d.uri, large2x: d.uri, original: d.uri },
                                                photographer: 'Downloaded',
                                            })),
                                            initialIndex: index,
                                            isFromDownloads: true,
                                        })}
                                        isFavorite={false}
                                    />
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            );
        }

        return (
            <ScrollView
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.grid}>
                    {items.map((item, index) => (
                        <View key={item.id || index} style={index % 2 === 0 ? styles.cardLeft : styles.cardRight}>
                            <WallpaperCard
                                wallpaper={item}
                                onPress={() => navigation.navigate('WallpaperDetail', {
                                    wallpaper: item,
                                    wallpapers: items,
                                    initialIndex: index,
                                })}
                                onFavorite={() => handleRemoveFavorite(item.id)}
                                isFavorite={true}
                            />
                        </View>
                    ))}
                </View>
            </ScrollView>
        );
    };

    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Library</Text>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <Ionicons name="settings-outline" size={22} color={theme.text} />
                </TouchableOpacity>
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tab,
                            activeTab === tab.id && styles.activeTab,
                        ]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Ionicons
                            name={activeTab === tab.id ? tab.icon : `${tab.icon}-outline`}
                            size={20}
                            color={activeTab === tab.id ? theme.primary : theme.textSecondary}
                        />
                        <Text
                            style={[
                                styles.tabText,
                                { color: activeTab === tab.id ? theme.primary : theme.textSecondary },
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                renderContent()
            )}
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.text,
    },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabBar: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: theme.surface,
        gap: 8,
    },
    activeTab: {
        backgroundColor: `${theme.primary}20`,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridContainer: {
        flexGrow: 1,
        paddingBottom: 120,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cardLeft: {
        width: '50%',
        paddingLeft: 16,
        paddingRight: 6,
        marginBottom: 12,
    },
    cardRight: {
        width: '50%',
        paddingLeft: 6,
        paddingRight: 16,
        marginBottom: 12,
    },
});
