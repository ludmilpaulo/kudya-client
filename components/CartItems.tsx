import React from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import tailwind from "tailwind-react-native-classnames";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { BasketItem, removeFromBasket } from "../redux/slices/basketSlice";
import { RootState } from "../redux/types";

import colors from "../configs/colors";

// Define the item type, make sure this corresponds to your actual item structure
type ItemType = {
  id: number;
  resName: string;
  resImage: string;
  foods: FoodType[];
};

// Define the food type, make sure this corresponds to your actual food structure
type FoodType = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  short_description: string;
  image: string;
};

const CartItems = () => {
  const allCartItems = useSelector((state: RootState) => state.basket.items);
  const dispatch = useDispatch();

  const handleRemove = (food: FoodType) => {
    // Find the corresponding BasketItem based on a matching field (e.g., id)
    const basketItemToRemove = allCartItems.find(item => item.id === food.id);
  
    if (basketItemToRemove) {
      dispatch(removeFromBasket(basketItemToRemove.id));
    }
  };
  
  

  // Group items by restaurant
  const groupedItems: { [key: string]: ItemType } = {};

  allCartItems.forEach((item) => {
    if (!groupedItems[item.resName]) {
      groupedItems[item.resName] = { ...item, foods: [] };
    }
    groupedItems[item.resName].foods.push(item);
  });

  return (
    <ScrollView style={tailwind`mx-4 mt-3`} showsVerticalScrollIndicator={false}>
      {Object.values(groupedItems).map((item) => (
        <View key={item.id} style={tailwind`mb-4`}>
          <View style={tailwind`mb-4 relative justify-center`}>
            <Image style={tailwind`w-full h-16 rounded-lg`} source={{ uri: item.resImage }} />
            <View style={[tailwind`absolute top-0 left-0 w-full h-full bg-black rounded-lg`, { opacity: 0.5 }]} />
            <Text style={tailwind`absolute self-center text-white w-3/4 text-center font-bold text-xl`} numberOfLines={1}>
              {item.resName}
            </Text>
          </View>
          {item.foods.map((food) => (
            <View style={tailwind`mb-3 flex-row justify-between items-center pb-3 border-b border-gray-100`} key={food.id}>
              <View style={tailwind`flex-1 pr-3 flex-row items-center`}>
              <BouncyCheckbox
                fillColor={colors.black}
                isChecked={true}
                onPress={() => handleRemove(food)}
              />

                <View style={tailwind`flex-1 pl-2`}>
                  <Text style={[tailwind`text-gray-900 font-bold mb-1`, { fontSize: 16 }]}>{food.name}</Text>
                  <Text style={tailwind`text-gray-800 text-xs`}>{food.quantity} x {food.price}Kz</Text>
                  <Text style={tailwind`text-gray-600 text-xs`}>{food.short_description}</Text>
                </View>
              </View>
              <View style={tailwind``}>
                <Image style={tailwind`h-16 w-16 rounded-lg`} source={{ uri: food.image }} />
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

export default CartItems;
