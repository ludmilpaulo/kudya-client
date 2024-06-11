import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import tailwind from 'tailwind-react-native-classnames';
import { useAppSelector } from '../redux/store';
import { addItem, removeItem } from '../redux/slices/basketSlice';
import { baseAPI } from '../services/types';

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
  const navigation = useNavigation();
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
    // Save items to async storage or pass them through navigation params
    navigation.navigate('CheckoutPage', { restaurantId, items });
  };

  if (loading) {
    return (
      <View style={tailwind`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={tailwind`p-6 bg-white`}>
      <Text style={tailwind`text-3xl font-semibold mb-6`}>Carrinho de Compras</Text>
      {cartItems.length === 0 ? (
        <Text style={tailwind`text-gray-600`}>Seu carrinho está vazio.</Text>
      ) : (
        Object.entries(groupedItems).map(([restaurantId, items]) => {
          const restaurant = restaurants.find((res) => res.id === parseInt(restaurantId));
          const restaurantName = restaurant ? restaurant.name : `Restaurante ${restaurantId}`;
          const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);
          return (
            <View key={restaurantId} style={tailwind`mb-6`}>
              <Text style={tailwind`text-2xl font-semibold text-gray-800 mb-4`}>{restaurantName}</Text>
              <View style={tailwind`mb-6`}>
                {items.map((item) => (
                  <View key={item.id} style={tailwind`bg-white rounded-lg shadow-lg overflow-hidden mb-4`}>
                    <View style={tailwind`flex-row items-center p-4`}>
                      <Image source={{ uri: item.image_url }} style={tailwind`w-24 h-24`} />
                      <View style={tailwind`ml-4 flex-grow`}>
                        <Text style={tailwind`text-xl font-semibold text-gray-800`}>{item.name}</Text>
                        <Text style={tailwind`text-gray-800 font-bold`}>Preço: {item.price} Kz</Text>
                        <View style={tailwind`flex-row items-center mt-4`}>
                          <TouchableOpacity
                            style={tailwind`px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700`}
                            onPress={() => handleAddToCart(item)}
                          >
                            <Text>+</Text>
                          </TouchableOpacity>
                          <Text style={tailwind`mx-4 text-gray-800 font-semibold`}>{item.quantity}</Text>
                          <TouchableOpacity
                            style={tailwind`px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700`}
                            onPress={() => handleRemoveFromCart(item.id)}
                          >
                            <Text>-</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={tailwind`px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700`}
                        onPress={() => handleRemoveItemCompletely(item.id)}
                      >
                        <Text>Remover</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
              <View style={tailwind`flex-row justify-between items-center mb-6`}>
                <Text style={tailwind`text-lg font-semibold text-gray-800`}>Total: {totalPrice} Kz</Text>
                <TouchableOpacity
                  style={tailwind`px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700`}
                  onPress={() => handleCheckout(parseInt(restaurantId))}
                >
                  <Text>Finalizar Compra</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

export default CartPage;
