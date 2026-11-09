import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import BottomTabNavigator from "./TabNavigator";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import CheckoutPage from "../screens/CheckoutPage";
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
import PropertyApplicationWizardScreen from "../screens/PropertyApplicationWizardScreen";
import PropertyApplicationsScreen from "../screens/PropertyApplicationsScreen";
import PropertyApplicationDetailScreen from "../screens/PropertyApplicationDetailScreen";
import PropertyActiveRentalsScreen from "../screens/PropertyActiveRentalsScreen";
import PropertyDocumentsVaultScreen from "../screens/PropertyDocumentsVaultScreen";
import StayBookingsScreen from "../screens/StayBookingsScreen";
import StayBookingConfirmScreen from "../screens/StayBookingConfirmScreen";
import DoctorsScreen from "../screens/DoctorsScreen";
import DoctorDetailScreen from "../screens/DoctorDetailScreen";
import BookAppointmentScreen from "../screens/BookAppointmentScreen";
import AccommodationScreen from "../screens/AccommodationScreen";
import WalletScreen from "../screens/WalletScreen";
import BusinessDashboardScreen from "../screens/BusinessDashboardScreen";
import ComingSoonScreen from "../screens/ComingSoonScreen";
import CarRentalScreen from "../screens/CarRentalScreen";
import CarRentalDetailScreen from "../screens/CarRentalDetailScreen";
import RidesScreen from "../screens/RidesScreen";
import RideTrackingScreen from "../screens/RideTrackingScreen";
import SendPackageScreen from "../screens/SendPackageScreen";
import GroceryScreen from "../screens/GroceryScreen";
import WishlistScreen from "../screens/WishlistScreen";
import NotificationsScreen from "../screens/NotificationsScreen";

import SignupScreen from "../screens/SignupScreen";
import LoginScreenUser from "../screens/LoginScreenUser";
import CompleteProfileScreen from "../screens/CompleteProfileScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import CartScreen from "../screens/CartScreen";
import UserProfile from "../screens/UserProfile";
import SuccessScreen from "../screens/SuccessScreen";
import Delivery from "../screens/Delivery";
import {
  FoodHomeScreen,
  ItemCustomiseScreen,
  RestaurantDetailsScreen,
  RestaurantListScreen,
} from "../screens/food";
import {
  DeliverySlotScreen,
  GroceryCategoriesScreen,
  GroceryHomeScreen,
  GroceryProductDetailsScreen,
  GroceryProductSearchScreen,
  GroceryStoreDetailsScreen,
  SubstitutionsScreen,
} from "../screens/grocery";
import {
  AddressesScreen,
  CouponsScreen,
  LocationSetupScreen,
  OnboardingScreen,
  OtpVerificationScreen,
  SettingsScreen,
} from "../screens/account";
import {
  LiveTrackingScreen,
  OrderChatScreen,
  OrderDeliveredScreen,
  OrderHistoryScreen,
  OrderPlacedScreen,
  OrderReceiptScreen,
  OrderTrackingScreen,
  RateOrderScreen,
  RefundRequestScreen,
  RefundsDisputesScreen,
} from "../screens/orders";


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
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="CartPage" component={CartScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="Checkout" component={CheckoutPage} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="Services" component={ServicesScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="Properties" component={PropertiesScreen} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
      <Stack.Screen name="PropertyApplicationWizard" component={PropertyApplicationWizardScreen} />
      <Stack.Screen name="PropertyApplications" component={PropertyApplicationsScreen} />
      <Stack.Screen name="PropertyApplicationDetail" component={PropertyApplicationDetailScreen} />
      <Stack.Screen name="PropertyActiveRentals" component={PropertyActiveRentalsScreen} />
      <Stack.Screen name="PropertyDocumentsVault" component={PropertyDocumentsVaultScreen} />
      <Stack.Screen name="StayBookings" component={StayBookingsScreen} />
      <Stack.Screen name="StayBookingConfirm" component={StayBookingConfirmScreen} />
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
      <Stack.Screen name="CarRentalDetail" component={CarRentalDetailScreen} />
      <Stack.Screen name="Grocery" component={GroceryScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="ProductsByCategory" component={ProductsByCategoryScreen} />
      {/* Onboarding & account */}
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="LocationSetup" component={LocationSetupScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Addresses" component={AddressesScreen} />
      <Stack.Screen name="Coupons" component={CouponsScreen} />
      {/* Food */}
      <Stack.Screen name="FoodHome" component={FoodHomeScreen} />
      <Stack.Screen name="RestaurantList" component={RestaurantListScreen} />
      <Stack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} />
      <Stack.Screen name="ItemCustomise" component={ItemCustomiseScreen} />
      {/* Grocery */}
      <Stack.Screen name="GroceryHome" component={GroceryHomeScreen} />
      <Stack.Screen name="GroceryCategories" component={GroceryCategoriesScreen} />
      <Stack.Screen name="GroceryProductSearch" component={GroceryProductSearchScreen} />
      <Stack.Screen name="GroceryStoreDetails" component={GroceryStoreDetailsScreen} />
      <Stack.Screen name="GroceryProductDetails" component={GroceryProductDetailsScreen} />
      <Stack.Screen name="Substitutions" component={SubstitutionsScreen} />
      <Stack.Screen name="DeliverySlot" component={DeliverySlotScreen} />
      {/* Post-order */}
      <Stack.Screen name="OrderPlaced" component={OrderPlacedScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
      <Stack.Screen name="OrderChat" component={OrderChatScreen} />
      <Stack.Screen name="OrderDelivered" component={OrderDeliveredScreen} />
      <Stack.Screen name="RateOrder" component={RateOrderScreen} />
      <Stack.Screen name="OrderReceipt" component={OrderReceiptScreen} />
      <Stack.Screen name="RefundsDisputes" component={RefundsDisputesScreen} />
      <Stack.Screen name="RefundRequest" component={RefundRequestScreen} />
      {/* Legacy routes still referenced by older screens */}
      <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
      <Stack.Screen name="Delivery" component={Delivery} />
    </Stack.Navigator>
  );
}
