import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./navigation/AppNavigator";
import { Provider } from "react-redux";
import store  from "./redux/store";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </GestureHandlerRootView>
  );
}