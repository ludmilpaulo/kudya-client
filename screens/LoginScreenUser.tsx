import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import tailwind from "tailwind-react-native-classnames";
import { Eye, EyeOff } from "react-native-feather";
import { loginUserService } from "../services/authService";
import { AxiosError } from "axios";
import { loginUser } from "../redux/slices/authSlice";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import { clearAllCart } from "../redux/slices/basketSlice";
import { LinearGradient } from "expo-linear-gradient";
import { AnimatePresence, MotiView } from 'moti';

const LoginScreenUser: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState<boolean>(false);

  useEffect(() => {
    dispatch(clearAllCart());
  }, [dispatch]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const startTime = performance.now();
      const resJson = await loginUserService(username, password);

      const endTime = performance.now();
      console.log(`completeOrderRequest took ${(endTime - startTime) / 1000} seconds`);

      if (resJson.is_customer === true) {
        dispatch(loginUser(resJson));
        Alert.alert("Success", "Você se conectou com sucesso! Agora você pode saborear sua refeição");
        navigation.navigate("HomeScreen");
      } else if (resJson.is_customer === false) {
        dispatch(loginUser(resJson));
        Alert.alert("Success", "Você se conectou com sucesso!");
        navigation.navigate("RestaurantDashboard");
      } else {
        Alert.alert("Error", resJson.message);
      }
    } catch (error) {
      console.error(error);
      const err = error as AxiosError;
      if (err.response && err.response.data && typeof err.response.data === "object" && "message" in err.response.data) {
        Alert.alert("Error", (err.response.data as any).message);
      } else if (err.response && err.response.status) {
        switch (err.response.status) {
          case 400:
            Alert.alert("Error", "Erro de solicitação. Por favor, tente novamente.");
            break;
          case 401:
            Alert.alert("Error", "Senha incorreta. Por favor, tente novamente.");
            break;
          case 404:
            Alert.alert("Error", "Usuário não encontrado. Por favor, Cadastra se.");
            break;
          default:
            Alert.alert("Error", "Login falhou. Por favor, tente novamente.");
        }
      } else {
        Alert.alert("Error", "Login falhou. Por favor, tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <LinearGradient colors={['#FCB61A', '#0171CE']} style={tailwind`flex-1 justify-center items-center`}>
      <View style={tailwind`absolute top-0 left-0 w-full h-full rounded-md filter blur-3xl opacity-50 -z-20`} />
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 500 }}
        style={tailwind`w-full p-10 mt-16 bg-white rounded-lg shadow-lg lg:w-1/3 md:w-1/2`}
      >
        <View style={tailwind`flex justify-center mb-6 items-center`}>
          <Image source={require("../assets/azul.png")} style={tailwind`w-32 h-32`} />
        </View>
        <Text style={tailwind`text-2xl font-extrabold leading-6 text-gray-800 text-center mb-4`}>
          Faça login na sua conta
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("SignupScreen")}>
          <Text style={tailwind`mt-4 text-sm font-medium leading-none text-gray-500 text-center`}>
            Não tem uma conta?{" "}
            <Text style={tailwind`text-sm font-medium leading-none text-indigo-700 underline`}>
              Assine aqui
            </Text>
          </Text>
        </TouchableOpacity>
        <View style={tailwind`mt-8`}>
          <Text style={tailwind`block text-sm font-medium text-gray-700`}>Nome do Usuário</Text>
          <TextInput
            placeholder="Nome do Usuário"
            value={username}
            onChangeText={(text) => setUsername(text)}
            style={tailwind`w-full py-3 px-4 mt-2 text-sm font-medium leading-none text-gray-800 bg-gray-200 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
          />
        </View>
        <View style={tailwind`mt-6`}>
          <Text style={tailwind`block text-sm font-medium text-gray-700`}>Digite a Sua Senha</Text>
          <View style={tailwind`relative mt-2`}>
            <TextInput
              value={password}
              placeholder="Digite a Sua Senha"
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={!showPassword}
              style={tailwind`w-full py-3 px-4 text-sm font-medium leading-none text-gray-800 bg-gray-200 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={tailwind`absolute inset-y-0 right-0 flex items-center justify-center h-full px-3`}
            >
              {showPassword ? <EyeOff width={20} height={20} /> : <Eye width={20} height={20} />}
            </TouchableOpacity>
          </View>
        </View>
        <View style={tailwind`mt-4 text-right`}>
          <Text
            style={tailwind`text-sm text-indigo-700 hover:underline`}
            onPress={() => setShowForgotPasswordModal(true)}
          >
            Esqueceu a senha?
          </Text>
        </View>
        <View style={tailwind`mt-8`}>
          <TouchableOpacity
            onPress={handleSubmit}
            style={tailwind`w-full py-4 text-sm font-semibold leading-none text-white bg-indigo-700 border rounded focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 focus:outline-none ${loading && 'opacity-50'}`}
            disabled={loading}
          >
            <Text>Entrar na Minha Conta</Text>
          </TouchableOpacity>
        </View>
      </MotiView>

      {loading && (
        <View style={tailwind`absolute top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50`}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      <ForgotPasswordModal show={showForgotPasswordModal} onClose={() => setShowForgotPasswordModal(false)} />
    </LinearGradient>
  );
};

export default LoginScreenUser;
