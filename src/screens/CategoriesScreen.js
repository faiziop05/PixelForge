import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const CARD_MARGIN = 8;

export default function CategoriesScreen({ navigation }) {
    const { theme } = useTheme();
    const { CATEGORIES } = require('../constants/categories');

    const CategoryChip = ({ category }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('CategoryWallpapers', {
                category: category
            })}
            activeOpacity={0.8}
            style={styles.chipWrapper}
        >
            <View
                style={styles.chip}
            >
                <Text style={styles.chipText}>{category.name}</Text>
            </View>
        </TouchableOpacity>
    );

    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >

                {/* Categories Grid */}
                <View style={styles.grid}>
                    {CATEGORIES.map(category => (
                        <CategoryChip key={category.id} category={category} />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: CARD_MARGIN,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    chipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.2,
    },
});
