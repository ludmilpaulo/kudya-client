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
import { useDispatch } from "react-redux";
import { Feather } from "@expo/vector-icons";
import { loginUserService } from "../services/authService";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import { clearAllCart } from "../redux/slices/basketSlice";
import { loginUser } from "../redux/slices/authSlice";
import { RootStackParamList } from "../navigation/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import tw from "twrnc";
import { useTranslation } from "../hooks/useTranslation";
import { LinearGradient } from "expo-linear-gradient";

type NavigationProp = StackNavigationProp<RootStackParamList, "UserLogin">;

const LoginScreenUser = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const toggleForgotPasswordModal = () => setShowForgotPasswordModal((prev) => !prev);

  useEffect(() => {
    dispatch(clearAllCart());
  }, [dispatch]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await loginUserService(username, password);
      dispatch(loginUser(response));
      Alert.alert(t("success"), t("loginSuccess"));
      navigation.goBack();
    } catch (error: any) {
      // If error is from backend and has a message, show it
      if (error?.message) {
        Alert.alert(t("error"), error.message);
      } else if (typeof error === "string") {
        Alert.alert(t("error"), error);
      } else {
        Alert.alert(t("error"), t("loginFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1`}>
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
          <View style={tw`mb-4`}>
            <TextInput
              placeholder={t("username")}
              value={username}
              onChangeText={setUsername}
              style={tw`border border-gray-300 rounded px-4 py-3 mb-2 bg-gray-100`}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
            />
          </View>
          <View style={tw`mb-2 relative`}>
            <TextInput
              value={password}
              placeholder={t("password")}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={tw`border border-gray-300 rounded px-4 py-3 bg-gray-100`}
              autoCapitalize="none"
              textContentType="password"
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
          <TouchableOpacity onPress={toggleForgotPasswordModal}>
            <Text style={tw`text-right text-blue-600 underline mb-6`}>
              {t("forgotPassword")}
            </Text>
          </TouchableOpacity>
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
        <ForgotPasswordModal
          show={showForgotPasswordModal}
          onClose={toggleForgotPasswordModal}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreenUser;
