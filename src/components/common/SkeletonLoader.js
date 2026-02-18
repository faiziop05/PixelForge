import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function SkeletonLoader({ count = 6 }) {
    return (
        <View style={styles.container}>
            {Array.from({ length: count }).map((_, index) => (
                <View key={index} style={styles.card}>
                    <LinearGradient
                        colors={['#2a2a2a', '#333333', '#2a2a2a']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    />
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.6,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
    },
    gradient: {
        width: '100%',
        height: '100%',
    },
});
