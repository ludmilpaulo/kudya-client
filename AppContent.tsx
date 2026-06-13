// Loaded after native runtimes are ready (Expo Go). Do not import this from App.tsx at top level.
import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import ErrorBoundary from './components/ErrorBoundary';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { LanguageProvider } from './contexts/LanguageContext';
import LanguageAuthSync from './components/LanguageAuthSync';

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
      <SafeProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <LanguageProvider>
            <LanguageAuthSync />
            <SafeErrorBoundary>
              <SafeNavigationContainer>
                <AppNavigator />
              </SafeNavigationContainer>
            </SafeErrorBoundary>
          </LanguageProvider>
        </PersistGate>
      </SafeProvider>
    </SafeGestureHandlerRootView>
  );
}
