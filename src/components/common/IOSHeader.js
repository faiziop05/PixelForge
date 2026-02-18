import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

export default function IOSHeader({ title, subtitle, rightComponent }) {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
            <LinearGradient
                colors={[theme.surface, theme.background]}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />
            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                    {subtitle && (
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            {subtitle}
                        </Text>
                    )}
                </View>
                {rightComponent && (
                    <View style={styles.rightContainer}>{rightComponent}</View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
        letterSpacing: 0.4,
    },
    subtitle: {
        fontSize: 15,
        marginTop: 4,
    },
    rightContainer: {
        marginLeft: 16,
    },
});
