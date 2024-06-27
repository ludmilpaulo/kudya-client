import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../redux/store';
import { addItem, removeItem } from '../redux/slices/basketSlice';
import { baseAPI } from '../services/types';
import { LinearGradient } from 'expo-linear-gradient';

type Restaurant = {
  id: number;
  name: string;
  is_approved: boolean;
};

type Meal = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  restaurant: number;
};

const CartPage: React.FC = () => {
  const cartItems = useAppSelector((state) => state.basket.items as Meal[]);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${baseAPI}/customer/customer/restaurants/`)
      .then((response) => response.json())
      .then((data) => {
        const approvedRestaurants = data.restaurants.filter(
          (restaurant: Restaurant) => restaurant.is_approved
        );
        setRestaurants(approvedRestaurants);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (meal: Meal) => {
    dispatch(addItem(meal));
  };

  const handleRemoveFromCart = (mealId: number) => {
    dispatch(removeItem(mealId));
  };

  const handleRemoveItemCompletely = (mealId: number) => {
    const item = cartItems.find((item) => item.id === mealId);
    if (item) {
      for (let i = 0; i < item.quantity; i++) {
        dispatch(removeItem(mealId));
      }
    }
  };

  const groupedItems = cartItems.reduce((acc: { [key: number]: Meal[] }, item: Meal) => {
    if (!acc[item.restaurant]) {
      acc[item.restaurant] = [];
    }
    acc[item.restaurant].push(item);
    return acc;
  }, {});

  const handleCheckout = (restaurantId: number) => {
    const items = groupedItems[restaurantId];
    navigation.navigate('CheckoutPage', { restaurantId, items });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#FCD34D', '#3B82F6']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <Text style={styles.headerText}>Carrinho de Compras</Text>
          {cartItems.length === 0 ? (
            <Text style={styles.emptyCartText}>Seu carrinho está vazio.</Text>
          ) : (
            Object.entries(groupedItems).map(([restaurantId, items]) => {
              const restaurant = restaurants.find((res) => res.id === parseInt(restaurantId));
              const restaurantName = restaurant ? restaurant.name : `Restaurante ${restaurantId}`;
              const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);
              return (
                <View key={restaurantId} style={styles.restaurantContainer}>
                  <Text style={styles.restaurantName}>{restaurantName}</Text>
                  <View style={styles.itemsContainer}>
                    {items.map((item) => (
                      <View key={item.id} style={styles.itemCard}>
                        <View style={styles.itemRow}>
                          <Image source={{ uri: item.image_url }} style={styles.itemImage} />
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>Preço: {item.price} Kz</Text>
                            <View style={styles.quantityContainer}>
                              <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => handleAddToCart(item)}
                              >
                                <Text style={styles.buttonText}>+</Text>
                              </TouchableOpacity>
                              <Text style={styles.itemQuantity}>{item.quantity}</Text>
                              <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => handleRemoveFromCart(item.id)}
                              >
                                <Text style={styles.buttonText}>-</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={styles.removeItemButton}
                            onPress={() => handleRemoveItemCompletely(item.id)}
                          >
                            <Text style={styles.removeButtonText}>Remover</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                  <View style={styles.checkoutContainer}>
                    <Text style={styles.totalPriceText}>Total: {totalPrice} Kz</Text>
                    <TouchableOpacity
                      style={styles.checkoutButton}
                      onPress={() => handleCheckout(parseInt(restaurantId))}
                    >
                      <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
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
  scrollViewContainer: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  emptyCartText: {
    color: '#e5e7eb',
  },
  restaurantContainer: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  itemsContainer: {
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  itemPrice: {
    color: '#1F2937',
    fontWeight: 'bold',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
  },
  buttonText: {
    color: '#FFF',
  },
  itemQuantity: {
    color: '#1F2937',
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  removeItemButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
  },
  removeButtonText: {
    color: '#FFF',
  },
  checkoutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  checkoutButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
  },
  checkoutButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default CartPage;
