// Loaded after native runtimes are ready (Expo Go). Do not import this from App.tsx at top level.
import 'react-native-gesture-handler';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import ErrorBoundary from './components/ErrorBoundary';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { LanguageProvider } from './contexts/LanguageContext';
import LanguageAuthSync from './components/LanguageAuthSync';
import AppLanguageGate from './components/AppLanguageGate';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const SafeErrorBoundary = ErrorBoundary as React.ComponentType<{ children: React.ReactNode }>;
const SafeGestureHandlerRootView = GestureHandlerRootView as React.ComponentType<{
  children?: React.ReactNode;
  style?: unknown;
}>;
const SafeProvider = Provider as unknown as React.ComponentType<{
  children?: React.ReactNode;
  store: typeof store;
}>;
const SafeNavigationContainer = NavigationContainer as React.ComponentType<{
  children?: React.ReactNode;
}>;

export default function AppContent() {
  return (
    <SafeGestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeProvider store={store}>
          <PersistGate
            loading={
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#2563EB" />
              </View>
            }
            persistor={persistor}
          >
            <LanguageProvider>
              <LanguageAuthSync />
              <AppLanguageGate>
                <SafeErrorBoundary>
                  <SafeNavigationContainer>
                    <AppNavigator />
                  </SafeNavigationContainer>
                </SafeErrorBoundary>
              </AppLanguageGate>
            </LanguageProvider>
          </PersistGate>
        </SafeProvider>
      </SafeAreaProvider>
    </SafeGestureHandlerRootView>
  );
}
