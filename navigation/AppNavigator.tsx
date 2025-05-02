// navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, logoutUser, selectUser } from "../redux/slices/authSlice";
import AuthNavigator from "./AuthNavigator";
import HomeNavigator from "./HomeNavigator";
import { LogBox } from "react-native";
import HomeScreen from "../screens/HomeScreen";

LogBox.ignoreLogs(["new NativeEventEmitter"]);

export default function AppNavigator() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  return (
    <NavigationContainer>
     <HomeNavigator />
    </NavigationContainer>
  );
}
