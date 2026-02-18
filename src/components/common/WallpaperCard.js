import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function WallpaperCard({ wallpaper, onPress, onFavorite, isFavorite }) {
    const { theme } = useTheme();

    return (
        <Pressable onPress={onPress} activeOpacity={0.9}>
            <View style={styles.card}>
                <LinearGradient
                    colors={['#2a2a2a', '#333333', '#2a2a2a']}
                    style={[styles.image, { position: 'absolute' }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <Image
                    source={{ uri: wallpaper.src.medium }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradient}
                />
                <TouchableOpacity
                    style={[styles.favoriteButton, { backgroundColor: theme.surface }]}
                    onPress={onFavorite}
                >
                    <Ionicons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isFavorite ? '#FF4458' : theme.text}
                    />
                </TouchableOpacity>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.6,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    image: {
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
    },
    favoriteButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
});
