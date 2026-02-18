import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

export default function SettingsScreen({ navigation }) {
    const { theme, themeMode, changeTheme } = useTheme();
    const { user, isGuest, signOut } = useAuth();
    const { showAlert } = useAlert();

    const handleSignOut = () => {
        showAlert({
            title: 'Sign Out',
            message: 'Are you sure you want to sign out?',
            confirmText: 'Sign Out',
            cancelText: 'Cancel',
            showCancel: true,
            type: 'warning',
            onConfirm: async () => {
                try {
                    await signOut();
                } catch (error) {
                    showAlert({ title: 'Error', message: 'Failed to sign out', type: 'error' });
                }
            },
        });
    };

    const handleClearCache = async () => {
        showAlert({
            title: 'Clear Cache',
            message: 'This will remove all downloaded wallpapers. Are you sure?',
            confirmText: 'Clear',
            cancelText: 'Cancel',
            showCancel: true,
            type: 'warning',
            onConfirm: async () => {
                try {
                    const StorageService = (await import('../services/StorageService')).default;
                    await StorageService.clearCache();
                    showAlert({ title: 'Success', message: 'Cache cleared', type: 'success' });
                } catch (error) {
                    showAlert({ title: 'Error', message: 'Failed to clear cache', type: 'error' });
                }
            },
        });
    };

    const SettingItem = ({ icon, label, value, onPress, destructive }) => (
        <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.surface }]}
            onPress={onPress}
        >
            <View style={styles.settingLeft}>
                <Ionicons name={icon} size={24} color={destructive ? theme.error : theme.text} />
                <Text style={[styles.settingLabel, { color: destructive ? theme.error : theme.text }]}>
                    {label}
                </Text>
            </View>
            {value && (
                <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
                    {value}
                </Text>
            )}
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
    );

    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    {!isGuest && user && (
                        <>
                            <SettingItem
                                icon="person-outline"
                                label="Profile"
                                onPress={() => {/* Navigate to profile edit */ }}
                            />
                            <SettingItem
                                icon="lock-closed-outline"
                                label="Change Password"
                                onPress={() => {/* Navigate to change password */ }}
                            />
                        </>
                    )}
                    <SettingItem
                        icon="log-out-outline"
                        label={isGuest ? 'Exit Guest Mode' : 'Sign Out'}
                        onPress={handleSignOut}
                        destructive
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Storage</Text>
                    <SettingItem
                        icon="trash-outline"
                        label="Clear Cache"
                        onPress={handleClearCache}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <SettingItem
                        icon="information-circle-outline"
                        label="Version"
                        value="1.0.0"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="document-text-outline"
                        label="Privacy Policy"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="shield-checkmark-outline"
                        label="Terms of Service"
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
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.textSecondary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        marginLeft: 16,
    },
    settingValue: {
        fontSize: 14,
        marginRight: 8,
    },
    themeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    themeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    themeLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
});
