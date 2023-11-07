import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import colors from "../configs/colors";
import HomeScreen from "../screens/HomeScreen";
import TabCartButton from "../components/TabCartButton";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
///import BrowseScreen from "../screens/BrowseScreen";
import CartScreen from "../screens/CartScreen";
//import GroceryScreen from "../screens/GroceryScreen";
import AccountScreen from "../screens/AccountScreen";
import Delivery from "../screens/Delivery";
import OrderHistory from "../screens/OrderHistory";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.activeTintColor,
        tabBarInactiveTintColor: colors.inActiveTintColor,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0,
          paddingTop: 10,
          paddingBottom: 25,
          height: 75,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Acompanhar"
        component={Delivery}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="md-car" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={({ navigation }) => ({
          tabBarButton: () => (
            <TabCartButton onPress={() => navigation.navigate("Cart")} />
          ),
        })}
      />
      <Tab.Screen
        name="Pedidos"
        component={OrderHistory}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="shopping-bag" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Conta"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
