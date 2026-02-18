import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAlert } from '../../context/AlertContext';
import AuthService from '../../services/AuthService';

export default function ForgotPasswordScreen({ navigation }) {
    const { theme } = useTheme();
    const { showAlert } = useAlert();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            showAlert({
                title: 'Error',
                message: 'Please enter your email address',
                type: 'error',
            });
            return;
        }

        setLoading(true);
        try {
            await AuthService.sendPasswordResetEmail(email);
            showAlert({
                title: 'Email Sent',
                message: 'Check your email for a link to reset your password.',
                type: 'success',
                onConfirm: () => navigation.navigate('Login'),
            });
        } catch (error) {
            showAlert({
                title: 'Error',
                message: error.message,
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const styles = createStyles(theme);

    return (
        <LinearGradient
            colors={[theme.primary, theme.secondary]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.emoji}>🔐</Text>
                            <Text style={styles.title}>Reset Password</Text>
                            <Text style={styles.subtitle}>
                                Enter your email to receive a reset link
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color={theme.textSecondary} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    placeholderTextColor={theme.textSecondary}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={handleResetPassword}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.resetButtonText}>Send Reset Link</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    backButton: {
        padding: 16,
        marginLeft: 4,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    emoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    form: {
        width: '100%',
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.background,
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 16,
        // height removed to match LoginScreen's flexible sizing
        borderWidth: 1.5,
        borderColor: theme.border,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        color: theme.text,
        fontSize: 16,
    },
    resetButton: {
        backgroundColor: theme.primary,
        borderRadius: 50,
        height: null,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        elevation: 4,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    resetButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
