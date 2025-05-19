// navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, logoutUser, selectUser } from "../redux/slices/authSlice";
import AuthNavigator from "./AuthNavigator";
import HomeNavigator from "./HomeNavigator";
import { LogBox } from "react-native";
import HomeScreen from "../screens/RestaurantHomeScreen";

LogBox.ignoreLogs(["new NativeEventEmitter"]);

export default function AppNavigator() {
  
  return (
    <NavigationContainer>
     <AuthNavigator />
    </NavigationContainer>
  );
}
