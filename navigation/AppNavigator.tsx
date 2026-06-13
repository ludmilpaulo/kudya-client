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
import ServicesScreen from "../screens/ServicesScreen";
import PropertiesScreen from "../screens/PropertiesScreen";
import PropertyDetailScreen from "../screens/PropertyDetailScreen";
import DoctorsScreen from "../screens/DoctorsScreen";
import DoctorDetailScreen from "../screens/DoctorDetailScreen";
import BookAppointmentScreen from "../screens/BookAppointmentScreen";
import AccommodationScreen from "../screens/AccommodationScreen";
import WalletScreen from "../screens/WalletScreen";
import BusinessDashboardScreen from "../screens/BusinessDashboardScreen";
import ComingSoonScreen from "../screens/ComingSoonScreen";
import RidesScreen from "../screens/RidesScreen";
import RideTrackingScreen from "../screens/RideTrackingScreen";
import SendPackageScreen from "../screens/SendPackageScreen";
import CarRentalScreen from "../screens/CarRentalScreen";
import GroceryScreen from "../screens/GroceryScreen";

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
      <Stack.Screen name="Services" component={ServicesScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="Properties" component={PropertiesScreen} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
      <Stack.Screen name="Doctors" component={DoctorsScreen} />
      <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
      <Stack.Screen name="Accommodation" component={AccommodationScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="BusinessDashboard" component={BusinessDashboardScreen} />
      <Stack.Screen name="ComingSoon" component={ComingSoonScreen} />
      <Stack.Screen name="Rides" component={RidesScreen} />
      <Stack.Screen name="RideTracking" component={RideTrackingScreen} />
      <Stack.Screen name="SendPackage" component={SendPackageScreen} />
      <Stack.Screen name="CarRental" component={CarRentalScreen} />
      <Stack.Screen name="Grocery" component={GroceryScreen} />
      <Stack.Screen name="ProductsByCategory" component={ProductsByCategoryScreen} />
    </Stack.Navigator>
  );
}
