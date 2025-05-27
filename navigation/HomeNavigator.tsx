import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CartPage from "../screens/CartPage";
import storeMenu from "../screens/storeMenu";
import SuccessScreen from "../screens/SuccessScreen";
import CheckoutPage from "../screens/CheckoutPage";
import MainTabNavigator from "./MainTabNavigator";
import UserProfile from "../screens/UserProfile";
import OrderHistory from "../screens/OrderHistory";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import Delivery from "../screens/Delivery";
import FoodDetailsPage from "../screens/FoodDetailsPage";

const Stack = createStackNavigator();

export default function HomeNavigator() {
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeScreen" component={MainTabNavigator} />
      <Stack.Screen name="storeMenu" component={storeMenu} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
      <Stack.Screen name="CheckoutPage" component={CheckoutPage} />
      <Stack.Screen name="OrderHistory" component={OrderHistory} />
      <Stack.Screen name="Delivery" component={Delivery} />
      <Stack.Screen name="CartPage" component={CartPage} />
      <Stack.Screen name="FoodDetailsPage" component={FoodDetailsPage} />
    </Stack.Navigator>
  );
}