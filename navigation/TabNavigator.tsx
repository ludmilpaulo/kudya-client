import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { FontAwesome5, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import tw from "twrnc";
import HomeScreen from "../screens/HomeScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import CartScreen from "../screens/CartScreen";
import OrdersScreen from "../screens/OrdersScreen";
import WishlistScreen from "../screens/WishlistScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ServicesScreen from "../screens/ServicesScreen";
import PropertiesScreen from "../screens/PropertiesScreen";
import { useTranslation } from "../hooks/useTranslation";
import { RootState } from "../redux/store";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Get cart count from Redux
  const cartCount = useSelector(
    (state: RootState) =>
      state.basket.items.reduce((acc, item) => acc + item.quantity, 0)
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          height: 64 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          paddingTop: 8,
        },
        tabBarLabel: ({ focused, color }) => (
          <Text
            style={[
              tw`text-xs font-semibold`,
              { color: focused ? "#2563eb" : "#64748b", marginBottom: 2 },
            ]}
          >
            {t(route.name as any)}
          </Text>
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="home" color={color} size={22} />
          ),
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Feather name="grid" color={color} size={22} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <View>
              <Feather name="shopping-cart" color={color} size={22} />
              {cartCount > 0 && (
                <View
                  style={[
                    tw`absolute top-[-8px] right-[-10px] bg-red-500 rounded-full px-1.5 items-center justify-center`,
                    { minWidth: 18, height: 18, zIndex: 10 },
                  ]}
                >
                  <Text
                    style={tw`text-white text-xs font-bold`}
                    numberOfLines={1}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="clipboard-list-outline" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="heart" color={color} size={22} />
          ),
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="briefcase-outline" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Properties"
        component={PropertiesScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home-city-outline" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Feather name="user" color={color} size={22} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
