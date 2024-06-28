import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CartPage from "../screens/CartPage";
import RestaurantMenu from "../screens/RestaurantMenu";
import SuccessScreen from "../screens/SuccessScreen";
import CheckoutPage from "../screens/CheckoutPage";
import MainTabNavigator from "./MainTabNavigator";
import UserProfile from "../screens/UserProfile";
import OrderHistory from "../screens/OrderHistory";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import FoodDetailsPage from "../screens/FoodDetailsPage";

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
      <Stack.Screen name="RestaurantMenu" component={RestaurantMenu} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
      <Stack.Screen name="CheckoutPage" component={CheckoutPage} />
      <Stack.Screen name="OrderHistory" component={OrderHistory} />
      <Stack.Screen name="CartPage" component={CartPage} />
      <Stack.Screen name="FoodDetailsPage" component={FoodDetailsPage} />
    </Stack.Navigator>
  );
}
