import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';

export default function CategoryCard({ category, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
            <View
                style={styles.card}
            >
                <Text style={styles.name}>{category.name}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 14,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    name: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: 0.3,
    },
});
