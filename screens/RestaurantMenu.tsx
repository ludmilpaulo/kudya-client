import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import tailwind from 'tailwind-react-native-classnames';
import { useAppSelector } from '../redux/store';
import { addItem, removeItem } from '../redux/slices/basketSlice';
import { baseAPI } from '../services/types';

type Meal = {
  id: number;
  image_url: string;
  name: string;
  short_description: string;
  price: number;
  quantity: number;
  category: string;
  restaurant: number;
};

type Category = string;

const RestaurantMenu: React.FC = () => {
  const navigation = useNavigation();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const restaurant_id = '1'; // Replace with actual restaurant_id from params or props
  const dispatch = useDispatch();
  const cartItems = useAppSelector((state) => state.basket.items);

  useEffect(() => {
    if (restaurant_id) {
      fetch(`${baseAPI}/customer/customer/meals/${restaurant_id}/`)
        .then((response) => response.json())
        .then((data) => {
          setMeals(data.meals);
          const uniqueCategories = Array.from(new Set<string>(data.meals.map((meal: Meal) => meal.category)));
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
    <View style={tailwind`flex-1 bg-white`}>
      {loading ? (
        <View style={tailwind`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={tailwind`p-6`}>
          <View style={tailwind`flex-row justify-between mb-6`}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={tailwind`px-4 py-2 rounded-full text-sm font-semibold ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text>{category}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={tailwind`px-4 py-2 rounded-full text-sm font-semibold ${selectedCategory === null ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onPress={() => setSelectedCategory(null)}
              >
                <Text>All</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          <View style={tailwind`flex-row flex-wrap justify-between`}>
            {filteredMeals.map((meal) => (
              <View key={meal.id} style={tailwind`w-full sm:w-1/2 lg:w-1/3 p-2`}>
                <View style={tailwind`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300`}>
                  <Image source={{ uri: meal.image_url }} style={tailwind`w-full h-48`} />
                  <View style={tailwind`p-4`}>
                    <Text style={tailwind`text-2xl font-semibold text-gray-800`}>{meal.name}</Text>
                    <Text style={tailwind`text-gray-600`}>{meal.short_description.length > 100 ? `${meal.short_description.substring(0, 100)}...` : meal.short_description}</Text>
                    <Text style={tailwind`text-gray-800 font-bold`}>Preço: {meal.price} Kz</Text>
                    <View style={tailwind`flex-row items-center mt-4`}>
                      <TouchableOpacity
                        style={tailwind`px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700`}
                        onPress={() => handleAddToCart(meal)}
                      >
                        <Text>+</Text>
                      </TouchableOpacity>
                      <Text style={tailwind`mx-4 text-gray-800 font-semibold`}>
                        {cartItems.find((item) => item.id === meal.id)?.quantity || 0}
                      </Text>
                      <TouchableOpacity
                        style={tailwind`px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700`}
                        onPress={() => handleRemoveFromCart(meal.id)}
                      >
                        <Text>-</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={tailwind`mt-4`}>
                      {isInCart(meal.id) ? (
                        <TouchableOpacity
                          style={tailwind`px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700`}
                          onPress={() => navigation.navigate('CartPage')}
                        >
                          <Text>Ir para o carrinho</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={tailwind`px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700`}
                          onPress={() => handleViewDetails(meal)}
                        >
                          <Text>Ver a refeição</Text>
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
    </View>
  );
};

export default RestaurantMenu;
