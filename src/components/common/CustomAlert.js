import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const CustomAlert = ({
    visible,
    title,
    message,
    type = 'info', // 'success', 'error', 'warning', 'info'
    onClose,
    onConfirm,
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = false,
    theme,
}) => {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return { name: 'checkmark-circle', color: '#4CAF50' };
            case 'error':
                return { name: 'close-circle', color: '#F44336' };
            case 'warning':
                return { name: 'warning', color: '#FF9800' };
            default:
                return { name: 'information-circle', color: theme?.primary || '#667EEA' };
        }
    };

    const icon = getIcon();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme?.surface || '#1a1a2e' }]}>
                    {/* Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
                        <Ionicons name={icon.name} size={40} color={icon.color} />
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: theme?.text || '#FFF' }]}>
                        {title}
                    </Text>

                    {/* Message */}
                    {message && (
                        <Text style={[styles.message, { color: theme?.textSecondary || '#AAA' }]}>
                            {message}
                        </Text>
                    )}

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        {showCancel && (
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton, { borderColor: theme?.border || '#333' }]}
                                onPress={onClose}
                            >
                                <Text style={[styles.cancelButtonText, { color: theme?.textSecondary || '#AAA' }]}>
                                    {cancelText}
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.confirmButton,
                                { backgroundColor: icon.color },
                                showCancel && { flex: 1 }
                            ]}
                            onPress={onConfirm || onClose}
                        >
                            <Text style={styles.confirmButtonText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: width - 48,
        maxWidth: 340,
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        elevation: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    confirmButton: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    confirmButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFF',
    },
});

export default CustomAlert;
