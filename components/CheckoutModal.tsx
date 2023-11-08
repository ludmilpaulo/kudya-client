import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useSelector } from "react-redux";
import tailwind from "tailwind-react-native-classnames";

import { useNavigation } from "@react-navigation/native";
import { selectBasketItems } from "../redux/slices/basketSlice";
import { RootState } from "../redux/types";

const CheckoutModal = ({ setModalVisible }: { setModalVisible: any }) => {


  const allCartItems = useSelector((state: RootState) => selectBasketItems(state));
  // Calculate total price and count of items
  const totalPrice = allCartItems.reduce(
    (total, item) => total + item.price * item.quantity,
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
        {allCartItems?.map((item: any, index: number) => (
  <OrderItem
    key={item.id} // Use a unique identifier as the key
    name={item.resName}
    value={`${
      item?.foods
        ? item.foods
            .reduce(
              (total: any, food: any) => total + food.price * food.quantity,
              0
            )
            .toFixed(1)
        : '0.0'
    }Kz • (${item?.foods?.length || 0})`}
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
