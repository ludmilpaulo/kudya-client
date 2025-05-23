import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import tw from "twrnc";
import { useTranslation } from "../hooks/useTranslation";
import { FontAwesome5, Feather } from "@expo/vector-icons";

// Dummy user info (replace with Redux/auth state)
const user = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "https://i.pravatar.cc/120",
};

const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      <View style={tw`items-center mt-10`}>
        <Image
          source={{ uri: user.avatar }}
          style={tw`w-24 h-24 rounded-full mb-3`}
        />
        <Text style={tw`text-xl font-bold`}>{user.name}</Text>
        <Text style={tw`text-sm text-gray-500 mb-6`}>{user.email}</Text>
      </View>
      <View style={tw`px-8`}>
        <TouchableOpacity
          style={tw`flex-row items-center p-4 bg-gray-100 rounded-xl mb-3`}
        >
          <Feather name="settings" size={20} color="#2563eb" />
          <Text style={tw`ml-4 text-base font-semibold`}>{t("Settings") || "Settings"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row items-center p-4 bg-gray-100 rounded-xl mb-3`}
        >
          <FontAwesome5 name="sign-out-alt" size={20} color="#ef4444" />
          <Text style={tw`ml-4 text-base font-semibold text-red-600`}>{t("Logout") || "Logout"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
