import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import DetailsScreen from "../screens/DetailsScreen";
import SuccessScreen from "../screens/SuccessScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import MainTabNavigator from "./MainTabNavigator";
import UserProfile from "../screens/UserProfile";
import OrderHistory from "../screens/OrderHistory";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";

const Stack = createStackNavigator();

export default function HomeNavigator() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeScreen" component={MainTabNavigator} />
      <Stack.Screen name="DetailsScreen" component={DetailsScreen} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
      <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistory} />
    </Stack.Navigator>
  );
}
