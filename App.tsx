// App.tsx — entry only. In Expo Go we show a "use dev build" screen to avoid native module crashes.

if (typeof global !== 'undefined' && (global as any).ErrorUtils) {
  const ErrorUtils = (global as any).ErrorUtils;
  const originalHandler = ErrorUtils.getGlobalHandler?.();
  ErrorUtils.setGlobalHandler?.((error: Error, isFatal?: boolean) => {
    console.error('[Kudya] Uncaught error', isFatal ? '(fatal)' : '', error?.message, error?.stack);
    originalHandler?.(error, isFatal);
  });
}

import React, { useEffect, useState, Suspense, Component } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import Constants from 'expo-constants';
import { analytics } from './utils/mixpanel';

const REANIMATED_DELAY_MS = 800;

// Expo Go: executionEnvironment === 'storeClient' or appOwnership === 'expo'. Don't load native modules there.
const isExpoGo =
  Constants.executionEnvironment === 'storeClient' ||
  Constants.appOwnership === 'expo';

const AppContent = React.lazy(async () => {
  const m = await import('./AppContent').catch(() => null);
  if (!m?.default) return { default: ExpoGoFallback };
  return m;
});

class NativeModuleErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError = () => ({ hasError: true });
  componentDidCatch() {}
  render() {
    if (this.state.hasError) return <ExpoGoFallback />;
    return this.props.children;
  }
}

function ExpoGoFallback() {
  return (
    <View style={[styles.splash, { padding: 24 }]}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#111', textAlign: 'center', marginBottom: 12 }}>
        Use a development build
      </Text>
      <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
        This app uses native modules that aren't supported in Expo Go. Run in a terminal:
      </Text>
      <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#2563eb', marginTop: 16, textAlign: 'center' }}>
        npx expo run:ios
      </Text>
      <Text style={{ fontSize: 12, color: '#888', marginTop: 24, textAlign: 'center' }}>
        (or run:ios for simulator, run:android for Android)
      </Text>
    </View>
  );
}

export default function App() {
  const [nativeReady, setNativeReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const delay = isExpoGo ? 100 : REANIMATED_DELAY_MS;
    const t = setTimeout(() => {
      if (cancelled) return;
      // Do not require gesture-handler/reanimated here — it can throw HostFunction in Expo Go or broken dev builds.
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

  if (isExpoGo) return <ExpoGoFallback />;

  return (
    <NativeModuleErrorBoundary>
    <Suspense fallback={
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    }>
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
