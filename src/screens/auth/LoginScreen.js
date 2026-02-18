import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import AuthService from '../../services/AuthService';

export default function LoginScreen({ navigation }) {
    const { theme } = useTheme();
    const { enableGuestMode } = useAuth();
    const { showAlert } = useAlert();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            showAlert({
                title: 'Error',
                message: 'Please fill in all fields',
                type: 'error',
            });
            return;
        }

        setLoading(true);
        try {
            await AuthService.signInWithEmail(email, password);
            // Navigation will happen automatically via AuthContext
        } catch (error) {
            showAlert({
                title: 'Login Failed',
                message: error.message,
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGuestMode = async () => {
        try {
            await enableGuestMode();
        } catch (error) {
            showAlert({
                title: 'Error',
                message: 'Failed to enable guest mode',
                type: 'error',
            });
        }
    };

    const styles = createStyles(theme);

    return (
        <LinearGradient
            colors={[theme.primary, theme.secondary]}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.logo}>🎨</Text>
                        <Text style={styles.title}>PixelForge</Text>
                        <Text style={styles.subtitle}>Create & Discover Wallpapers</Text>
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

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={theme.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                    size={20}
                                    color={theme.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('ForgotPassword')}
                            style={styles.forgotPasswordContainer}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={theme.primary} />
                            ) : (
                                <Text style={styles.loginButtonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.signupLink}
                            onPress={() => navigation.navigate('Signup')}
                        >
                            <Text style={styles.signupText}>
                                Don't have an account? <Text style={styles.signupTextBold}>Sign Up</Text>
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity
                            style={styles.guestButton}
                            onPress={handleGuestMode}
                        >
                            <Ionicons name="person-outline" size={20} color={theme.text} />
                            <Text style={styles.guestButtonText}>Continue as Guest</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    form: {
        backgroundColor: theme.surface,
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.background,
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 16,
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: theme.border,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: theme.text,
    },
    loginButton: {
        backgroundColor: theme.primary,
        borderRadius: 50,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 8,
        elevation: 4,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    signupLink: {
        alignItems: 'center',
        marginTop: 16,
    },
    signupText: {
        color: theme.textSecondary,
        fontSize: 14,
    },
    signupTextBold: {
        color: theme.primary,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.border,
    },
    dividerText: {
        marginHorizontal: 16,
        color: theme.textSecondary,
        fontSize: 14,
    },
    guestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.surfaceVariant,
        borderRadius: 50,
        paddingVertical: 16,
        borderWidth: 1.5,
        borderColor: theme.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    guestButtonText: {
        color: theme.text,
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
});
