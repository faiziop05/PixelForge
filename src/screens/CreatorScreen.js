import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

// Premade templates
const TEMPLATES = [
    {
        id: 'gradient-purple',
        name: 'Purple Haze',
        colors: ['#667EEA', '#764BA2'],
    },
    {
        id: 'gradient-sunset',
        name: 'Sunset',
        colors: ['#fa709a', '#fee140'],
    },
    {
        id: 'gradient-ocean',
        name: 'Ocean',
        colors: ['#4facfe', '#00f2fe'],
    },
    {
        id: 'gradient-forest',
        name: 'Forest',
        colors: ['#43e97b', '#38f9d7'],
    },
    {
        id: 'gradient-midnight',
        name: 'Midnight',
        colors: ['#0f0c29', '#302b63', '#24243e'],
    },
    {
        id: 'gradient-amoled',
        name: 'AMOLED',
        colors: ['#000000', '#1a1a2e'],
    },
    {
        id: 'gradient-coral',
        name: 'Coral',
        colors: ['#ff0844', '#ffb199'],
    },
    {
        id: 'gradient-pastel',
        name: 'Pastel',
        colors: ['#a8edea', '#fed6e3'],
    },
];

export default function CreatorScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    const handleSelectTemplate = (template) => {
        navigation.navigate('Editor', { template });
    };

    const handleCreateNew = () => {
        navigation.navigate('Editor', { template: null });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#000000"
            />
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Creator</Text>
                <TouchableOpacity
                    style={styles.projectsBtn}
                    onPress={() => navigation.navigate('Projects')}
                >
                    <Ionicons name="folder-outline" size={22} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Create New Card */}
                <TouchableOpacity
                    style={styles.createNewCard}
                    onPress={handleCreateNew}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={[theme.primary, theme.secondary || '#8B5CF6']}
                        style={styles.createNewGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.createNewIcon}>
                            <Ionicons name="add" size={32} color="#FFF" />
                        </View>
                        <Text style={styles.createNewTitle}>Create New</Text>
                        <Text style={styles.createNewSubtitle}>Start with blank canvas</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => navigation.navigate('Projects')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: theme.surface }]}>
                            <Ionicons name="time-outline" size={24} color={theme.primary} />
                        </View>
                        <Text style={styles.quickActionText}>Recent Projects</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickAction}
                        onPress={() => navigation.navigate('Categories')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: theme.surface }]}>
                            <Ionicons name="apps-outline" size={24} color={theme.primary} />
                        </View>
                        <Text style={styles.quickActionText}>Browse Wallpapers</Text>
                    </TouchableOpacity>
                </View>

                {/* Templates Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Templates</Text>
                    <View style={styles.templatesGrid}>
                        {TEMPLATES.map(template => (
                            <TouchableOpacity
                                key={template.id}
                                style={styles.templateCard}
                                onPress={() => handleSelectTemplate(template)}
                                activeOpacity={0.85}
                            >
                                <LinearGradient
                                    colors={template.colors}
                                    style={styles.templateGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                />
                                <Text style={styles.templateName}>{template.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.text,
    },
    projectsBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 16,
    },
    createNewCard: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
    },
    createNewGradient: {
        padding: 28,
        alignItems: 'center',
    },
    createNewIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    createNewTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 4,
    },
    createNewSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 28,
        gap: 12,
    },
    quickAction: {
        flex: 1,
        alignItems: 'center',
    },
    quickActionIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.textSecondary,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.text,
        marginBottom: 14,
    },
    templatesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    templateCard: {
        width: CARD_WIDTH,
        marginBottom: 4,
    },
    templateGradient: {
        width: '100%',
        aspectRatio: 9 / 14,
        borderRadius: 16,
    },
    templateName: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.text,
        marginTop: 8,
        textAlign: 'center',
    },
});
