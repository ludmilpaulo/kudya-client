// App.tsx
import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import AppNavigator from "./navigation/AppNavigator";
import ErrorBoundary from "./components/ErrorBoundary";
import { NavigationContainer } from "@react-navigation/native"; // <-- ADD THIS
import { analytics } from "./utils/mixpanel";

export default function App() {
  useEffect(() => {
    // Initialize Mixpanel tracking
    analytics.track('App Opened');
  }, []);

  return (
    <GestureHandlerRootView>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ErrorBoundary>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </ErrorBoundary>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
