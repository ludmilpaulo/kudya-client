import React, { useState } from "react";
import {
  TextInput,
  Image,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Screen from "../components/Screen";
import { useDispatch } from "react-redux";
import { loginUser } from "../redux/slices/authSlice";
import { useNavigation } from "@react-navigation/native";
import { apiUrl } from "../configs/variable";
import Icon from "react-native-vector-icons/Ionicons";
import tw from "twrnc";

export default function LoginScreenUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const LoginUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/login/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.status === 200) {
        const data = await response.json();
        dispatch(loginUser(data));
        setLoading(false);
      } else {
        const resp = await response.json();
        alert(resp.non_field_errors || "Erro ao entrar.");
        setLoading(false);
      }
    } catch (error) {
      alert("Erro ao conectar-se.");
      setLoading(false);
    }
  };

  return (
    <Screen style={tw`flex-1 justify-center bg-gray-100`}>
      <View style={tw`px-6 py-8 bg-white rounded-2xl items-center mx-4 shadow-lg`}>
        <Image source={require("../assets/azul.png")} style={tw`h-32 w-32 mb-8`} />

        <Text style={tw`text-3xl font-bold text-center text-gray-800 mb-4`}>
          Conecte-se
        </Text>

        <View style={tw`w-full`}>
          <TextInput
            style={tw`w-full border border-blue-500 bg-white p-4 rounded-lg mb-4`}
            placeholder="Seu Nome"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <View style={tw`relative w-full`}>
            <TextInput
              style={tw`w-full border border-blue-500 bg-white p-4 rounded-lg mb-4`}
              placeholder="Senha"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoComplete="off"
            />
            <TouchableOpacity
              style={tw`absolute right-4 top-4`}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={tw`bg-blue-500 p-4 rounded-lg items-center mt-2`}
            onPress={LoginUser}
          >
            <Text style={tw`text-white text-lg font-bold`}>Conecte-se</Text>
          </TouchableOpacity>

          {loading && (
            <ActivityIndicator style={tw`mt-4`} size="large" color="#3498db" />
          )}
        </View>

        <Text
          style={tw`mt-4 text-center text-blue-500`}
          onPress={() => navigation.navigate("ForgotPasswordScreen")}
        >
          Esqueceu a senha?
        </Text>

        <Text
          style={tw`mt-4 text-center text-gray-700`}
          onPress={() => navigation.navigate("Signup")}
        >
          Não é um membro?{" "}
          <Text style={tw`font-bold text-blue-500`}>Inscrever-se</Text>
        </Text>
      </View>
    </Screen>
  );
}
