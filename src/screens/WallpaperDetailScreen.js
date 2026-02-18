import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
    Alert,
    Share,
    StatusBar,
    ActivityIndicator,
    Animated,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import StorageService from '../services/StorageService';
import FavoritesService from '../services/FavoritesService';
import { useLibrary } from '../context/LibraryContext';
import { useAlert } from '../context/AlertContext';
import WallpaperUtils from '../utils/wallpaperUtils';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';

const { width, height } = Dimensions.get('window');
const SCREEN_HEIGHT = Dimensions.get('screen').height;

export default function WallpaperDetailScreen({ navigation, route }) {
    const { wallpaper: initialWallpaper, wallpapers = [], initialIndex = 0, isFromDownloads = false } = route.params;
    const { theme } = useTheme();
    const { user, isGuest } = useAuth();
    const { isFavorite: checkIsFavorite, addFavorite, removeFavorite, addDownload } = useLibrary();
    const { showAlert } = useAlert();
    const insets = useSafeAreaInsets();
    const flatListRef = useRef(null);

    // Use wallpapers array if available, otherwise just the single wallpaper
    const wallpaperList = wallpapers.length > 0 ? wallpapers : [initialWallpaper];

    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [localFavorites, setLocalFavorites] = useState({});
    const [downloading, setDownloading] = useState(false);
    const [applying, setApplying] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const headerAnim = useRef(new Animated.Value(0)).current;
    const uiOpacity = useRef(new Animated.Value(1)).current;

    const currentWallpaper = wallpaperList[currentIndex] || initialWallpaper;

    useEffect(() => {
        // Initialize local favorites state from context
        const favMap = {};
        wallpaperList.forEach(wp => {
            favMap[wp.id] = checkIsFavorite(wp.id);
        });
        setLocalFavorites(favMap);

        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay: 200,
                useNativeDriver: true,
            }),
            Animated.timing(headerAnim, {
                toValue: 1,
                duration: 400,
                delay: 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, [checkIsFavorite]);

    const toggleFullScreen = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newValue = !isFullScreen;
        setIsFullScreen(newValue);

        Animated.timing(uiOpacity, {
            toValue: newValue ? 0 : 1,
            duration: 250,
            useNativeDriver: true,
        }).start();
    };

    const toggleFavorite = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const isFav = localFavorites[currentWallpaper.id];
        const newState = !isFav;

        // Update local state immediately for responsive UI
        setLocalFavorites(prev => ({ ...prev, [currentWallpaper.id]: newState }));

        // Update context (which persists and syncs across screens)
        if (newState) {
            await addFavorite(currentWallpaper);
        } else {
            await removeFavorite(currentWallpaper.id);
        }
    };

    const [showQualityModal, setShowQualityModal] = useState(false);
    const [qualityAction, setQualityAction] = useState(null); // 'download' or 'apply'

    const QUALITY_OPTIONS = [
        { label: 'Original', sub: 'Max Quality', key: 'original' },
        { label: 'High', sub: 'Great for phones', key: 'large' }, // Pexels large2x
        { label: 'Medium', sub: 'Faster download', key: 'medium' }, // Pexels large
        { label: 'Portrait', sub: 'Cropped fit', key: 'portrait' },
    ];

    const openQualityModal = (action) => {
        setQualityAction(action);
        setShowQualityModal(true);
    };

    const handleQualitySelect = async (qualityKey) => {
        setShowQualityModal(false);
        const selectedUrl = currentWallpaper.src[qualityKey];
        if (!selectedUrl) {
            showAlert({ title: 'Error', message: 'Resolution not available', type: 'error' });
            return;
        }

        if (qualityAction === 'download') {
            await performDownload(selectedUrl, qualityKey);
        } else if (qualityAction === 'apply') {
            await performApply(selectedUrl, qualityKey);
        }
    };

    const performDownload = async (url, quality) => {
        setDownloading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            const filename = `pixelforge_${currentWallpaper.id}_${quality}`;
            const localUri = await StorageService.downloadWallpaper(url, filename);

            await WallpaperUtils.saveToPhotos(localUri);

            // Add to downloads in context
            await addDownload(`${filename}.jpg`, localUri);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            showAlert({
                title: 'Downloaded ✓',
                message: 'Saved to Gallery',
                type: 'success',
            });
        } catch (error) {
            console.log(error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showAlert({
                title: 'Failed',
                message: 'Could not download',
                type: 'error',
            });
        } finally {
            setDownloading(false);
        }
    };

    const performApply = async (url, quality) => {
        setApplying(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        let localUri = null;
        try {
            const filename = `pixelforge_${currentWallpaper.id}_${quality}`;
            localUri = await StorageService.downloadWallpaper(url, filename);

            // Apply wallpaper directly without saving to gallery
            console.log('Applying wallpaper from:', localUri);
            await WallpaperUtils.setWallpaper(localUri);

            // Success! Show haptic feedback and alert
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            showAlert({
                title: 'Wallpaper Applied!',
                message: 'The wallpaper has been set successfully.',
                type: 'success',
            });

        } catch (error) {
            console.log('Apply error:', error);
            showAlert({
                title: 'Setup Required',
                message: 'To set this as your wallpaper, please use the Share button and select "Set as Wallpaper" from your apps options or Save the wallpaper to your gallery and set it as your wallpaper from there.',
                confirmText: 'Share Now',
                cancelText: 'Cancel',
                showCancel: true,
                type: 'info',
                onConfirm: async () => {
                    if (localUri && await Sharing.isAvailableAsync()) {
                        await Sharing.shareAsync(localUri);
                    } else {
                        handleShare();
                    }
                },
            });
        } finally {
            setApplying(false);
        }
    };

    const handleDownload = () => {
        if (isFromDownloads) return;
        openQualityModal('download');
    };

    const handleApply = () => {
        openQualityModal('apply');
    };

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            await Share.share({
                message: `Check out this wallpaper by ${currentWallpaper.photographer} 📸`,
                url: currentWallpaper.url,
            });
        } catch (error) { }
    };

    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            const newIndex = viewableItems[0].index;
            if (newIndex !== currentIndex) {
                setCurrentIndex(newIndex);
                Haptics.selectionAsync();
            }
        }
    }, [currentIndex]);

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const renderWallpaperItem = useCallback(({ item }) => (
        <TouchableWithoutFeedback onPress={toggleFullScreen}>
            <View style={styles.wallpaperSlide}>
                <Image
                    // Use portrait or medium for display to save bandwidth/memory
                    source={{ uri: item.src.portrait || item.src.medium }}
                    style={styles.wallpaperImage}
                    resizeMode="cover"
                />
            </View>
        </TouchableWithoutFeedback>
    ), [isFullScreen]);

    const isFavorite = localFavorites[currentWallpaper.id] || false;
    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent
                hidden={isFullScreen}
            />

            {/* Background */}
            <View style={styles.blackBackground} />

            {/* Swipeable Wallpaper Gallery */}
            <FlatList
                ref={flatListRef}
                data={wallpaperList}
                renderItem={renderWallpaperItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={initialIndex}
                getItemLayout={(data, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                bounces={false}
                decelerationRate="fast"
            />

            {/* Top Gradient */}
            <Animated.View style={[styles.topGradient, { opacity: uiOpacity }]} pointerEvents="none">
                <LinearGradient
                    colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
                    style={StyleSheet.absoluteFill}
                    locations={[0, 0.5, 1]}
                />
            </Animated.View>

            {/* Bottom Gradient */}
            <Animated.View style={[styles.bottomGradient, { opacity: uiOpacity }]} pointerEvents="none">
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
                    style={StyleSheet.absoluteFill}
                    locations={[0, 0.4, 1]}
                />
            </Animated.View>

            {/* Header Bar */}
            <Animated.View
                style={[
                    styles.headerBar,
                    {
                        paddingTop: insets.top + 8,
                        opacity: Animated.multiply(headerAnim, uiOpacity),
                    }
                ]}
                pointerEvents={isFullScreen ? 'none' : 'auto'}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                    style={styles.headerBtn}
                >
                    <View style={styles.iconCircle}>
                        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                    </View>
                </TouchableOpacity>


                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={toggleFullScreen}
                        activeOpacity={0.7}
                        style={styles.headerBtn}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons name={isFullScreen ? "contract-outline" : "expand-outline"} size={20} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={toggleFavorite}
                        activeOpacity={0.7}
                        style={styles.headerBtn}
                    >
                        <View style={[styles.iconCircle, isFavorite && styles.favoriteActive]}>
                            <Ionicons
                                name={isFavorite ? 'heart' : 'heart-outline'}
                                size={21}
                                color={isFavorite ? '#FF375F' : '#FFFFFF'}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Fullscreen Exit Hint */}
            {isFullScreen && (
                <View style={styles.fullscreenHint}>
                    <Text style={styles.hintText}>Tap to exit fullscreen</Text>
                </View>
            )}

            {/* Bottom Content */}
            <Animated.View
                style={[
                    styles.bottomContent,
                    {
                        paddingBottom: insets.bottom + 16,
                        opacity: Animated.multiply(fadeAnim, uiOpacity),
                    }
                ]}
                pointerEvents={isFullScreen ? 'none' : 'auto'}
            >
                {/* Photographer Card */}
                <View style={styles.infoCard}>
                    <View style={styles.photographerSection}>
                        <LinearGradient
                            colors={[theme.primary, theme.secondary || '#8B5CF6']}
                            style={styles.avatarGradient}
                        >
                            <Text style={styles.avatarLetter}>
                                {currentWallpaper.photographer.charAt(0).toUpperCase()}
                            </Text>
                        </LinearGradient>

                        <View style={styles.photographerText}>
                            <Text style={styles.photographerName} numberOfLines={1}>
                                {currentWallpaper.photographer}
                            </Text>
                            <View style={styles.metaRow}>
                                {currentWallpaper.width && currentWallpaper.height && <View style={styles.metaBadge}>
                                    <Text style={styles.metaText}>
                                        {currentWallpaper.width} × {currentWallpaper.height}
                                    </Text>
                                </View>}
                                <View style={styles.metaBadge}>
                                    <Text style={styles.metaText}>HD</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.sideButton}
                        onPress={handleApply}
                        disabled={applying}
                        activeOpacity={0.8}
                    >
                        <View style={styles.sideButtonInner}>
                            {applying ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <Ionicons name="phone-portrait-outline" size={22} color="#FFF" />
                            )}
                            <Text style={styles.sideButtonText}>Apply</Text>
                        </View>
                    </TouchableOpacity>

                    {!isFromDownloads && (
                        <TouchableOpacity
                            style={styles.downloadButton}
                            onPress={handleDownload}
                            disabled={downloading}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={[theme.primary, theme.secondary || theme.primary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.downloadGradient}
                            >
                                {downloading ? (
                                    <ActivityIndicator color="#FFF" size={22} />
                                ) : (
                                    <Ionicons name="download-outline" size={24} color="#FFF" />
                                )}
                                <Text style={styles.downloadText}>Download</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                </View>
            </Animated.View>

            {/* Quality Selection Modal */}
            {showQualityModal && (
                <TouchableWithoutFeedback onPress={() => setShowQualityModal(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={[styles.qualityModal, { backgroundColor: theme.surface }]}>
                                <View style={styles.qualityHeader}>
                                    <Text style={[styles.qualityTitle, { color: theme.text }]}>
                                        Select Quality
                                    </Text>
                                    <TouchableOpacity onPress={() => setShowQualityModal(false)}>
                                        <Ionicons name="close" size={24} color={theme.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                                {QUALITY_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.key}
                                        style={styles.qualityOption}
                                        onPress={() => handleQualitySelect(option.key)}
                                    >
                                        <View>
                                            <Text style={[styles.optionLabel, { color: theme.text }]}>
                                                {option.label}
                                            </Text>
                                            <Text style={styles.optionSub}>
                                                {option.sub}
                                            </Text>
                                        </View>
                                        {currentWallpaper.src[option.key] && (
                                            <Ionicons name="arrow-forward" size={20} color={theme.textSecondary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            )}
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    blackBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
    },
    wallpaperSlide: {
        width: width,
        height: SCREEN_HEIGHT,
    },
    wallpaperImage: {
        width: width,
        height: SCREEN_HEIGHT,
    },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 180,
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 380,
    },
    headerBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 10,
    },
    headerBtn: {},
    iconCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    favoriteActive: {
        backgroundColor: 'rgba(255,55,95,0.2)',
        borderColor: 'rgba(255,55,95,0.3)',
    },
    pageIndicator: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    pageText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    fullscreenHint: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    hintText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: '500',
    },
    bottomContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
    },
    infoCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    photographerSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarGradient: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    avatarLetter: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '700',
    },
    photographerText: {
        flex: 1,
    },
    photographerName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: 0.3,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 8,
    },
    metaBadge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    metaText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
    },
    sideButton: {
        flex: 1,
        borderRadius: 18,
        overflow: 'hidden',
    },
    sideButtonInner: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    sideButtonText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
    downloadButton: {
        flex: 1.5,
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    downloadGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderRadius: 18,
    },
    downloadText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
        zIndex: 100,
    },
    qualityModal: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    qualityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    qualityTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    qualityOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(150,150,150,0.1)',
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    optionSub: {
        fontSize: 12,
        color: '#999',
    },
});
