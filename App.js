import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { EditorProvider } from './src/context/EditorContext';
import { LibraryProvider } from './src/context/LibraryContext';
import { AlertProvider } from './src/context/AlertContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreenComponent from './src/screens/SplashScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        // await Font.loadAsync(Entypo.font);

        // Artificially delay for at least 2 seconds to show off the splash screen
        // Remove this in production or when you have real loading logic
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return <SplashScreenComponent />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: '#000000' }} onLayout={onLayoutRootView}>
          <ThemeProvider>
            <AuthProvider>
              <LibraryProvider>
                <EditorProvider>
                  <StatusBar barStyle="light-content" backgroundColor="#000000" />
                  <AlertProvider>
                    <AppNavigator />
                  </AlertProvider>
                </EditorProvider>
              </LibraryProvider>
            </AuthProvider>
          </ThemeProvider>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
