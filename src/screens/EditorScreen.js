import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Dimensions,
    Modal,
    FlatList,
    StatusBar,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useEditor, CANVAS_PRESETS } from '../context/EditorContext';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Rect } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import EditorService from '../services/EditorService';
import CustomColorPicker from '../components/common/CustomColorPicker';
import { useAlert } from '../context/AlertContext';
import Slider from '@react-native-community/slider';

const { width, height } = Dimensions.get('window');
const CANVAS_WIDTH = width * 0.85;
const CANVAS_HEIGHT = CANVAS_WIDTH * (16 / 9);

const DIRECTIONS = [
    { id: 'top-bottom', name: 'Vertical', start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 }, icon: 'arrow-down-outline' },
    { id: 'left-right', name: 'Horizontal', start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 }, icon: 'arrow-forward-outline' },
    { id: 'diagonal-tl-br', name: 'Diagonal 1', start: { x: 0, y: 0 }, end: { x: 1, y: 1 }, icon: 'resize-outline' },
    { id: 'diagonal-tr-bl', name: 'Diagonal 2', start: { x: 1, y: 0 }, end: { x: 0, y: 1 }, icon: 'resize-outline' },
];

const GRADIENT_PRESETS = [
    { id: 'p1', name: 'Aurora', colors: ['#00c6ff', '#0072ff', '#00c6ff'], locations: [0, 0.5, 1] },
    { id: 'p2', name: 'Magic Hour', colors: ['#FF512F', '#DD2476', '#FF8C00', '#F09819'], locations: [0, 0.4, 0.7, 1] },
    { id: 'p3', name: 'Deep Space', colors: ['#141E30', '#243B55', '#141E30'], locations: [0, 0.5, 1] },
    { id: 'p4', name: 'Lush Life', colors: ['#56ab2f', '#a8e063', '#243B55'], locations: [0, 0.6, 1] },
    { id: 'p5', name: 'Metropolis', colors: ['#232526', '#414345', '#000000'], locations: [0, 0.5, 1] },
    { id: 'p6', name: 'Hyperlink', colors: ['#0575E6', '#021B79', '#0575E6'], locations: [0, 0.5, 1] },
    { id: 'p7', name: 'Candy Floss', colors: ['#ff9a9e', '#fecfef', '#abecd6'], locations: [0, 0.5, 1] },
    { id: 'p8', name: 'Gold Rush', colors: ['#BF953F', '#FCF6BA', '#B38728', '#FBF5B7', '#AA771C'], locations: [0, 0.2, 0.5, 0.8, 1] },
];

const SOLID_PRESETS = [
    { id: 's1', name: 'Pure Black', color: '#000000' },
    { id: 's2', name: 'Pure White', color: '#FFFFFF' },
    { id: 's3', name: 'Midnight', color: '#1a1a2e' },
    { id: 's4', name: 'Ocean Blue', color: '#0077B6' },
    { id: 's5', name: 'Forest', color: '#2d5a27' },
    { id: 's6', name: 'Crimson', color: '#DC143C' },
    { id: 's7', name: 'Royal Purple', color: '#7B2D8E' },
    { id: 's8', name: 'Warm Gray', color: '#4a4a4a' },
    { id: 's9', name: 'Coral', color: '#FF6F61' },
    { id: 's10', name: 'Teal', color: '#008080' },
];

export default function EditorScreen({ navigation, route }) {
    const { theme } = useTheme();
    const { user, isGuest } = useAuth();
    const { showAlert } = useAlert();
    const canvasRef = useRef(null);
    const {
        gradient,
        canvasSize,
        currentProject,
        canUndo,
        canRedo,
        updateGradient,
        setCanvasSize,
        undo,
        redo,
        newProject,
        loadProject,
    } = useEditor();

    const [activeTool, setActiveTool] = useState('colors'); // 'colors', 'direction', 'presets'
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [activeColorIndex, setActiveColorIndex] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        if (route.params?.fresh) {
            // Always create a fresh new project
            newProject({ width: 1080, height: 1920 });
        } else if (route.params?.project) {
            loadProject(route.params.project);
        } else if (route.params?.template) {
            const template = route.params.template;
            newProject();
            updateGradient({
                colors: template.colors,
                locations: template.locations || template.colors.map((_, i) => i / (template.colors.length - 1))
            });
        } else if (!currentProject) {
            newProject();
        }
    }, [route.params]);

    const handleUpdateColor = (color) => {
        if (activeColorIndex !== null) {
            const newColors = [...gradient.colors];
            newColors[activeColorIndex] = color;
            updateGradient({ colors: newColors });
        }
    };

    const addColorStop = () => {
        if (gradient.colors.length >= 6) {
            showAlert({ title: 'Limit Reached', message: 'You can have up to 6 colors in one gradient.', type: 'warning' });
            return;
        }
        const lastColor = gradient.colors[gradient.colors.length - 1];
        const newColors = [...gradient.colors, lastColor];

        // Distribute locations evenly
        const newLocations = newColors.map((_, i) => i / (newColors.length - 1));
        updateGradient({ colors: newColors, locations: newLocations });
    };

    const removeColorStop = (index) => {
        if (gradient.colors.length <= 2) {
            showAlert({ title: 'Minimum Reached', message: 'Gradients need at least 2 colors.', type: 'warning' });
            return;
        }
        const newColors = gradient.colors.filter((_, i) => i !== index);
        const newLocations = newColors.map((_, i) => i / (newColors.length - 1));
        updateGradient({ colors: newColors, locations: newLocations });
    };

    const handleRandomize = () => {
        const randomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        const numColors = 2 + Math.floor(Math.random() * 3); // 2-4 colors
        const colors = Array.from({ length: numColors }, randomHex);
        const locations = colors.map((_, i) => i / (colors.length - 1));
        updateGradient({ colors, locations });
    };

    const handleSaveProject = async () => {
        try {
            const projectName = currentProject?.name || `Gradient ${new Date().toLocaleDateString()}`;

            const projectToSave = {
                id: currentProject?.id || Date.now().toString(),
                name: projectName,
                gradient: gradient,
                canvasSize: canvasSize,
                createdAt: currentProject?.createdAt || new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
            };

            if (isGuest) {
                await EditorService.saveLocalProject(projectToSave);
            } else if (user) {
                await EditorService.saveFirebaseProject(user.uid, projectToSave);
            }

            showAlert({ title: 'Saved ✓', message: 'Project saved to your projects!', type: 'success' });
        } catch (error) {
            console.log('Save error:', error);
            showAlert({ title: 'Error', message: 'Failed to save project', type: 'error' });
        }
    };

    const handleExport = async () => {
        if (!canvasRef.current) return;
        try {
            setIsExporting(true);
            const { status } = await MediaLibrary.requestPermissionsAsync(true); // true for writeOnly in older API, or { writeOnly: true } in newer
            // Actually, in Expo SDK 51+, it's suggested to just use { writeOnly: true }
            // Let's use the object syntax for clarity and compatibility
            // const { status } = await MediaLibrary.requestPermissionsAsync({ writeOnly: true });
            // However, looking at expo-media-library docs, for SDK 50/51 it often takes a boolean for writeOnly.
            // Let's check the current status and request if needed.
            const { status: currentStatus } = await MediaLibrary.getPermissionsAsync(true);
            let finalStatus = currentStatus;

            if (currentStatus !== 'granted') {
                const { status: newStatus } = await MediaLibrary.requestPermissionsAsync(true);
                finalStatus = newStatus;
            }

            if (finalStatus !== 'granted') {
                showAlert({ title: 'Permission Required', message: 'Please allow access to save images', type: 'warning' });
                return;
            }
            const uri = await captureRef(canvasRef, {
                format: 'png',
                quality: 1,
            });
            await MediaLibrary.saveToLibraryAsync(uri);
            showAlert({ title: 'Success ✓', message: 'High-quality gradient saved to your gallery.', type: 'success' });
        } catch (error) {
            console.log('Export error:', error);
            showAlert({ title: 'Error', message: 'Failed to export gradient', type: 'error' });
        } finally {
            setIsExporting(false);
        }
    };

    const styles = createStyles(theme);

    // Calculate canvas dimensions based on selected preset
    const aspectRatio = canvasSize.width / canvasSize.height;
    const maxCanvasWidth = width * 0.9;
    const maxCanvasHeight = height * 0.5;

    let displayWidth, displayHeight;
    if (aspectRatio >= 1) {
        // Landscape or square
        displayWidth = Math.min(maxCanvasWidth, maxCanvasHeight * aspectRatio);
        displayHeight = displayWidth / aspectRatio;
    } else {
        // Portrait
        displayHeight = Math.min(maxCanvasHeight, maxCanvasWidth / aspectRatio);
        displayWidth = displayHeight * aspectRatio;
    }

    // Render background based on type
    const renderBackground = () => {
        if (gradient.type === 'solid') {
            return (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: gradient.colors[0] }]} />
            );
        } else if (gradient.type === 'linear') {
            return (
                <LinearGradient
                    colors={gradient.colors}
                    locations={gradient.locations}
                    start={gradient.start}
                    end={gradient.end}
                    style={StyleSheet.absoluteFill}
                />
            );
        } else {
            // Radial
            return (
                <Svg height="100%" width="100%" viewBox={`0 0 ${displayWidth} ${displayHeight}`}>
                    <Defs>
                        <SvgRadialGradient
                            id="grad"
                            cx="50%"
                            cy="50%"
                            rx="50%"
                            ry="50%"
                            fx="50%"
                            fy="50%"
                            gradientUnits="userSpaceOnUse"
                        >
                            {gradient.colors.map((color, index) => (
                                <Stop
                                    key={index}
                                    offset={gradient.locations[index]}
                                    stopColor={color}
                                    stopOpacity="1"
                                />
                            ))}
                        </SvgRadialGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
                </Svg>
            );
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#000000"
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={undo}
                        disabled={!canUndo}
                        style={[styles.headerBtn, !canUndo && styles.disabledBtn]}
                    >
                        <Ionicons name="arrow-undo" size={20} color={canUndo ? theme.text : theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={redo}
                        disabled={!canRedo}
                        style={[styles.headerBtn, !canRedo && styles.disabledBtn]}
                    >
                        <Ionicons name="arrow-redo" size={20} color={canRedo ? theme.text : theme.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.headerRight}>
                    {/* Save Project Button */}
                    <TouchableOpacity
                        onPress={handleSaveProject}
                        style={[styles.headerBtn, { marginRight: 8 }]}
                    >
                        <Ionicons name="bookmark-outline" size={22} color={theme.text} />
                    </TouchableOpacity>

                    {/* Export to Gallery Button */}
                    <TouchableOpacity
                        onPress={handleExport}
                        disabled={isExporting}
                        style={styles.exportBtn}
                    >
                        <LinearGradient
                            colors={[theme.primary, theme.secondary || theme.primary]}
                            style={styles.exportGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="download-outline" size={18} color="#FFF" />
                            <Text style={styles.exportText}>{isExporting ? '...' : 'Export'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Canvas Area */}
            <View style={styles.canvasWrapper}>
                <View
                    ref={canvasRef}
                    style={[
                        styles.canvas,
                        {
                            width: displayWidth,
                            height: displayHeight,
                        }
                    ]}
                >
                    {renderBackground()}
                </View>
            </View>

            {/* Toolbar Area */}
            <View style={[styles.toolbar, { backgroundColor: theme.surface }]}>
                {/* Tool Selection */}
                <View style={styles.toolTabs}>
                    <TouchableOpacity
                        onPress={() => setActiveTool('type')}
                        style={[styles.toolTab, activeTool === 'type' && styles.activeTab]}
                    >
                        <Ionicons name="options" size={20} color={activeTool === 'type' ? theme.primary : theme.textSecondary} />
                        <Text style={[styles.tabLabel, activeTool === 'type' && styles.activeTabLabel]}>Type</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTool('colors')}
                        style={[styles.toolTab, activeTool === 'colors' && styles.activeTab]}
                    >
                        <Ionicons name="color-palette" size={20} color={activeTool === 'colors' ? theme.primary : theme.textSecondary} />
                        <Text style={[styles.tabLabel, activeTool === 'colors' && styles.activeTabLabel]}>Colors</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTool('direction')}
                        style={[styles.toolTab, activeTool === 'direction' && styles.activeTab]}
                        disabled={gradient.type !== 'linear'}
                    >
                        <Ionicons name="compass" size={20} color={activeTool === 'direction' ? theme.primary : (gradient.type !== 'linear' ? theme.border : theme.textSecondary)} />
                        <Text style={[styles.tabLabel, activeTool === 'direction' && styles.activeTabLabel, gradient.type !== 'linear' && { color: theme.border }]}>Direction</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTool('size')}
                        style={[styles.toolTab, activeTool === 'size' && styles.activeTab]}
                    >
                        <Ionicons name="resize" size={20} color={activeTool === 'size' ? theme.primary : theme.textSecondary} />
                        <Text style={[styles.tabLabel, activeTool === 'size' && styles.activeTabLabel]}>Size</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTool('presets')}
                        style={[styles.toolTab, activeTool === 'presets' && styles.activeTab]}
                    >
                        <Ionicons name="grid" size={20} color={activeTool === 'presets' ? theme.primary : theme.textSecondary} />
                        <Text style={[styles.tabLabel, activeTool === 'presets' && styles.activeTabLabel]}>Presets</Text>
                    </TouchableOpacity>
                </View>

                {/* Tool Content */}
                <View style={styles.toolContent}>
                    {activeTool === 'type' && (
                        <View style={styles.typeTool}>
                            <TouchableOpacity
                                style={[styles.typeBtn, gradient.type === 'solid' && styles.activeType]}
                                onPress={() => updateGradient({ type: 'solid' })}
                            >
                                <Ionicons name="color-fill-outline" size={22} color={theme.text} />
                                <Text style={styles.typeLabel}>Solid</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, gradient.type === 'linear' && styles.activeType]}
                                onPress={() => {
                                    // Ensure at least 2 colors for gradients
                                    if (gradient.colors.length < 2) {
                                        const baseColor = gradient.colors[0] || '#667EEA';
                                        updateGradient({
                                            type: 'linear',
                                            colors: [baseColor, '#764BA2'],
                                            locations: [0, 1]
                                        });
                                    } else {
                                        updateGradient({ type: 'linear' });
                                    }
                                }}
                            >
                                <Ionicons name="reorder-two-outline" size={22} color={theme.text} />
                                <Text style={styles.typeLabel}>Linear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, gradient.type === 'radial' && styles.activeType]}
                                onPress={() => {
                                    // Ensure at least 2 colors for gradients
                                    if (gradient.colors.length < 2) {
                                        const baseColor = gradient.colors[0] || '#667EEA';
                                        updateGradient({
                                            type: 'radial',
                                            colors: [baseColor, '#764BA2'],
                                            locations: [0, 1]
                                        });
                                    } else {
                                        updateGradient({ type: 'radial' });
                                    }
                                }}
                            >
                                <Ionicons name="radio-button-on" size={22} color={theme.text} />
                                <Text style={styles.typeLabel}>Radial</Text>
                            </TouchableOpacity>

                            <View style={styles.dividerVertical} />

                            <TouchableOpacity
                                style={styles.randomBtn}
                                onPress={handleRandomize}
                            >
                                <Ionicons name="shuffle" size={22} color={theme.primary} />
                                <Text style={[styles.typeLabel, { color: theme.primary }]}>Random</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {activeTool === 'colors' && (
                        <View style={styles.colorTool}>
                            {/* SOLID COLOR - Single color picker */}
                            {gradient.type === 'solid' ? (
                                <View style={styles.solidColorWrapper}>
                                    <TouchableOpacity
                                        style={[styles.solidColorBtn, { backgroundColor: gradient.colors[0] }]}
                                        onPress={() => {
                                            setActiveColorIndex(0);
                                            setShowColorPicker(true);
                                        }}
                                    >
                                        <View style={styles.solidColorInner}>
                                            <Ionicons name="color-fill" size={28} color="#FFF" />
                                        </View>
                                    </TouchableOpacity>
                                    <Text style={styles.solidColorLabel}>Tap to change color</Text>
                                </View>
                            ) : (
                                /* GRADIENT - Multi-stop color controls */
                                <>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorList}>
                                        {gradient.colors.map((color, index) => (
                                            <View key={index} style={styles.colorItemWrapper}>
                                                <TouchableOpacity
                                                    style={[styles.colorStop, { backgroundColor: color }]}
                                                    onPress={() => {
                                                        setActiveColorIndex(index);
                                                        setShowColorPicker(true);
                                                    }}
                                                />
                                                <TouchableOpacity
                                                    style={styles.removeStopBtn}
                                                    onPress={() => removeColorStop(index)}
                                                >
                                                    <Ionicons name="close-circle" size={16} color={theme.error} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                        <TouchableOpacity style={styles.addStopBtn} onPress={addColorStop}>
                                            <Ionicons name="add" size={24} color={theme.textSecondary} />
                                        </TouchableOpacity>
                                    </ScrollView>

                                    {/* STOP POSITION SLIDER */}
                                    {activeColorIndex !== null && (
                                        <View style={styles.positionControl}>
                                            <View style={styles.positionHeader}>
                                                <Text style={styles.positionLabel}>Stop Position</Text>
                                                <Text style={styles.positionValue}>{Math.round(gradient.locations[activeColorIndex] * 100)}%</Text>
                                            </View>
                                            <Slider
                                                style={styles.slider}
                                                minimumValue={activeColorIndex === 0 ? 0 : gradient.locations[activeColorIndex - 1]}
                                                maximumValue={activeColorIndex === gradient.colors.length - 1 ? 1 : gradient.locations[activeColorIndex + 1]}
                                                value={gradient.locations[activeColorIndex]}
                                                onValueChange={(val) => {
                                                    const newLocs = [...gradient.locations];
                                                    newLocs[activeColorIndex] = val;
                                                    updateGradient({ locations: newLocs });
                                                }}
                                                minimumTrackTintColor={theme.primary}
                                                maximumTrackTintColor={theme.border}
                                                thumbTintColor={theme.primary}
                                            />
                                        </View>
                                    )}
                                    <Text style={styles.hint}>
                                        {activeColorIndex !== null ? 'Drag slider to adjust intensity/spread.' : 'Tap a color stop to edit its position and hue.'}
                                    </Text>
                                </>
                            )}
                        </View>
                    )}

                    {activeTool === 'direction' && (
                        <View style={styles.directionTool}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.directionList}>
                                {DIRECTIONS.map((dir) => (
                                    <TouchableOpacity
                                        key={dir.id}
                                        style={[
                                            styles.directionBtn,
                                            gradient.start.x === dir.start.x && gradient.end.y === dir.end.y && styles.activeDirection
                                        ]}
                                        onPress={() => updateGradient({ start: dir.start, end: dir.end })}
                                    >
                                        <Ionicons name={dir.icon} size={24} color={theme.text} />
                                        <Text style={styles.dirLabel}>{dir.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <View style={styles.angleControl}>
                                <Text style={styles.angleLabel}>Manual Angle</Text>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={0}
                                    maximumValue={360}
                                    value={(() => {
                                        // Simple angle approximation for UI
                                        const dx = gradient.end.x - gradient.start.x;
                                        const dy = gradient.end.y - gradient.start.y;
                                        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                                        return (angle + 360) % 360;
                                    })()}
                                    onValueChange={(angle) => {
                                        const rad = (angle * Math.PI) / 180;
                                        const start = {
                                            x: 0.5 - 0.5 * Math.cos(rad),
                                            y: 0.5 - 0.5 * Math.sin(rad),
                                        };
                                        const end = {
                                            x: 0.5 + 0.5 * Math.cos(rad),
                                            y: 0.5 + 0.5 * Math.sin(rad),
                                        };
                                        updateGradient({ start, end });
                                    }}
                                    minimumTrackTintColor={theme.primary}
                                    maximumTrackTintColor={theme.border}
                                    thumbTintColor={theme.primary}
                                />
                            </View>
                        </View>
                    )}

                    {activeTool === 'size' && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sizeList}>
                            {CANVAS_PRESETS.map((preset) => (
                                <TouchableOpacity
                                    key={preset.id}
                                    style={[
                                        styles.sizeBtn,
                                        canvasSize.width === preset.width && canvasSize.height === preset.height && styles.activeSizeBtn
                                    ]}
                                    onPress={() => setCanvasSize({ width: preset.width, height: preset.height })}
                                >
                                    <Ionicons
                                        name={preset.icon}
                                        size={24}
                                        color={canvasSize.width === preset.width && canvasSize.height === preset.height ? theme.primary : theme.text}
                                    />
                                    <Text style={[
                                        styles.sizeName,
                                        canvasSize.width === preset.width && canvasSize.height === preset.height && { color: theme.primary }
                                    ]}>{preset.name}</Text>
                                    <Text style={styles.sizeRatio}>{preset.ratio}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {activeTool === 'presets' && (
                        gradient.type === 'solid' ? (
                            /* SOLID COLOR PRESETS */
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.solidPresetList}>
                                {SOLID_PRESETS.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.solidPresetItem}
                                        onPress={() => updateGradient({ colors: [item.color], locations: [0] })}
                                    >
                                        <View style={[styles.solidPresetPreview, { backgroundColor: item.color }]} />
                                        <Text style={styles.presetName}>{item.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        ) : (
                            /* GRADIENT PRESETS */
                            <FlatList
                                data={GRADIENT_PRESETS}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.presetItem}
                                        onPress={() => updateGradient({ colors: item.colors, locations: item.locations })}
                                    >
                                        <LinearGradient
                                            colors={item.colors}
                                            style={styles.presetPreview}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        />
                                        <Text style={styles.presetName}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )
                    )}
                </View>
            </View>

            {/* Color Picker Modal */}
            <CustomColorPicker
                visible={showColorPicker}
                onClose={() => setShowColorPicker(false)}
                initialColor={activeColorIndex !== null ? gradient.colors[activeColorIndex] : '#FFFFFF'}
                onSelectColor={(color) => {
                    handleUpdateColor(color);
                    setShowColorPicker(false);
                }}
                theme={theme}
            />
        </SafeAreaView>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    // Header Styles
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        backgroundColor: theme.background,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.surface,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    disabledBtn: {
        opacity: 0.4,
    },
    exportBtn: {
        borderRadius: 22,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    exportGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10,
        gap: 8,
    },
    exportText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.5,
    },
    // Canvas Area
    canvasWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    canvas: {
        backgroundColor: '#000',
        borderRadius: 0,
        elevation: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        overflow: 'hidden',
    },
    // Toolbar
    toolbar: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 20,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
    },
    toolTabs: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: theme.border + '30',
    },
    toolTab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        gap: 2,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: theme.primary,
    },
    tabLabel: {
        fontSize: 11,
        color: theme.textSecondary,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    activeTabLabel: {
        color: theme.primary,
        fontWeight: '700',
    },
    toolContent: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        minHeight: 100,
    },
    // Color Tool
    colorTool: {
        alignItems: 'center',
    },
    // Solid Color Tool
    solidColorWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    solidColorBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        borderWidth: 3,
        borderColor: '#FFF',
    },
    solidColorInner: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    solidColorLabel: {
        marginTop: 10,
        fontSize: 13,
        color: theme.textSecondary,
        fontWeight: '500',
    },
    colorList: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: 8,
        paddingVertical: 10,
        overflow: 'visible',
    },
    colorItemWrapper: {
        position: 'relative',
        alignItems: 'center',
        overflow: 'visible',
        zIndex: 1,
    },
    colorStop: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#FFF',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    removeStopBtn: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 2,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    addStopBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
        borderWidth: 1.5,
        borderColor: theme.border,
    },
    hint: {
        color: theme.textSecondary,
        fontSize: 12,
        marginTop: 16,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    // Position Control
    positionControl: {
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 16,
    },
    positionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 8,
    },
    positionLabel: {
        fontSize: 13,
        color: theme.textSecondary,
        fontWeight: '600',
    },
    positionValue: {
        fontSize: 13,
        color: theme.primary,
        fontWeight: '700',
    },
    // Direction Tool
    directionTool: {
        alignItems: 'center',
    },
    directionList: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 8,
        marginBottom: 20,
    },
    directionBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: theme.surface,
        gap: 4,
    },
    activeDirection: {
        backgroundColor: theme.primary + '20',
        borderWidth: 2,
        borderColor: theme.primary,
    },
    dirLabel: {
        fontSize: 9,
        color: theme.textSecondary,
        fontWeight: '600',
    },
    angleControl: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: theme.surface,
        borderRadius: 12,
        padding: 10,
    },
    angleLabel: {
        fontSize: 13,
        color: theme.textSecondary,
        fontWeight: '600',
        marginBottom: 8,
    },
    // Presets
    presetItem: {
        marginRight: 12,
        alignItems: 'center',
    },
    presetPreview: {
        width: 48,
        height: 68,
        borderRadius: 10,
        marginBottom: 6,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    solidPresetList: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 8,
    },
    solidPresetItem: {
        alignItems: 'center',
    },
    solidPresetPreview: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginBottom: 6,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    presetName: {
        fontSize: 11,
        color: theme.textSecondary,
        fontWeight: '500',
    },
    // Type Tool
    typeTool: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    typeBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 12,
        width: 64,
        height: 64,
        backgroundColor: theme.surface,
        gap: 4,
    },
    activeType: {
        backgroundColor: theme.primary + '15',
        borderWidth: 2,
        borderColor: theme.primary,
    },
    typeLabel: {
        fontSize: 10,
        color: theme.textSecondary,
        fontWeight: '600',
    },
    randomBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 12,
        width: 64,
        height: 64,
        backgroundColor: theme.surface,
        gap: 4,
    },
    dividerVertical: {
        width: 1,
        height: 36,
        backgroundColor: theme.border,
        marginHorizontal: 6,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    // Size Tool
    sizeList: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 8,
    },
    sizeBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 72,
        height: 72,
        borderRadius: 14,
        backgroundColor: theme.background,
        gap: 4,
        borderWidth: 1.5,
        borderColor: theme.border,
    },
    activeSizeBtn: {
        backgroundColor: theme.primary + '15',
        borderColor: theme.primary,
        borderWidth: 2,
    },
    sizeName: {
        fontSize: 10,
        color: theme.text,
        fontWeight: '600',
    },
    sizeRatio: {
        fontSize: 9,
        color: theme.textSecondary,
    },
});
