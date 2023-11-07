import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Currency from "react-currency-formatter";
import { MinusCircleIcon, PlusCircleIcon } from "react-native-heroicons/solid";
import { useDispatch, useSelector } from "react-redux";
import {
  addToBasket,
  removeFromBasket,
  selectBasketItems,
} from "../redux/slices/basketSlice";
import tailwind from "tailwind-react-native-classnames";
import { RootState } from "../redux/types";

interface Meals {
  food: any;
  resImage: string;
  resName: string;
  resId: number;
  id: number;
  name: string;
  price: number;
  short_description: string;
  image: string;
}

const MenuItems = ({ resId, food, resName, resImage }: Meals) => {
  const items = useSelector((state: RootState) => selectBasketItems(state));
  const dispatch = useDispatch();

  const basketItem = items.find((item) => item.id === food.id);
  const quantity = basketItem ? basketItem.quantity : 0;

  const addItemToBasket = () => {
    if (basketItem) {
      console.log("Existing item, current quantity:", basketItem.quantity);
      dispatch(
        addToBasket({
          ...basketItem,
          quantity: basketItem.quantity + 1,
        })
      );
      console.log("Updated quantity:", basketItem.quantity + 1);
    } else {
      console.log("New item, adding to basket");
      dispatch(
        addToBasket({
          id: food.id,
          resId,
          resName,
          resImage,
          name: food.name,
          short_description: food.short_description,
          price: food.price,
          image: food.image,
          quantity: 1,
        })
      );
      console.log("Updated quantity: 1");
    }
  };
  

  const removeItemFromBasket = () => {
    console.log("Removing item from basket:", food.id, quantity);
    const basketItem = items.find((item) => item.id === food.id);
  
    if (basketItem && basketItem.quantity > 1) {
      console.log("Item with quantity > 1, current quantity:", basketItem.quantity);
      dispatch(
        removeFromBasket(food.id) // Use removeFromBasket for items with quantity > 1
      );
    } else {
      console.log("Item with quantity 1, removing from basket");
      dispatch(removeFromBasket(food.id)); // Use removeFromBasket for items with quantity 1 as well
    }
  };
  
  
  

  return (
    <>
      <TouchableOpacity style={tailwind`bg-white border p-4 border-gray-200`}>
        <View style={tailwind`flex-row`}>
          <View style={tailwind`flex-1 pr-2`}>
            <Text style={tailwind`text-lg mb-1`}>{food.name}</Text>
            <Text style={tailwind`text-gray-400`}>{food.short_description}</Text>
            <Text style={tailwind`text-gray-400 mt-2`}>
              <Currency quantity={food.price} currency="GBP" />
            </Text>
          </View>

          <View>
            <Image
              style={{
                borderWidth: 1,
                borderColor: "#F3F3F4",
                height: 80,
                width: 80,
                backgroundColor: "gray",
                padding: 16,
              }}
              source={{ uri: food.image }}
            />
          </View>
        </View>
      </TouchableOpacity>

      <View style={tailwind`bg-white px-4`}>
        <View style={tailwind`flex-row items-center space-x-2 pb-3`}>
          <TouchableOpacity
            disabled={quantity === 0}
            onPress={removeItemFromBasket}
          >
            <MinusCircleIcon
              color={quantity > 0 ? "#00CCBB" : "gray"}
              size={40}
            />
          </TouchableOpacity>

          <Text>{quantity}</Text>

          <TouchableOpacity onPress={addItemToBasket}>
            <PlusCircleIcon color="#00CCBB" size={40} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default MenuItems;
