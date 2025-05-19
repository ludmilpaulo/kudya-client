import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { removeItem, clearAllCart } from '../redux/slices/basketSlice';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';

export default function CartScreen() {
  const items = useSelector((state: RootState) => state.basket.items);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <ScrollView style={tw`flex-1 p-4`}>
        <Text style={tw`text-2xl font-bold text-gray-800 mb-4`}>Your Cart</Text>
        {items.length === 0 && (
          <Text style={tw`text-center text-gray-500 mt-8`}>Your cart is empty.</Text>
        )}

        {items.map(item => (
          <View key={item.id} style={tw`bg-white p-4 mb-4 rounded-xl flex-row shadow-sm`}>
            <Image source={{ uri: item.image }} style={tw`w-14 h-14 rounded-lg`} contentFit="cover"/>
            <View style={tw`ml-4 flex-1`}>
              <Text style={tw`text-lg font-semibold`}>{item.name}</Text>
              <Text style={tw`text-gray-500`}>Qty: {item.quantity}</Text>
              <Text style={tw`text-blue-600 font-bold`}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
            <TouchableOpacity onPress={() => dispatch(removeItem(item.id))}>
              <Text style={tw`text-red-500 font-semibold`}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {items.length > 0 && (
        <View style={tw`p-4 bg-white shadow-lg`}>
          <Text style={tw`text-lg font-bold mb-2`}>Total: ${total.toFixed(2)}</Text>
          <TouchableOpacity
            style={tw`bg-blue-600 py-3 rounded-xl`}
            onPress={() => navigation.navigate('Checkout')}
          >
            <Text style={tw`text-center text-white font-semibold`}>Proceed to Checkout</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => dispatch(clearAllCart())}>
            <Text style={tw`text-red-500 text-center mt-3 font-semibold`}>Clear Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
