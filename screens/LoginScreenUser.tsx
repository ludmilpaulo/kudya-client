import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { Feather } from '@expo/vector-icons'
import { loginUserService } from "../services/authService";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import { clearAllCart } from "../redux/slices/basketSlice";
import { loginUser } from "../redux/slices/authSlice";
import { RootStackParamList } from "../navigation/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import tw from "twrnc";
import { useTranslation } from "../hooks/useTranslation";

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

  const toggleForgotPasswordModal = () => setShowForgotPasswordModal(prev => !prev);

  useEffect(() => {
    dispatch(clearAllCart());
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await loginUserService(username, password);
      dispatch(loginUser(response));
      Alert.alert(
        t('success', 'Sucesso'),
        t('loginSuccess', 'Você se conectou com sucesso!')
      );
      navigation.navigate(response.is_customer ? "Home" : "RestaurantDashboard");
    } catch (error) {
      Alert.alert(
        t('error', 'Erro'),
        t('loginFailed', 'Falha ao entrar. Por favor, tente novamente.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={tw`flex-1 justify-center items-center`}
      >
        <View style={tw`w-11/12 max-w-xs bg-white rounded-2xl p-6 shadow-lg`}>
          <View style={tw`items-center mb-6`}>
            <Image source={require("../assets/azul.png")} style={tw`w-24 h-24`} resizeMode="contain" />
          </View>
          <Text style={tw`text-xl font-bold text-center mb-4`}>
            {t('loginTitle', 'Faça login na sua conta')}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignupScreen")}>
            <Text style={tw`text-base text-center text-gray-500 mb-4`}>
              {t('noAccount', 'Não tem uma conta?')}{' '}
              <Text style={tw`text-blue-600 underline`}>{t('registerHere', 'Cadastre-se aqui')}</Text>
            </Text>
          </TouchableOpacity>
          <View style={tw`mb-4`}>
            <TextInput
              placeholder={t('username', 'Nome do usuário')}
              value={username}
              onChangeText={setUsername}
              style={tw`border border-gray-300 rounded px-4 py-3 mb-2 bg-gray-100`}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={tw`mb-2 relative`}>
            <TextInput
              value={password}
              placeholder={t('password', 'Digite sua senha')}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={tw`border border-gray-300 rounded px-4 py-3 bg-gray-100`}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(s => !s)}
              style={tw`absolute right-2 top-3 p-2`}
            >
              {showPassword
                ? <Feather name="eye-off" size={20} color="#040405" />
                : <Feather name="eye" size={20} color="#040405" />}
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={toggleForgotPasswordModal}>
            <Text style={tw`text-right text-blue-600 underline mb-6`}>
              {t('forgotPassword', 'Esqueceu a senha?')}
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
                {t('login', 'Entrar')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <ForgotPasswordModal show={showForgotPasswordModal} onClose={toggleForgotPasswordModal} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreenUser;
