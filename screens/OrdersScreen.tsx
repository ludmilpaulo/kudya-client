import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import tw from "twrnc";
import { useTranslation } from "../hooks/useTranslation";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAppSelector } from "../redux/store";
import { selectUser } from "../redux/slices/authSlice";
import { baseAPI } from "../services/types";

type OrderHistoryItem = {
  id: number;
  status: string | number;
  total: number | string;
  created_at?: string;
  picked_at?: string;
};

const OrdersScreen: React.FC = () => {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${baseAPI}/customer/customer/order/history/`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ access_token: user.token }),
        });
        if (!response.ok) {
          throw new Error("Failed to load orders");
        }
        const data = (await response.json()) as { order_history?: OrderHistoryItem[] };
        if (mounted) {
          setOrders(data.order_history ?? []);
        }
      } catch {
        if (mounted) {
          setError(t("loadFailed", "Failed to load orders"));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.token, t]);

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white px-6`}>
        <Text style={tw`text-red-600 text-center`}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      <Text style={tw`text-2xl font-bold text-gray-900 px-6 pt-6`}>
        {t("Orders")}
      </Text>
      {orders.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center mt-20`}>
          <FontAwesome5 name="clipboard-list" size={60} color="#0284c7" />
          <Text style={tw`mt-6 text-lg text-gray-500`}>{t("noOrdersYet", "No orders yet")}</Text>
        </View>
      ) : (
        <View style={tw`px-4 pt-2`}>
          {orders.map((order) => (
            <View
              key={order.id}
              style={tw`bg-gray-100 rounded-xl p-4 mb-4`}
            >
              <Text style={tw`text-lg font-bold`}>
                #{order.id} - {String(order.status)}
              </Text>
              <Text style={tw`text-sm text-gray-500`}>
                {order.picked_at || order.created_at || ""}
              </Text>
              <Text style={tw`text-base text-green-700 mt-1`}>
                {order.total}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default OrdersScreen;
