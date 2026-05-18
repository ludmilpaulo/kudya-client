import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native";
import tw from "twrnc";
import SuperAppHomeScreen from "../screens/SuperAppHomeScreen";
import ActivityScreen from "../screens/ActivityScreen";
import WalletScreen from "../screens/WalletScreen";
import SupportScreen from "../screens/SupportScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { useTranslation } from "../hooks/useTranslation";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

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
          <Text style={[tw`text-xs font-semibold`, { color: focused ? "#2563eb" : "#64748b", marginBottom: 2 }]}>
            {t(route.name)}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={SuperAppHomeScreen} options={{ tabBarIcon: ({ color }) => <FontAwesome5 name="home" color={color} size={22} /> }} />
      <Tab.Screen name="Activity" component={ActivityScreen} options={{ tabBarIcon: ({ color }) => <MaterialCommunityIcons name="history" color={color} size={24} /> }} />
      <Tab.Screen name="Wallet" component={WalletScreen} options={{ tabBarIcon: ({ color }) => <Feather name="credit-card" color={color} size={22} /> }} />
      <Tab.Screen name="Support" component={SupportScreen} options={{ tabBarIcon: ({ color }) => <Feather name="message-circle" color={color} size={22} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <Feather name="user" color={color} size={22} /> }} />
    </Tab.Navigator>
  );
}
