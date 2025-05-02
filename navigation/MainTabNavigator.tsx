import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather, Ionicons, AntDesign } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { View, Text } from "react-native";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import LinearGradient from "expo-linear-gradient";
import tw from "twrnc";

import HomeScreen from "../screens/HomeScreen";
import CartPage from "../screens/CartPage";
import AccountScreen from "../screens/AccountScreen";
import Delivery from "../screens/Delivery";
import OrderHistory from "../screens/OrderHistory";
import TabCartButton from "../components/TabCartButton";
import { RootState } from "../redux/store";

const Tab = createBottomTabNavigator();

const MainTabNavigator: React.FC = () => {
  const cartItems = useSelector((state: RootState) => state.basket.items);
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#000",
        headerShown: false,
        tabBarStyle: tw`pt-2 pb-6 h-18 border-t-0`,
      }}
      tabBar={(props) => (
        <View style={tw`absolute bottom-0 left-0 right-0`}>
          <LinearGradient colors={["#FCD34D", "#3B82F6"]} style={tw`h-18`}>
            <BottomTabBar {...props} style={tw`flex-row justify-around items-center flex-1`} />
          </LinearGradient>
        </View>
      )}
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
            <Ionicons name="car" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartPage}
        options={({ navigation }) => ({
          tabBarButton: () => (
            <TabCartButton onPress={() => navigation.navigate("CartPage")} />
          ),
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="cart-outline" color={color} size={size} />
              {itemCount > 0 && (
                <View style={tw`absolute -top-2 -right-2 bg-red-600 w-4 h-4 rounded-full justify-center items-center`}>
                  <Text style={tw`text-white text-xs font-bold`}>
                    {itemCount}
                  </Text>
                </View>
              )}
            </View>
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
