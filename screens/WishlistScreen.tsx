import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import tw from "twrnc";
import { useTranslation } from "../hooks/useTranslation";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAppSelector } from "../redux/store";
import { selectUser } from "../redux/slices/authSlice";
import { getWishlist, type WishlistItem } from "../services/WishlistService";

const WishlistScreen: React.FC = () => {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.user_id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await getWishlist(user.user_id);
        if (mounted) {
          setItems(data);
        }
      } catch {
        if (mounted) {
          setError(t("loadFailed", "Failed to load wishlist"));
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
  }, [user?.user_id, t]);

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#c026d3" />
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
        {t("Wishlist")}
      </Text>
      {items.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center mt-20`}>
          <FontAwesome5 name="heart-broken" size={60} color="#c026d3" />
          <Text style={tw`mt-6 text-lg text-gray-500`}>{t("noWishlistItems", "Your wishlist is empty")}</Text>
        </View>
      ) : (
        <View style={tw`px-4 pt-2`}>
          {items.map((item) => (
            <View
              key={item.id}
              style={tw`flex-row bg-gray-100 rounded-xl p-3 mb-4 items-center`}
            >
              <Image
                source={{ uri: item.product?.images?.[0]?.image ?? "" }}
                style={tw`w-16 h-16 rounded-lg`}
              />
              <View style={tw`flex-1 ml-4`}>
                <Text style={tw`font-semibold text-lg`}>{item.product?.name}</Text>
                <Text style={tw`text-sm text-green-600`}>{item.product?.price}</Text>
              </View>
              <TouchableOpacity>
                <FontAwesome5 name="heart" size={22} color="#c026d3" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default WishlistScreen;
