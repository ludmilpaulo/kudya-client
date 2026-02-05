import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import BottomTabNavigator from "./TabNavigator";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
// Add other modal/detail screens here as needed


import { RootStackParamList } from '../navigation/navigation';
import ProductsScreen from "../screens/ProductsScreen";
import ProductsByCategoryScreen from "../screens/ProductsByCategoryScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import StoresScreen from "../screens/StoresScreen";
import ServiceDetailScreen from "../screens/ServiceDetailScreen";
import PropertyDetailScreen from "../screens/PropertyDetailScreen";

import SignupScreen from "../screens/SignupScreen";
import LoginScreenUser from "../screens/LoginScreenUser";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";


const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main tabs */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      {/* Detail screens, modals, checkout, etc. */}
      <Stack.Screen name="Stores" component={StoresScreen} />
       <Stack.Screen name="Products" component={ProductsScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailScreen} />
     <Stack.Screen name="UserLogin" component={LoginScreenUser} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />
    
    
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
      <Stack.Screen name="ProductsByCategory" component={ProductsByCategoryScreen} />


    </Stack.Navigator>
  );
}
