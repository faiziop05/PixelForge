import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { useEditor } from '../context/EditorContext';
import EditorService from '../services/EditorService';
import EmptyState from '../components/common/EmptyState';

export default function ProjectsScreen({ navigation }) {
    const { theme } = useTheme();
    const { user, isGuest } = useAuth();
    const { newProject } = useEditor();
    const { showAlert } = useAlert();
    const [projects, setProjects] = useState([]);
    const [recentProject, setRecentProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProjects();
    }, []);

    // Reload projects when screen comes into focus
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadProjects();
        });
        return unsubscribe;
    }, [navigation]);

    const loadProjects = async () => {
        try {
            let data;
            if (isGuest) {
                data = await EditorService.getLocalProjects();
            } else if (user) {
                data = await EditorService.getFirebaseProjects(user.uid);
            }

            // Sort by modified date
            const sorted = (data || []).sort((a, b) =>
                new Date(b.modifiedAt) - new Date(a.modifiedAt)
            );

            // Most recent is the first one
            if (sorted.length > 0) {
                setRecentProject(sorted[0]);
            } else {
                setRecentProject(null);
            }

            setProjects(sorted);
        } catch (error) {
            console.log('Error loading projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewProject = () => {
        // Always create a fresh project
        newProject({ width: 1080, height: 1920 });
        navigation.navigate('Editor', { fresh: true });
    };

    const handleOpenProject = (project) => {
        navigation.navigate('Editor', { project });
    };

    const handleDeleteProject = (project) => {
        showAlert({
            title: 'Delete Project',
            message: `Are you sure you want to delete "${project.name}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            showCancel: true,
            type: 'error', // Red color for destructive action
            onConfirm: async () => {
                try {
                    if (isGuest) {
                        await EditorService.deleteLocalProject(project.id);
                    } else if (user) {
                        await EditorService.deleteFirebaseProject(user.uid, project.id);
                    }
                    setProjects(prev => prev.filter(p => p.id !== project.id));
                    if (recentProject?.id === project.id) {
                        const remaining = projects.filter(p => p.id !== project.id);
                        setRecentProject(remaining.length > 0 ? remaining[0] : null);
                    }
                    showAlert({ title: 'Deleted', message: 'Project deleted successfully', type: 'success' });
                } catch (error) {
                    showAlert({ title: 'Error', message: 'Failed to delete project', type: 'error' });
                }
            },
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const renderGradientPreview = (gradient) => {
        if (!gradient) return null;

        if (gradient.type === 'solid') {
            return (
                <View style={[styles.gradient, { backgroundColor: gradient.colors[0] }]} />
            );
        }

        return (
            <LinearGradient
                colors={gradient.colors.length >= 2 ? gradient.colors : [...gradient.colors, gradient.colors[0]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            />
        );
    };

    const ProjectCard = ({ project, isLarge = false }) => (
        <TouchableOpacity
            style={[
                isLarge ? styles.recentCard : styles.projectCard,
                { backgroundColor: theme.surface }
            ]}
            onPress={() => handleOpenProject(project)}
            activeOpacity={0.8}
        >
            <View style={isLarge ? styles.recentThumbnail : styles.projectThumbnail}>
                {renderGradientPreview(project.gradient)}
            </View>
            {/* Overlay gradient for text readability */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.cardOverlay}
            >
                <View style={styles.projectInfo}>
                    <Text style={[styles.projectName, { color: '#FFF' }]} numberOfLines={1}>
                        {project.name || 'Untitled'}
                    </Text>
                    <Text style={[styles.projectMeta, { color: 'rgba(255,255,255,0.7)' }]}>
                        {formatDate(project.modifiedAt)}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteProject(project)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                </TouchableOpacity>
            </LinearGradient>
        </TouchableOpacity>
    );

    const styles = createStyles(theme);

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor="#000000" />
                <View style={styles.header}>
                    <Text style={styles.title}>Projects</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            {/* Header
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Projects</Text>
                    <Text style={styles.subtitle}>{projects.length} saved</Text>
                </View>
                <TouchableOpacity
                    style={[styles.newButton, { backgroundColor: theme.primary }]}
                    onPress={handleNewProject}
                >
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View> */}

            {projects.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <EmptyState
                        icon="folder-open-outline"
                        title="No Projects Yet"
                        message="Create your first wallpaper project"
                    />
                    {/* <TouchableOpacity
                        style={[styles.createBtn, { backgroundColor: theme.primary }]}
                        onPress={handleNewProject}
                    >
                        <Ionicons name="add" size={22} color="#FFF" />
                        <Text style={styles.createBtnText}>Create New Project</Text>
                    </TouchableOpacity> */}
                </View>
            ) : (
                <FlatList
                    data={projects}
                    ListHeaderComponent={() => (
                        recentProject && (
                            <View style={styles.recentSection}>
                                <Text style={styles.sectionTitle}>Recent</Text>
                                <ProjectCard project={recentProject} isLarge />
                            </View>
                        )
                    )}
                    ListHeaderComponentStyle={styles.listHeader}
                    renderItem={({ item, index }) => {
                        // Skip the first item if it's already shown as recent
                        if (index === 0 && recentProject) return null;
                        return <ProjectCard project={item} />;
                    }}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.list}
                    columnWrapperStyle={styles.row}
                />
            )}
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
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.text,
    },
    subtitle: {
        fontSize: 14,
        color: theme.textSecondary,
        marginTop: 2,
    },
    newButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: theme.textSecondary,
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    createBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 30,
        gap: 8,
        marginTop: 24,
    },
    createBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    listHeader: {
        marginBottom: 16,
    },
    row: {
        justifyContent: 'space-between',
    },
    recentSection: {
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.text,
        marginBottom: 12,
        marginLeft: 4,
    },
    recentCard: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 16,
    },
    recentThumbnail: {
        width: '100%',
        aspectRatio: 16 / 9,
    },
    projectCard: {
        width: '48%',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
    },
    projectThumbnail: {
        width: '100%',
        aspectRatio: 9 / 16,
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        paddingTop: 50,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    projectInfo: {
        flex: 1,
    },
    projectName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    projectMeta: {
        fontSize: 11,
    },
    deleteBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
