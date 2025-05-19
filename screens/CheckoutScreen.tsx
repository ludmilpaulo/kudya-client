import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { clearAllCart } from '../redux/slices/basketSlice';
import tw from 'twrnc';

export default function CheckoutScreen() {
  const items = useSelector((state: RootState) => state.basket.items);
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const dispatch = useDispatch<AppDispatch>();

  const handleCheckout = () => {
    Alert.alert("Order Confirmed", "Thank you for your purchase!");
    dispatch(clearAllCart());
  };

  return (
    <ScrollView style={tw`flex-1 bg-gray-50 p-4`}>
      <Text style={tw`text-2xl font-bold text-gray-800 mb-4`}>Checkout</Text>

      <View style={tw`bg-white p-4 rounded-xl shadow-sm`}>
        <Text style={tw`font-semibold text-lg`}>Order Summary</Text>
        {items.map(item => (
          <View key={item.id} style={tw`flex-row justify-between py-2`}>
            <Text style={tw`text-gray-700`}>{item.name} (x{item.quantity})</Text>
            <Text style={tw`text-gray-700`}>${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View style={tw`border-t border-gray-200 mt-4 pt-4 flex-row justify-between`}>
          <Text style={tw`text-lg font-bold`}>Total</Text>
          <Text style={tw`text-lg font-bold`}>${total.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={tw`bg-blue-600 py-4 rounded-xl mt-6`}
        onPress={handleCheckout}
      >
        <Text style={tw`text-center text-white font-semibold`}>Confirm Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
