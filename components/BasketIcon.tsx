import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useSelector } from "react-redux";
import {
  selectBasketItems,
  selectBasketTotal,
} from "../redux/slices/basketSlice";
import { useNavigation } from "@react-navigation/native";
import tailwind from "tailwind-react-native-classnames";
import Currency from "react-currency-formatter";

const BasketIcon = () => {
  const items = useSelector(selectBasketItems);
  const navigation = useNavigation<any>();
  const basketTotal = useSelector(selectBasketTotal);

  if (items.length === 0) return null;

  return (
    <View style={tailwind`absolute z-50 w-full bottom-6`}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Cart")}
        style={tailwind`bg-black w-full  absolute bottom-4 self-center rounded-full z-50`}
      >
        <Text
          style={tailwind`"text-white font-extrabold text-lg bg-[##004AAD] py-1 px-2`}
        >
          {items.length}
        </Text>
        <Text
          style={tailwind`flex-1 text-lg font-extrabold text-center text-white`}
        >
          View Basket
        </Text>
        <Text style={tailwind`text-lg font-extrabold text-white`}>
          <Currency quantity={basketTotal} currency="GBP" />
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default BasketIcon;
