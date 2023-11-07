import React from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import tailwind from "tailwind-react-native-classnames";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { removeFromBasket } from "../redux/slices/basketSlice";
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
  short_description: string;
  image: string;
};

const CartItems = () => {
  const allCartItems = useSelector((state: RootState) => state.basket.items);
  const dispatch = useDispatch();

  // Function to remove an item from the basket
  const handleRemove = (item: ItemType) => {
    dispatch(removeFromBasket(item.id));
  };

  return (
    <ScrollView style={tailwind`mx-4 mt-3`} showsVerticalScrollIndicator={false}>
      {!allCartItems.length ? (
        <Text style={tailwind`text-center text-black`}>
          Nenhum item no carrinho!
        </Text>
      ) : (
        allCartItems.map((item) => (
          <View key={item.id} style={tailwind`mb-4`}>
            <View style={tailwind`mb-4 relative justify-center`}>
              <Image style={tailwind`w-full h-16 rounded-lg`} source={{ uri: item.resImage }} />
              <View style={[tailwind`absolute top-0 left-0 w-full h-full bg-black rounded-lg`, { opacity: 0.5 }]} />
              <Text style={tailwind`absolute self-center text-white w-3/4 text-center font-bold text-xl`} numberOfLines={1}>
                {item.resName}
              </Text>
            </View>
            {allCartItems.map((food) => (
              <View style={tailwind`mb-3 flex-row justify-between items-center pb-3 border-b border-gray-100`} key={food.id}>
                <View style={tailwind`flex-1 pr-3 flex-row items-center`}>
                  <BouncyCheckbox
                    fillColor={colors.black}
                    isChecked={true}
                    onPress={() => handleRemove(food?.id)}
                  />
                  <View style={tailwind`flex-1 pl-2`}>
                    <Text style={[tailwind`text-gray-900 font-bold mb-1`, { fontSize: 16 }]}>{food.name}</Text>
                    <Text style={tailwind`text-gray-800 text-xs`}>{food.price}Kz</Text>
                    <Text style={tailwind`text-gray-600 text-xs`}>{food.short_description}</Text>
                  </View>
                </View>
                <View style={tailwind``}>
                  <Image style={tailwind`h-16 w-16 rounded-lg`} source={{ uri: food.image }} />
                </View>
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default CartItems;

