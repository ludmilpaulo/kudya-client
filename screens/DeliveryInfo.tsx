import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import tailwind from 'tailwind-react-native-classnames';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/authSlice';

type CustomerData = {
  id: number;
  name: string;
  avatar: string;
  phone: string;
  address: string;
};

type RestaurantData = {
  id: number;
  name: string;
  phone: string;
  address: string;
};

type MealData = {
  id: number;
  name: string;
  price: number;
};

type OrderDetailsData = {
  id: number;
  meal: MealData;
  quantity: number;
  sub_total: number;
};

type DriverData = {
  id: number;
  name: string;
  avatar: string;
  phone: string;
  address: string;
};

type OrderHistoryItem = {
  id: number;
  customer: CustomerData;
  restaurant: RestaurantData;
  driver: DriverData;
  order_details: OrderDetailsData[];
  total: number;
  status: string;
  address: string;
};

type Props = {};

const DeliveryInfo: React.FC<Props> = () => {
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);

  const fetchOrderHistory = async () => {
    try {
      const user = useSelector(selectUser);
      let userData = user;

      let response = await fetch(
        'https://www.sunshinedeliver.com/api/customer/order/history/',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: user.token,
          }),
        }
      );

      let responseJson = await response.json();

      setOrderHistory(responseJson.order_history);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  return (
    <ScrollView style={tailwind`p-4`}>
      {orderHistory.map((order, index) => (
        <View key={index} style={tailwind`mb-4 border border-gray-300 p-4 rounded`}>
          <View style={tailwind`flex-row items-center mb-2`}>
            <Image source={{ uri: order.customer.avatar }} style={tailwind`w-12 h-12 rounded-full mr-2`} />
            <View>
              <Text style={tailwind`font-bold`}>{order.customer.name}</Text>
              <Text>{order.customer.phone}</Text>
            </View>
          </View>
          <View style={tailwind`mb-2`}>
            <Text style={tailwind`font-bold text-lg`}>{order.restaurant.name}</Text>
            <Text style={tailwind`text-gray-500`}>{order.restaurant.address}</Text>
            <Text style={tailwind`font-bold text-green-500`}>{order.status}</Text>
          </View>
          <View style={tailwind`mb-2`}>
            {order.order_details.map((detail, detailIndex) => (
              <View key={detailIndex} style={tailwind`mb-2`}>
                <Text>{detail.meal.name}</Text>
                <Text>Quantity: {detail.quantity}</Text>
                <Text>Subtotal: {detail.sub_total}</Text>
              </View>
            ))}
          </View>
          <Text style={tailwind`font-bold text-lg mb-2`}>Total: {order.total}</Text>
          <Text style={tailwind`text-gray-500`}>Address: {order.address}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default DeliveryInfo;
