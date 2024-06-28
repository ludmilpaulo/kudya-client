import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppSelector } from "../redux/store";
import { addItem, removeItem } from "../redux/slices/basketSlice";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { RootStackParamList, Meal } from "../services/types";

type FoodDetailsPageRouteProp = RouteProp<RootStackParamList, 'FoodDetailsPage'>;

const FoodDetailsPage: React.FC = () => {
  const route = useRoute<FoodDetailsPageRouteProp>();
  const meal = route.params.meal;
  const dispatch = useDispatch();
  const cartItems = useAppSelector((state) => state.basket.items);
  const navigation = useNavigation<any>();

  const handleAddToCart = (meal: Meal) => {
    dispatch(addItem(meal));
  };

  const handleRemoveFromCart = (mealId: number) => {
    dispatch(removeItem(mealId));
  };

  const isInCart = (mealId: number) => cartItems.some((item) => item.id === mealId);

  return (
    <LinearGradient colors={["#FCD34D", "#3B82F6"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Refeição</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Image source={{ uri: meal.image_url }} style={styles.image} />
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{meal.name}</Text>
          <Text style={styles.description}>
            {meal.short_description
              ? `${meal.short_description}`
              : meal.short_description}
          </Text>
          <Text style={styles.price}>Preço: {meal.price} Kz</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={() => handleRemoveFromCart(meal.id)} style={styles.iconButton}>
              <AntDesign name="minuscircle" size={24} color="red" />
            </TouchableOpacity>
            <Text style={styles.quantity}>
              {cartItems.find((item) => item.id === meal.id)?.quantity || 0}
            </Text>
            <TouchableOpacity onPress={() => handleAddToCart(meal)} style={styles.iconButton}>
              <AntDesign name="pluscircle" size={24} color="green" />
            </TouchableOpacity>
          </View>
          <View style={styles.cartButtonContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("CartPage")}
              style={styles.cartButton}
            >
              <Text style={styles.cartButtonText}>Ir para o carrinho</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollViewContent: {
    padding: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    marginTop: 8,
    fontSize: 16,
    color: "#666",
  },
  price: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  iconButton: {
    padding: 8,
  },
  quantity: {
    marginHorizontal: 16,
    fontSize: 18,
    color: "#333",
  },
  cartButtonContainer: {
    marginTop: 16,
  },
  cartButton: {
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cartButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default FoodDetailsPage;
