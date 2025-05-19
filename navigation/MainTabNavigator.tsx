import React, { useEffect, useRef } from "react";
import { createBottomTabNavigator, BottomTabBar } from "@react-navigation/bottom-tabs";
import { Feather, AntDesign, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { View, Text, SafeAreaView, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";

import HomeScreen from "../screens/RestaurantHomeScreen";
import AccountScreen from "../screens/AccountScreen";
import CartPage from "../screens/CartPage";
import Delivery from "../screens/Delivery";
import OrderHistory from "../screens/OrderHistory";

import { RootState } from "../redux/store";
import { selectUser } from "../redux/slices/authSlice";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.basket.items);
  
  const user = useSelector(selectUser);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const userId = user?.user_id;

  // 🌀 Create animated values for cart and wishlist badges
  const cartPulseAnim = useRef(new Animated.Value(1)).current;
  const wishlistPulseAnim = useRef(new Animated.Value(1)).current;



  useEffect(() => {
    if (cartCount > 0) {
      startPulseAnimation(cartPulseAnim);
    }
  }, [cartCount]);



  const startPulseAnimation = (animationValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1.3,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: "#000",
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "transparent",
            elevation: 0,
            paddingBottom: 10,
            height: 75,
          },
        }}
        tabBar={(props) => (
          <View>
            <LinearGradient
              colors={["#FCD34D", "#ffcc00", "#3B82F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 75 }}
            >
              <BottomTabBar {...props} />
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
              <MaterialIcons name="local-offer" color={color} size={size} />
            ),
          }}
        />

        <Tab.Screen
          name="Cart"
          component={CartPage}
          options={{
            tabBarIcon: ({ color, size }) => (
              <View>
                <FontAwesome name="shopping-cart" color={color} size={size} />
                {cartCount > 0 && (
                  <Animated.View
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -10,
                      backgroundColor: "red",
                      borderRadius: 10,
                      width: 18,
                      height: 18,
                      justifyContent: "center",
                      alignItems: "center",
                      transform: [{ scale: cartPulseAnim }],
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      {cartCount}
                    </Text>
                  </Animated.View>
                )}
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="Pedidos"
          component={OrderHistory}
          options={{
            tabBarIcon: ({ color, size }) => (
              <View>
                <FontAwesome name="heart" color={color} size={size} />
               
                  <Animated.View
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -10,
                      backgroundColor: "red",
                      borderRadius: 10,
                      width: 18,
                      height: 18,
                      justifyContent: "center",
                      alignItems: "center",
                      transform: [{ scale: wishlistPulseAnim }],
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                    
                    </Text>
                  </Animated.View>
              
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="Account"
          component={AccountScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Feather name="user" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default MainTabNavigator;