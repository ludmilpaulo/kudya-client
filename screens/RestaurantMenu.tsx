import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../redux/store';
import { addItem, removeItem } from '../redux/slices/basketSlice';
import { baseAPI, RootStackParamList, Meal, Category } from '../services/types';
import { LinearGradient } from 'expo-linear-gradient';

type RestaurantMenuRouteProp = RouteProp<RootStackParamList, 'RestaurantMenu'>;

const RestaurantMenu: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RestaurantMenuRouteProp>();
  const { restaurant_id, restaurant_logo } = route.params;
  const [meals, setMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const cartItems = useAppSelector((state) => state.basket.items);

  useEffect(() => {
    if (restaurant_id) {
      fetch(`${baseAPI}/customer/customer/meals/${restaurant_id}/`)
        .then((response) => response.json())
        .then((data) => {
          const meals = data.meals.map((meal: any) => ({
            ...meal,
            price: parseFloat(meal.price),
          }));
          console.log("meals==>", meals);
          setMeals(meals);
          // Ensure unique categories are extracted as objects with id, name, and image properties
          const uniqueCategories: Category[] = Array.from(
            new Set(meals.map((meal: Meal) => meal.category))
          ).map((name) => {
            const foundMeal = meals.find((meal: Meal) => meal.category === name);
            return {
              id: foundMeal?.category.id || 0, // Assuming id is 0 if not found
              name: name as string, // Explicitly cast name to string
              image: foundMeal?.category.image || "default-image-url", // Provide a default image URL if not found
            };
          });
  
          console.log("unique category", uniqueCategories);
          setCategories(uniqueCategories);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching meals:', error);
          setLoading(false);
        });
    }
  }, [restaurant_id]);
  
  
  
  const filteredMeals = selectedCategory
    ? meals.filter((meal) => meal.category === selectedCategory)
    : meals;
  
  const handleAddToCart = (meal: Meal) => {
    dispatch(addItem(meal));
  };
  
  const handleRemoveFromCart = (mealId: number) => {
    dispatch(removeItem(mealId));
  };
  
  const isInCart = (mealId: number) => cartItems.some((item) => item.id === mealId);
  
  const handleViewDetails = (meal: Meal) => {
    navigation.navigate('FoodDetailsPage', { meal });
  };
  
  return (
    <LinearGradient colors={['#FCD34D', '#3B82F6']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollView}>
            <Image source={{ uri: restaurant_logo }} style={styles.restaurantLogo} resizeMode="cover" />
            <View style={styles.categoriesContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.name && styles.selectedCategoryButton,
                    ]}
                    onPress={() => setSelectedCategory(category.name)}
                  >
                    <Text style={[styles.categoryText, selectedCategory === category.name && styles.selectedCategoryText]}>
                      {category.name ?? 'Sem Categoria'}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    selectedCategory === null && styles.selectedCategoryButton,
                  ]}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text style={[styles.categoryText, selectedCategory === null && styles.selectedCategoryText]}>
                    todas categorias
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
            <View style={styles.mealsContainer}>
              {filteredMeals.map((meal) => (
                <View key={meal.id} style={styles.mealCardContainer}>
                  <View style={styles.mealCard}>
                    <Image source={{ uri: meal.image_url }} style={styles.mealImage} />
                    <View style={styles.mealInfoContainer}>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <Text style={styles.mealPrice}>Preço: {meal.price} Kz</Text>
                      <View style={styles.mealActions}>
                        <TouchableOpacity
                          style={styles.addToCartButton}
                          onPress={() => handleAddToCart(meal)}
                        >
                          <Text style={styles.buttonText}>+</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>
                          {cartItems.find((item) => item.id === meal.id)?.quantity || 0}
                        </Text>
                        <TouchableOpacity
                          style={styles.removeFromCartButton}
                          onPress={() => handleRemoveFromCart(meal.id)}
                        >
                          <Text style={styles.buttonText}>-</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.detailsButtonContainer}>
                        {isInCart(meal.id) ? (
                          <TouchableOpacity
                            style={styles.goToCartButton}
                            onPress={() => navigation.navigate('CartPage')}
                          >
                            <Text style={styles.buttonText}>Ir para o carrinho</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={styles.viewDetailsButton}
                            onPress={() => handleViewDetails(meal)}
                          >
                            <Text style={styles.buttonText}>Ver a refeição</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      padding: 16,
    },
    restaurantLogo: {
      width: '100%',
      height: 200,
      borderRadius: 16,
      marginBottom: 16,
    },
    categoriesContainer: {
      marginBottom: 16,
    },
    categoriesScroll: {
      paddingBottom: 8,
    },
    categoryButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 9999,
      backgroundColor: '#e5e7eb',
      marginRight: 8,
    },
    selectedCategoryButton: {
      backgroundColor: '#3b82f6',
    },
    categoryText: {
      color: '#1f2937',
    },
    selectedCategoryText: {
      color: '#ffffff',
    },
    mealsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    mealCardContainer: {
      width: '48%',
      marginBottom: 16,
    },
    mealCard: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    mealImage: {
      width: '100%',
      height: 150,
    },
    mealInfoContainer: {
      padding: 16,
    },
    mealName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1f2937',
    },
    mealPrice: {
      fontWeight: 'bold',
      color: '#1f2937',
      marginTop: 8,
    },
    mealActions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
    },
    addToCartButton: {
      backgroundColor: '#3b82f6',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 9999,
      marginRight: 8,
    },
    removeFromCartButton: {
      backgroundColor: '#ef4444',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 9999,
    },
    buttonText: {
      color: '#ffffff',
    },
    quantityText: {
      color: '#1f2937',
      fontWeight: 'bold',
      marginHorizontal: 8,
    },
    detailsButtonContainer: {
      marginTop: 16,
    },
    goToCartButton: {
      backgroundColor: '#10b981',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 9999,
      marginTop: 8,
    },
    viewDetailsButton: {
      backgroundColor: '#6b7280',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 9999,
      marginTop: 8,
    },
  });
  
  export default RestaurantMenu;
  