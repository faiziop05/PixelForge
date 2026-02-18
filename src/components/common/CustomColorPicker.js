import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

const CustomColorPicker = ({ visible, onClose, onSelectColor, initialColor = '#667EEA', theme }) => {
    // Helper to convert hex to rgb
    const hexToRgb = (hex) => {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null; // Return null if invalid
    };

    // Helper to convert rgb to hex
    const rgbToHex = (r, g, b) => {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    };

    const [rgb, setRgb] = useState(hexToRgb(initialColor) || { r: 102, g: 126, b: 234 });
    const [hex, setHex] = useState(initialColor);

    // Update local state when initialColor changes
    useEffect(() => {
        if (visible) {
            const newRgb = hexToRgb(initialColor);
            if (newRgb) setRgb(newRgb);
            setHex(initialColor);
        }
    }, [visible, initialColor]);

    // Handle slider changes
    const updateColor = (key, value) => {
        const newRgb = { ...rgb, [key]: Math.round(value) };
        setRgb(newRgb);
        setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    };

    // Handle manual hex input
    const handleHexChange = (text) => {
        setHex(text);
        // Valid hex (3 or 6 digits)
        const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(text);
        if (isValidHex) {
            const newRgb = hexToRgb(text);
            if (newRgb) setRgb(newRgb);
        }
    };

    const handleConfirm = () => {
        onSelectColor(hex);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.surface }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>Pick a Color</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Color Preview */}
                    <View style={[styles.preview, { backgroundColor: hex }]} />

                    {/* RGB Sliders */}
                    <View style={styles.slidersContainer}>
                        {/* Red Slider */}
                        <View style={styles.sliderRow}>
                            <Text style={[styles.sliderLabel, { color: '#FF5252' }]}>R</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={255}
                                value={rgb.r}
                                onValueChange={(val) => updateColor('r', val)}
                                minimumTrackTintColor="#FF5252"
                                maximumTrackTintColor={theme.border}
                                thumbTintColor="#FF5252"
                            />
                            <Text style={[styles.valueText, { color: theme.text }]}>{rgb.r}</Text>
                        </View>

                        {/* Green Slider */}
                        <View style={styles.sliderRow}>
                            <Text style={[styles.sliderLabel, { color: '#4CAF50' }]}>G</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={255}
                                value={rgb.g}
                                onValueChange={(val) => updateColor('g', val)}
                                minimumTrackTintColor="#4CAF50"
                                maximumTrackTintColor={theme.border}
                                thumbTintColor="#4CAF50"
                            />
                            <Text style={[styles.valueText, { color: theme.text }]}>{rgb.g}</Text>
                        </View>

                        {/* Blue Slider */}
                        <View style={styles.sliderRow}>
                            <Text style={[styles.sliderLabel, { color: '#448AFF' }]}>B</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={255}
                                value={rgb.b}
                                onValueChange={(val) => updateColor('b', val)}
                                minimumTrackTintColor="#448AFF"
                                maximumTrackTintColor={theme.border}
                                thumbTintColor="#448AFF"
                            />
                            <Text style={[styles.valueText, { color: theme.text }]}>{rgb.b}</Text>
                        </View>
                    </View>

                    {/* Hex Input */}
                    <View style={styles.hexRow}>
                        <Text style={[styles.hexLabel, { color: theme.textSecondary }]}>HEX:</Text>
                        <TextInput
                            style={[styles.hexInput, {
                                borderColor: theme.border,
                                color: theme.text,
                                backgroundColor: theme.background
                            }]}
                            value={hex}
                            onChangeText={handleHexChange}
                            placeholder="#000000"
                            placeholderTextColor={theme.textSecondary}
                            autoCapitalize="characters"
                            maxLength={7}
                        />
                    </View>

                    {/* Common Colors Palette */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.palette}>
                        {['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#FFFFFF', '#000000', '#FFA500', '#800080', '#008080'].map((color) => (
                            <TouchableOpacity
                                key={color}
                                style={[styles.paletteColor, { backgroundColor: color }]}
                                onPress={() => {
                                    setHex(color);
                                    setRgb(hexToRgb(color));
                                }}
                            />
                        ))}
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.confirmBtn, { backgroundColor: theme.primary }]}
                        onPress={handleConfirm}
                    >
                        <Text style={styles.confirmText}>Select Color</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    preview: {
        height: 80,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    slidersContainer: {
        gap: 16,
        marginBottom: 24,
    },
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    sliderLabel: {
        fontSize: 16,
        fontWeight: '700',
        width: 20,
    },
    slider: {
        flex: 1,
        height: 40,
    },
    valueText: {
        fontSize: 14,
        fontWeight: '600',
        width: 30,
        textAlign: 'right',
    },
    hexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    hexLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    hexInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        fontFamily: 'monospace',
    },
    palette: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    paletteColor: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    confirmBtn: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    confirmText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CustomColorPicker;
