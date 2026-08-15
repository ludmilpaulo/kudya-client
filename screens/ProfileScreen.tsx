import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import tw from "twrnc";
import axios from "axios";
import { useAppNavigation } from "../navigation/hooks";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "../hooks/useTranslation";
import { FontAwesome5, Feather } from "@expo/vector-icons";
import LanguagePicker from "../components/LanguagePicker";
import { logoutUser, selectAuth, selectUser } from "../redux/slices/authSlice";
import { baseAPI } from "../services/types";

const PRIVACY_URL = "https://sd-kudya.vercel.app/PrivacyPolicy";
const TERMS_URL = "https://sd-kudya.vercel.app/TermsOfService";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { token } = useSelector(selectAuth);
  const isLoggedIn = Boolean(token && user);
  const [deleting, setDeleting] = React.useState(false);

  const displayName =
    user?.username?.includes("@")
      ? user.username.split("@")[0]
      : user?.username || t("profile", "Profile");

  const openUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(t("error"), t("unableToOpenLink", "Unable to open link."));
    }
  };

  const deleteAccount = async () => {
    if (!token) return;
    setDeleting(true);
    try {
      await axios.post(
        `${baseAPI}/api/auth/deactivate/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      dispatch(logoutUser());
      Alert.alert(
        t("accountDeleted", "Account deleted"),
        t(
          "accountDeletedDesc",
          "Your Kudya account has been deleted. You can create a new account anytime.",
        ),
      );
    } catch {
      Alert.alert(
        t("error"),
        t(
          "deleteAccountFailed",
          "Could not delete your account. Please try again or contact support@kudya.store.",
        ),
      );
    } finally {
      setDeleting(false);
    }
  };

  const requestAccountDeletion = () => {
    Alert.alert(
      t("deleteAccount", "Delete account"),
      t(
        "deleteAccountConfirmInApp",
        "This permanently deletes your Kudya account and associated personal data. This cannot be undone.",
      ),
      [
        { text: t("cancel", "Cancel"), style: "cancel" },
        {
          text: t("deleteAccount", "Delete account"),
          style: "destructive",
          onPress: () => {
            void deleteAccount();
          },
        },
      ],
    );
  };

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
        <View style={tw`px-8 mt-4 mb-10`}>
          <TouchableOpacity
            style={tw`flex-row items-center p-4 bg-gray-100 rounded-xl mb-3`}
            onPress={() => void openUrl(PRIVACY_URL)}
          >
            <Feather name="shield" size={20} color="#2563eb" />
            <Text style={tw`ml-4 text-base font-semibold`}>
              {t("privacyPolicy", "Privacy Policy")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`flex-row items-center p-4 bg-gray-100 rounded-xl mb-3`}
            onPress={() => void openUrl(TERMS_URL)}
          >
            <Feather name="file-text" size={20} color="#2563eb" />
            <Text style={tw`ml-4 text-base font-semibold`}>
              {t("termsOfService", "Terms of Service")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      <View style={tw`items-center mt-10`}>
        <View
          style={tw`w-24 h-24 rounded-full mb-3 bg-blue-600 items-center justify-center`}
        >
          <Text style={tw`text-white text-3xl font-bold`}>
            {initialsFromName(displayName)}
          </Text>
        </View>
        <Text style={tw`text-xl font-bold capitalize`}>{displayName}</Text>
        <Text style={tw`text-sm text-gray-500 mb-6`}>{user!.username}</Text>
      </View>
      <View style={tw`px-8`}>
        <LanguagePicker />
        <TouchableOpacity
          style={tw`flex-row items-center p-4 bg-gray-100 rounded-xl mb-3`}
          onPress={() => navigation.navigate("UserProfile")}
        >
          <Feather name="user" size={20} color="#2563eb" />
          <Text style={tw`ml-4 text-base font-semibold`}>
            {t("account", "Account")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row items-center p-4 bg-gray-100 rounded-xl mb-3`}
          onPress={() => navigation.navigate("OrderHistory")}
        >
          <Feather name="shopping-bag" size={20} color="#2563eb" />
          <Text style={tw`ml-4 text-base font-semibold`}>
            {t("orders", "Orders")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row items-center p-4 bg-gray-100 rounded-xl mb-3`}
          onPress={() => navigation.navigate("PropertyApplications")}
        >
          <Feather name="home" size={20} color="#2563eb" />
          <Text style={tw`ml-4 text-base font-semibold`}>{t("propertyApplications")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row items-center p-4 bg-gray-100 rounded-xl mb-3`}
          onPress={() => navigation.navigate("PropertyActiveRentals")}
        >
          <Feather name="key" size={20} color="#2563eb" />
          <Text style={tw`ml-4 text-base font-semibold`}>{t("activeRental")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row items-center p-4 bg-gray-100 rounded-xl mb-3`}
          onPress={() => navigation.navigate("StayBookings")}
        >
          <Feather name="calendar" size={20} color="#2563eb" />
          <Text style={tw`ml-4 text-base font-semibold`}>{t("upcomingStays")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row items-center p-4 bg-gray-100 rounded-xl mb-3`}
          onPress={() => navigation.navigate("PropertyDocumentsVault")}
        >
          <Feather name="folder" size={20} color="#2563eb" />
          <Text style={tw`ml-4 text-base font-semibold`}>{t("documents")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row items-center p-4 bg-gray-100 rounded-xl mb-3`}
          onPress={() => void openUrl(PRIVACY_URL)}
        >
          <Feather name="shield" size={20} color="#2563eb" />
          <Text style={tw`ml-4 text-base font-semibold`}>
            {t("privacyPolicy", "Privacy Policy")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row items-center p-4 bg-gray-100 rounded-xl mb-3`}
          onPress={() => void openUrl(TERMS_URL)}
        >
          <Feather name="file-text" size={20} color="#2563eb" />
          <Text style={tw`ml-4 text-base font-semibold`}>
            {t("termsOfService", "Terms of Service")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row items-center p-4 bg-gray-100 rounded-xl mb-3`}
          onPress={requestAccountDeletion}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color="#ef4444" />
          ) : (
            <Feather name="trash-2" size={20} color="#ef4444" />
          )}
          <Text style={tw`ml-4 text-base font-semibold text-red-600`}>
            {t("deleteAccount", "Delete account")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`flex-row items-center p-4 bg-gray-100 rounded-xl mb-3`}
          onPress={() => dispatch(logoutUser())}
        >
          <FontAwesome5 name="sign-out-alt" size={20} color="#ef4444" />
          <Text style={tw`ml-4 text-base font-semibold text-red-600`}>
            {t("Logout") || "Logout"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
