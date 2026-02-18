import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase.config';

const PROJECTS_KEY = 'editor_projects';

class EditorService {
    // Local storage for projects (guest mode)
    async getLocalProjects() {
        try {
            const projectsJson = await AsyncStorage.getItem(PROJECTS_KEY);
            return projectsJson ? JSON.parse(projectsJson) : [];
        } catch (error) {
            console.log('Error getting local projects:', error);
            return [];
        }
    }

    async saveLocalProject(project) {
        try {
            const projects = await this.getLocalProjects();
            const existingIndex = projects.findIndex(p => p.id === project.id);

            if (existingIndex >= 0) {
                projects[existingIndex] = {
                    ...project,
                    modifiedAt: new Date().toISOString(),
                };
            } else {
                projects.push({
                    ...project,
                    createdAt: project.createdAt || new Date().toISOString(),
                    modifiedAt: new Date().toISOString(),
                });
            }

            await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
            return project;
        } catch (error) {
            console.log('Error saving local project:', error);
            throw error;
        }
    }

    async deleteLocalProject(projectId) {
        try {
            const projects = await this.getLocalProjects();
            const filtered = projects.filter(p => p.id !== projectId);
            await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.log('Error deleting local project:', error);
            return false;
        }
    }

    // Firebase storage for projects (logged-in users)
    async getFirebaseProjects(userId) {
        try {
            const projectsRef = collection(db, 'projects', userId, 'userProjects');
            const querySnapshot = await getDocs(projectsRef);

            const projects = [];
            querySnapshot.forEach((doc) => {
                projects.push({ id: doc.id, ...doc.data() });
            });

            return projects.sort((a, b) =>
                new Date(b.modifiedAt) - new Date(a.modifiedAt)
            );
        } catch (error) {
            console.log('Error getting Firebase projects:', error);
            return [];
        }
    }

    async saveFirebaseProject(userId, project) {
        try {
            const projectRef = doc(db, 'projects', userId, 'userProjects', project.id);

            await setDoc(projectRef, {
                ...project,
                modifiedAt: new Date().toISOString(),
                createdAt: project.createdAt || new Date().toISOString(),
            });

            return project;
        } catch (error) {
            console.log('Error saving Firebase project:', error);
            throw error;
        }
    }

    async deleteFirebaseProject(userId, projectId) {
        try {
            const projectRef = doc(db, 'projects', userId, 'userProjects', projectId);
            await deleteDoc(projectRef);
            return true;
        } catch (error) {
            console.log('Error deleting Firebase project:', error);
            return false;
        }
    }

    async getFirebaseProject(userId, projectId) {
        try {
            const projectRef = doc(db, 'projects', userId, 'userProjects', projectId);
            const projectSnap = await getDoc(projectRef);

            if (projectSnap.exists()) {
                return { id: projectSnap.id, ...projectSnap.data() };
            }

            return null;
        } catch (error) {
            console.log('Error getting Firebase project:', error);
            return null;
        }
    }

    // Utility methods
    createProject(name, canvasSize) {
        return {
            id: Date.now().toString(),
            name: name || 'Untitled Project',
            canvasSize: canvasSize || { width: 1080, height: 1920 },
            gradient: {
                type: 'linear',
                colors: ['#667EEA', '#764BA2'],
                locations: [0, 1],
                start: { x: 0, y: 0 },
                end: { x: 0.5, y: 1 },
            },
            thumbnail: null,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        };
    }

    duplicateProject(project) {
        return {
            ...project,
            id: Date.now().toString(),
            name: `${project.name} (Copy)`,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        };
    }

    // Sync local to Firebase when user logs in
    async syncLocalToFirebase(userId) {
        try {
            const localProjects = await this.getLocalProjects();

            if (localProjects.length > 0) {
                for (const project of localProjects) {
                    await this.saveFirebaseProject(userId, project);
                }

                // Clear local projects after sync
                await AsyncStorage.removeItem(PROJECTS_KEY);
            }

            return true;
        } catch (error) {
            console.log('Error syncing projects:', error);
            return false;
        }
    }
}

export default new EditorService();
