import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import LibraryScreen from '../screens/LibraryScreen';
import CreatorScreen from '../screens/CreatorScreen';
import EditorScreen from '../screens/EditorScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WallpaperDetailScreen from '../screens/WallpaperDetailScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import CollectionsScreen from '../screens/CollectionsScreen';
import CategoryWallpapersScreen from '../screens/CategoryWallpapersScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'compass' : 'compass-outline';
                    } else if (route.name === 'Library') {
                        iconName = focused ? 'images' : 'images-outline';
                    } else if (route.name === 'Creator') {
                        iconName = focused ? 'sparkles' : 'sparkles-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person-circle' : 'person-circle-outline';
                    }

                    return (
                        <Ionicons
                            name={iconName}
                            size={26}
                            color={focused ? theme.primary : theme.textSecondary}
                        />
                    );
                },
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textSecondary,
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '500',
                    marginTop: 0,
                },
                tabBarStyle: {
                    backgroundColor: theme.surface,
                    borderTopWidth: 1,
                    borderTopColor: theme.border,
                    height: 85,
                    paddingTop: 8,
                    paddingBottom: 25,
                },
                headerStyle: {
                    backgroundColor: theme.surface,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 0,
                },
                headerTintColor: theme.text,
                headerTitleStyle: {
                    fontSize: 28,
                    fontWeight: 'bold',
                },
                headerShadowVisible: false,
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false, tabBarLabel: 'Explore' }}
            />
            <Tab.Screen
                name="Library"
                component={LibraryScreen}
                options={{ headerShown: false, tabBarLabel: 'Library' }}
            />
            <Tab.Screen
                name="Creator"
                component={CreatorScreen}
                options={{ headerShown: false, tabBarLabel: 'Creator' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: false, tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
}

function AppNavigator() {
    const { isAuthenticated, loading } = useAuth();
    const { theme } = useTheme();
    const [isReady, setIsReady] = React.useState(false);
    const [initialState, setInitialState] = React.useState();

    React.useEffect(() => {
        const restoreState = async () => {
            try {
                // Only restore state if we are authenticated, or check if state matches correct stack?
                // Actually, just restoring state is fine, React Navigation handles validation.
                const savedStateString = await AsyncStorage.getItem('NAVIGATION_STATE');
                const state = savedStateString ? JSON.parse(savedStateString) : undefined;

                if (state !== undefined) {
                    setInitialState(state);
                }
            } catch (e) {
                // Ignore errors
            } finally {
                setIsReady(true);
            }
        };

        if (!loading) {
            restoreState();
        }
    }, [loading]);

    if (loading || !isReady) {
        return null; // Or a loading screen
    }
    const navTheme = {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            primary: theme.primary,
            background: theme.background,
            card: theme.surface,
            text: theme.text,
            border: theme.border,
        },
    };

    return (
        <NavigationContainer
            theme={navTheme}
            initialState={initialState}
            onStateChange={(state) => {
                AsyncStorage.setItem('NAVIGATION_STATE', JSON.stringify(state));
            }}
        >
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: theme.surface,
                        elevation: 0,
                        shadowOpacity: 0,
                    },
                    headerTintColor: theme.text,
                    headerTitleStyle: {
                        fontSize: 20,
                        fontWeight: '600',
                    },
                    headerShadowVisible: false,
                    contentStyle: {
                        backgroundColor: theme.background,
                    },
                    animation: 'slide_from_right',
                    animationDuration: 200,
                    headerBackTitleVisible: false,
                }}
            >
                {!isAuthenticated ? (
                    // Auth Stack
                    <>
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Signup"
                            component={SignupScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="ForgotPassword"
                            component={ForgotPasswordScreen}
                            options={{ headerShown: false }}
                        />
                    </>
                ) : (
                    // Main App Stack
                    <>
                        <Stack.Screen
                            name="MainTabs"
                            component={MainTabs}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Search"
                            component={SearchScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="WallpaperDetail"
                            component={WallpaperDetailScreen}
                            options={{
                                headerShown: false,
                            }}
                        />
                        <Stack.Screen
                            name="Categories"
                            component={CategoriesScreen}
                            options={{ title: 'Categories' }}
                        />
                        <Stack.Screen
                            name="CategoryWallpapers"
                            component={CategoryWallpapersScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Projects"
                            component={ProjectsScreen}
                            options={{ title: 'My Projects' }}
                        />
                        <Stack.Screen
                            name="Editor"
                            component={EditorScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Collections"
                            component={CollectionsScreen}
                            options={{ title: 'Collections' }}
                        />
                        <Stack.Screen
                            name="Settings"
                            component={SettingsScreen}
                            options={{ title: 'Settings' }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default AppNavigator;
