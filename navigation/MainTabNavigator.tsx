import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather, Ionicons, AntDesign } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { View, Text, StyleSheet, Platform } from "react-native";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import HomeScreen from "../screens/HomeScreen";
import TabCartButton from "../components/TabCartButton";
import CartPage from "../screens/CartPage";
import AccountScreen from "../screens/AccountScreen";
import Delivery from "../screens/Delivery";
import OrderHistory from "../screens/OrderHistory";
import { RootState } from "../redux/store"; // Adjust the import path according to your project structure

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const cartItems = useSelector((state: RootState) => state.basket.items);
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#000",
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0,
          paddingTop: 10,
          paddingBottom: 25,
          height: 75,
        },
      }}
      tabBar={(props) => (
        <View style={styles.tabBarContainer}>
          <LinearGradient
            colors={["#FCD34D", "#3B82F6"]}
            style={styles.gradient}
          >
            <BottomTabBar {...props} style={styles.tabBar} />
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
            <TabCartButton onPress={() => navigation.navigate("Cart")} />
          ),
          tabBarIcon: ({ color, size }) => (
            <View>
               <Ionicons name="cart-outline" color={color} size={size} />
              {itemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{itemCount}</Text>
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

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradient: {
    height: 75,
  },
  tabBar: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    right: -6,
    top: -3,
    backgroundColor: "red",
    borderRadius: 6,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default MainTabNavigator;
