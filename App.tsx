// App.tsx — entry only. Supports Expo Go (QR) and development builds.

import { initSentry, captureException } from './utils/sentry';
initSentry();

if (typeof global !== 'undefined' && (global as { ErrorUtils?: { getGlobalHandler?: () => (error: Error, isFatal?: boolean) => void; setGlobalHandler?: (handler: (error: Error, isFatal?: boolean) => void) => void } }).ErrorUtils) {
  const ErrorUtils = (global as { ErrorUtils: { getGlobalHandler?: () => (error: Error, isFatal?: boolean) => void; setGlobalHandler?: (handler: (error: Error, isFatal?: boolean) => void) => void } }).ErrorUtils;
  const originalHandler = ErrorUtils.getGlobalHandler?.();
  ErrorUtils.setGlobalHandler?.((error: Error, isFatal?: boolean) => {
    captureException(error);
    console.error('[Kudya] Uncaught error', isFatal ? '(fatal)' : '', error?.message, error?.stack);
    originalHandler?.(error, isFatal);
  });
}

import React, { useEffect, useState, Suspense, Component } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import Constants from 'expo-constants';
import { analytics } from './utils/mixpanel';

const REANIMATED_DELAY_MS = 800;

const isExpoGo =
  Constants.executionEnvironment === 'storeClient' ||
  Constants.appOwnership === 'expo';

const AppContent = React.lazy(() => import('./AppContent'));

class NativeModuleErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: '' };
  static getDerivedStateFromError = (error: Error) => ({
    hasError: true,
    message: error?.message ?? 'Unknown error',
  });
  componentDidCatch(error: Error) {
    console.error('[Kudya] AppContent error', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={[styles.splash, { padding: 24 }]}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111', textAlign: 'center', marginBottom: 12 }}>
            Something went wrong
          </Text>
          {__DEV__ && (
            <Text style={{ fontSize: 13, color: '#666', textAlign: 'center' }}>{this.state.message}</Text>
          )}
        </View>
      );
    }
    return (this as React.Component<{ children: React.ReactNode }, { hasError: boolean; message: string }>).props
      .children;
  }
}

export default function App() {
  const [nativeReady, setNativeReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const delay = isExpoGo ? 100 : REANIMATED_DELAY_MS;
    const t = setTimeout(() => {
      if (!cancelled) setNativeReady(true);
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (!nativeReady) return;
    const t = setTimeout(() => {
      try {
        analytics.track('App Opened');
      } catch (_) {}
    }, 300);
    return () => clearTimeout(t);
  }, [nativeReady]);

  if (!nativeReady) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NativeModuleErrorBoundary>
      <Suspense
        fallback={
          <View style={styles.splash}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        }
      >
        <AppContent />
      </Suspense>
    </NativeModuleErrorBoundary>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
