import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { TailwindProvider } from "tailwindcss-react-native";
import { store, persistor } from "./redux/store"; // Ensure correct import path
import { PersistGate } from "redux-persist/integration/react";
import AppNavigator from "./navigation/AppNavigator";
import * as Sentry from "@sentry/react-native";
import ErrorBoundary from "./components/ErrorBoundary"; // Ensure correct import path

Sentry.init({
  dsn: "https://5221d8311bd795a3e47907b88085fc43@o4507511114956800.ingest.us.sentry.io/4507511119020032",
  tracesSampleRate: 1.0,
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <TailwindProvider>
          <PersistGate loading={null} persistor={persistor}>
            <ErrorBoundary>
              <AppNavigator />
            </ErrorBoundary>
          </PersistGate>
        </TailwindProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
