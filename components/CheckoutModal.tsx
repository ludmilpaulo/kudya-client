import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useSelector } from "react-redux";
import tailwind from "tailwind-react-native-classnames";

import { useNavigation } from "@react-navigation/native";
import { selectBasketItems } from "../redux/slices/basketSlice";
import { RootState } from "../redux/types";

const CheckoutModal = ({ setModalVisible }: { setModalVisible: any }) => {


  const allCartItems = useSelector((state: RootState) => selectBasketItems(state));
    // Group items by resName
    const groupedItems: Record<string, any[]> = {};
    allCartItems.forEach((item) => {
      const key = item.resName;
      if (!groupedItems[key]) {
        groupedItems[key] = [];
      }
      groupedItems[key].push(item);
    });
  
    // Calculate total price and count of items for each group
    const groupedTotalPrices: Record<string, number> = {};
    Object.keys(groupedItems).forEach((key) => {
      groupedTotalPrices[key] = groupedItems[key].reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    });
  
    const totalPrice = Object.values(groupedTotalPrices).reduce(
      (total, price) => total + price,
      0
    );
  
  const navigation = useNavigation<any>();

  const addOrder = () => {
    setModalVisible(false);
    navigation.navigate("CheckoutScreen");
  };

  return (
    <View style={tailwind`flex-1 bg-black bg-opacity-40`}>
      <TouchableOpacity
        style={tailwind`flex-grow`}
        onPress={() => setModalVisible(false)}
      ></TouchableOpacity>
      <View style={tailwind`pb-5  w-full px-4 bg-white pt-4`}>
        <Text style={tailwind`text-black text-center text-xl font-bold mb-5`}>
          Detalhes do checkout
        </Text>
        <View style={tailwind`mb-5`}>
        {Object.keys(groupedItems).map((resName: string) => (
          <OrderItem
            key={resName}
            name={resName}
            value={`${groupedTotalPrices[resName].toFixed(1)}Kz • (${groupedItems[resName].length || 0})`}
            total={undefined}
          />
        ))}
        <OrderItem name="Preço total" value={`${totalPrice}Kz`} total />
      </View>

        <TouchableOpacity
          style={tailwind`py-3 px-10 self-center bg-black rounded-full`}
          onPress={addOrder}
        >
          <Text style={tailwind`text-white`}>Confira</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CheckoutModal;

const OrderItem = ({
  name,
  value,
  total,
}: {
  name: any;
  value: any;
  total: any;
}) => (
  <View
    style={tailwind`flex-row justify-between py-3 border-gray-200 items-center ${
      total ? "border-t" : "border-b"
    }`}
  >
    <Text
      style={tailwind`text-black font-bold text-black ${total && "text-lg"}`}
      numberOfLines={1}
    >
      {name}
    </Text>
    <Text style={tailwind`text-black text-xs ${total && "font-bold"}`}>
      {value}
    </Text>
  </View>
);
