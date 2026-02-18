import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const { height } = Dimensions.get('window');

const SIZES = [
    { id: 'all', label: 'All' },
    { id: 'large', label: 'Large 4K' },
    { id: 'medium', label: 'Medium' },
    { id: 'small', label: 'Small' },
];

const COLORS = [
    { id: 'red', color: '#FF4458', label: 'Red' },
    { id: 'orange', color: '#FF9F0A', label: 'Orange' },
    { id: 'yellow', color: '#FFD60A', label: 'Yellow' },
    { id: 'green', color: '#32D74B', label: 'Green' },
    { id: 'turquoise', color: '#64D2FF', label: 'Turquoise' },
    { id: 'blue', color: '#0A84FF', label: 'Blue' },
    { id: 'violet', color: '#BF5AF2', label: 'Violet' },
    { id: 'pink', color: '#FF375F', label: 'Pink' },
    { id: 'brown', color: '#AC8E68', label: 'Brown' },
    { id: 'black', color: '#000000', label: 'Black' },
    { id: 'gray', color: '#8E8E93', label: 'Gray' },
    { id: 'white', color: '#FFFFFF', label: 'White' },
];

export default function FilterModal({ visible, onClose, onApply, initialFilters }) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const [size, setSize] = useState(initialFilters?.size || 'all');
    const [selectedColor, setSelectedColor] = useState(initialFilters?.color || null);

    const handleApply = () => {
        onApply({
            size: size === 'all' ? null : size,
            color: selectedColor,
        });
        onClose();
    };

    const handleClear = () => {
        setSize('all');
        setSelectedColor(null);
    };

    const styles = createStyles(theme, insets);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Filters</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContent}>
                        {/* Size Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Size</Text>
                            <View style={styles.optionsGrid}>
                                {SIZES.map(opt => (
                                    <TouchableOpacity
                                        key={opt.id}
                                        style={[
                                            styles.optionChip,
                                            size === opt.id && styles.optionChipActive,
                                        ]}
                                        onPress={() => setSize(opt.id)}
                                    >
                                        <Text style={[
                                            styles.optionLabel,
                                            size === opt.id && styles.optionLabelActive
                                        ]}>
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Color Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Color</Text>
                            <View style={styles.colorsGrid}>
                                {COLORS.map(col => (
                                    <TouchableOpacity
                                        key={col.id}
                                        style={[
                                            styles.colorOption,
                                            selectedColor === col.id && styles.colorOptionActive,
                                        ]}
                                        onPress={() => setSelectedColor(selectedColor === col.id ? null : col.id)}
                                    >
                                        <View style={[styles.colorCircle, { backgroundColor: col.color }]} />
                                        {selectedColor === col.id && (
                                            <View style={styles.checkIcon}>
                                                <Ionicons
                                                    name="checkmark"
                                                    size={16}
                                                    color={col.id === 'white' ? '#000' : '#FFF'}
                                                />
                                            </View>
                                        )}
                                        <Text style={styles.colorLabel}>{col.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={handleClear}
                        >
                            <Text style={styles.resetText}>Reset</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={handleApply}
                        >
                            <Text style={styles.applyText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const createStyles = (theme, insets) => StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    content: {
        backgroundColor: theme.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: insets.bottom,
        maxHeight: height * 0.8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.text,
    },
    closeButton: {
        padding: 4,
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.text,
        marginBottom: 12,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
    },
    optionChipActive: {
        backgroundColor: theme.primary,
        borderColor: theme.primary,
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.text,
    },
    optionLabelActive: {
        color: '#FFFFFF',
    },
    colorsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorOption: {
        alignItems: 'center',
        gap: 6,
        width: '22%',
        marginBottom: 8,
    },
    colorCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    colorOptionActive: {
        transform: [{ scale: 1.1 }],
    },
    checkIcon: {
        position: 'absolute',
        top: 12,
        left: 27, // Centered roughly
    },
    colorLabel: {
        fontSize: 12,
        color: theme.textSecondary,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: theme.border,
    },
    resetButton: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        backgroundColor: theme.surface,
    },
    resetText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.text,
    },
    applyButton: {
        flex: 2,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        backgroundColor: theme.primary,
    },
    applyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
