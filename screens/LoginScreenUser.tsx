import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Feather } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { loginUser, selectAuth, clearAuthMessage } from "../redux/slices/authSlice";
import { AppDispatch } from "../redux/store"; // If you use Typed dispatch
import { clearAllCart } from "../redux/slices/basketSlice";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import tw from "twrnc";
import { useTranslation } from "../hooks/useTranslation";
import { LinearGradient } from "expo-linear-gradient";
import { analytics } from "../utils/mixpanel";

type NavigationProp = StackNavigationProp<RootStackParamList, "UserLogin">;

const LoginScreenUser = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  // Local state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Redux state
  const { loading, error, user, message } = useSelector(selectAuth);

  // Clear cart on login screen open
  useEffect(() => {
    analytics.trackScreenView('Login Screen');
    dispatch(clearAllCart());
  }, [dispatch]);

  // Handle success or error from Redux
  useEffect(() => {
    if (user && message) {
      analytics.trackLogin(user.id?.toString() || user.username || 'unknown', {
        user_type: 'customer',
        platform: 'mobile'
      });
      Alert.alert(t("success"), message);
      dispatch(clearAuthMessage());
      navigation.goBack(); // Or navigate to home, e.g. navigation.replace("Home")
    } else if (error) {
      analytics.trackError('Login Failed', { error });
      Alert.alert(t("error"), error);
      dispatch(clearAuthMessage());
    }
  }, [user, message, error, dispatch, t, navigation]);

  // Submission handler
  const handleSubmit = () => {
    if (!username || !password) {
      Alert.alert(t("error"), t("fillAllFields"));
      return;
    }
    dispatch(loginUser({ username, password }));
  };

  const toggleForgotPasswordModal = () => setShowForgotPasswordModal((prev) => !prev);

  return (
    <SafeAreaView style={tw`flex-1`}>
      {/* Gradient background */}
      <LinearGradient
        colors={["#FCD34D", "#ffcc00", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={tw`absolute w-full h-full`}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={tw`flex-1 justify-center items-center`}
      >
        <View style={tw`w-11/12 max-w-xs bg-white rounded-2xl p-6 shadow-lg`}>
          <View style={tw`items-center mb-6`}>
            <Image
              source={require("../assets/azul.png")}
              style={tw`w-24 h-24`}
              resizeMode="contain"
            />
          </View>
          <Text style={tw`text-xl font-bold text-center mb-4`}>
            {t("loginTitle")}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignupScreen")}>
            <Text style={tw`text-base text-center text-gray-500 mb-4`}>
              {t("noAccount")}{" "}
              <Text style={tw`text-blue-600 underline`}>
                {t("registerHere")}
              </Text>
            </Text>
          </TouchableOpacity>
          {/* Username input */}
          <View style={tw`mb-4`}>
            <TextInput
              placeholder={t("username")}
              value={username}
              onChangeText={setUsername}
              style={tw`border border-gray-300 rounded px-4 py-3 mb-2 bg-gray-100`}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              editable={!loading}
              returnKeyType="next"
            />
          </View>
          {/* Password input */}
          <View style={tw`mb-2 relative`}>
            <TextInput
              value={password}
              placeholder={t("password")}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={tw`border border-gray-300 rounded px-4 py-3 bg-gray-100`}
              autoCapitalize="none"
              textContentType="password"
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((s) => !s)}
              style={tw`absolute right-2 top-3 p-2`}
            >
              {showPassword ? (
                <Feather name="eye-off" size={20} color="#040405" />
              ) : (
                <Feather name="eye" size={20} color="#040405" />
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={toggleForgotPasswordModal} disabled={loading}>
            <Text style={tw`text-right text-blue-600 underline mb-6`}>
              {t("forgotPassword")}
            </Text>
          </TouchableOpacity>
          {/* Login button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={tw`bg-blue-600 rounded-full py-3 items-center`}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={tw`text-white font-bold text-lg`}>
                {t("login")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        {/* Forgot password modal */}
        <ForgotPasswordModal
          show={showForgotPasswordModal}
          onClose={toggleForgotPasswordModal}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreenUser;
