import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AuthService from '../services/AuthService';

export default function ProfileScreen({ navigation }) {
    const { theme } = useTheme();
    const { user, isGuest, signOut } = useAuth();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (user && !isGuest) {
            loadProfile();
        }
    }, [user]);

    const loadProfile = async () => {
        try {
            const data = await AuthService.getUserProfile(user.uid);
            setProfile(data);
        } catch (error) {
            console.log('Error loading profile:', error);
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to sign out');
                        }
                    },
                },
            ]
        );
    };

    const MenuItem = ({ icon, label, value, onPress }) => (
        <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.surface }]}
            onPress={onPress}
        >
            <View style={styles.menuLeft}>
                <Ionicons name={icon} size={24} color={theme.text} />
                <Text style={[styles.menuLabel, { color: theme.text }]}>{label}</Text>
            </View>
            {value && (
                <Text style={[styles.menuValue, { color: theme.textSecondary }]}>{value}</Text>
            )}
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
    );

    const styles = createStyles(theme);

    if (isGuest) {
        return (
            <View style={styles.container}>
                <View style={styles.guestContainer}>
                    <Ionicons name="person-circle-outline" size={100} color={theme.textSecondary} />
                    <Text style={[styles.guestTitle, { color: theme.text }]}>
                        Guest Mode
                    </Text>
                    <Text style={[styles.guestMessage, { color: theme.textSecondary }]}>
                        Sign in to sync your favorites, projects, and settings across devices
                    </Text>
                    <TouchableOpacity
                        style={[styles.signInButton, { backgroundColor: theme.primary }]}
                        onPress={handleSignOut}
                    >
                        <Text style={styles.signInButtonText}>Sign In</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.menu}>
                    <MenuItem
                        icon="settings-outline"
                        label="Settings"
                        onPress={() => navigation.navigate('Settings')}
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        {user?.photoURL ? (
                            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
                                <Text style={styles.avatarText}>
                                    {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.name, { color: theme.text }]}>
                        {user?.displayName || 'User'}
                    </Text>
                    <Text style={[styles.email, { color: theme.textSecondary }]}>
                        {user?.email}
                    </Text>
                </View>

                <View style={styles.stats}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.text }]}>0</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Projects</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.text }]}>0</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Favorites</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.text }]}>0</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Downloads</Text>
                    </View>
                </View>

                <View style={styles.menu}>
                    <MenuItem
                        icon="folder-outline"
                        label="My Projects"
                        onPress={() => navigation.navigate('Projects')}
                    />
                    <MenuItem
                        icon="images-outline"
                        label="My Collections"
                        onPress={() => navigation.navigate('Collections')}
                    />
                    <MenuItem
                        icon="settings-outline"
                        label="Settings"
                        onPress={() => navigation.navigate('Settings')}
                    />
                    <MenuItem
                        icon="help-circle-outline"
                        label="Help & Support"
                        onPress={() => { }}
                    />
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
    scrollContent: {
        paddingBottom: 150,
    },
    guestContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    guestTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 12,
    },
    guestMessage: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    signInButton: {
        paddingHorizontal: 48,
        paddingVertical: 18,
        borderRadius: 50,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    signInButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 32,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 24,
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
    },
    menu: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 20,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuLabel: {
        fontSize: 16,
        marginLeft: 16,
    },
    menuValue: {
        fontSize: 14,
        marginRight: 8,
    },
});
