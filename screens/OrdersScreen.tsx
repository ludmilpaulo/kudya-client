import React from "react";
import { View, Text, ScrollView } from "react-native";
import tw from "twrnc";
import { useTranslation } from "../hooks/useTranslation";
import { FontAwesome5 } from "@expo/vector-icons";

// Dummy order data (replace with Redux/API)
const dummyOrders = [
  {
    id: 1,
    status: "Delivered",
    total: 325.45,
    date: "2024-06-09",
  },
  {
    id: 2,
    status: "Processing",
    total: 54.99,
    date: "2024-06-07",
  },
];

const OrdersScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      <Text style={tw`text-2xl font-bold text-gray-900 px-6 pt-6`}>
        {t("Orders")}
      </Text>
      {dummyOrders.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center mt-20`}>
          <FontAwesome5 name="clipboard-list" size={60} color="#0284c7" />
          <Text style={tw`mt-6 text-lg text-gray-500`}>{t("noReviews")}</Text>
        </View>
      ) : (
        <View style={tw`px-4 pt-2`}>
          {dummyOrders.map((order) => (
            <View
              key={order.id}
              style={tw`bg-gray-100 rounded-xl p-4 mb-4`}
            >
              <Text style={tw`text-lg font-bold`}>
                #{order.id} - {order.status}
              </Text>
              <Text style={tw`text-sm text-gray-500`}>
                {order.date}
              </Text>
              <Text style={tw`text-base text-green-700 mt-1`}>
                ${order.total}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default OrdersScreen;
