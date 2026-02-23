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

const SafeErrorBoundary = ErrorBoundary as React.ComponentType<{ children: React.ReactNode }>;

export default function AppContent() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeErrorBoundary>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </SafeErrorBoundary>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
