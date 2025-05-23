import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { useTranslation } from "../hooks/useTranslation";
import { FontAwesome5 } from "@expo/vector-icons";

// Dummy wishlist items (replace with Redux/API data)
const dummyWishlist = [
  {
    id: 1,
    name: "Wireless Headphones",
    image: "https://via.placeholder.com/100",
    price: 249.99,
  },
  {
    id: 2,
    name: "Fashion T-Shirt",
    image: "https://via.placeholder.com/100",
    price: 19.99,
  },
];

const WishlistScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      <Text style={tw`text-2xl font-bold text-gray-900 px-6 pt-6`}>
        {t("Wishlist")}
      </Text>
      {dummyWishlist.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center mt-20`}>
          <FontAwesome5 name="heart-broken" size={60} color="#c026d3" />
          <Text style={tw`mt-6 text-lg text-gray-500`}>{t("noReviews")}</Text>
        </View>
      ) : (
        <View style={tw`px-4 pt-2`}>
          {dummyWishlist.map((item) => (
            <View
              key={item.id}
              style={tw`flex-row bg-gray-100 rounded-xl p-3 mb-4 items-center`}
            >
              <Image
                source={{ uri: item.image }}
                style={tw`w-16 h-16 rounded-lg`}
              />
              <View style={tw`flex-1 ml-4`}>
                <Text style={tw`font-semibold text-lg`}>{item.name}</Text>
                <Text style={tw`text-sm text-green-600`}>${item.price}</Text>
              </View>
              <TouchableOpacity style={tw`ml-2`}>
                <FontAwesome5 name="trash" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default WishlistScreen;
