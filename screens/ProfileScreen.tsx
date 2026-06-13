import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "../hooks/useTranslation";
import { FontAwesome5, Feather } from "@expo/vector-icons";
import LanguagePicker from "../components/LanguagePicker";
import { logoutUser, selectAuth, selectUser } from "../redux/slices/authSlice";

const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { token } = useSelector(selectAuth);
  const isLoggedIn = Boolean(token && user);

  const displayName =
    user?.username?.includes("@")
      ? user.username.split("@")[0]
      : user?.username || t("profile", "Profile");

  if (!isLoggedIn) {
    return (
      <ScrollView style={tw`flex-1 bg-white`}>
        <TouchableOpacity
          style={tw`mx-8 mt-6 bg-blue-600 py-3 rounded-full items-center`}
          onPress={() => navigation.navigate("UserLogin")}
        >
          <Text style={tw`text-white font-semibold text-base`}>
            {t("login") || "Sign in"}
          </Text>
        </TouchableOpacity>
        <View style={tw`items-center mt-10 px-8`}>
          <Text style={tw`text-base text-gray-500 text-center`}>
            {t("loginToViewProfile", "Sign in to view your profile and orders.")}
          </Text>
        </View>
        <View style={tw`px-8 mt-8`}>
          <LanguagePicker />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      <View style={tw`items-center mt-10`}>
        <Image
          source={{ uri: "https://i.pravatar.cc/120?u=" + encodeURIComponent(user!.username) }}
          style={tw`w-24 h-24 rounded-full mb-3`}
        />
        <Text style={tw`text-xl font-bold capitalize`}>{displayName}</Text>
        <Text style={tw`text-sm text-gray-500 mb-6`}>{user!.username}</Text>
      </View>
      <View style={tw`px-8`}>
        <LanguagePicker />
        <TouchableOpacity
          style={tw`flex-row items-center p-4 bg-gray-100 rounded-xl mb-3`}
          onPress={() => navigation.navigate("UserLogin")}
        >
          <Feather name="user" size={20} color="#2563eb" />
          <Text style={tw`ml-4 text-base font-semibold`}>
            {t("account", "Account")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row items-center p-4 bg-gray-100 rounded-xl mb-3`}
        >
          <Feather name="settings" size={20} color="#2563eb" />
          <Text style={tw`ml-4 text-base font-semibold`}>{t("Settings") || "Settings"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row items-center p-4 bg-gray-100 rounded-xl mb-3`}
          onPress={() => dispatch(logoutUser())}
        >
          <FontAwesome5 name="sign-out-alt" size={20} color="#ef4444" />
          <Text style={tw`ml-4 text-base font-semibold text-red-600`}>{t("Logout") || "Logout"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
