import React, { useState } from "react";
import { TextInput, Image, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import Screen from "../components/Screen";
import { useDispatch } from "react-redux";
import tailwind from "tailwind-react-native-classnames";
import { loginUser } from "../redux/slices/authSlice";
import { useNavigation } from "@react-navigation/native";
import { apiUrl } from "../configs/variable";
import Icon from "react-native-vector-icons/Ionicons";

export default function LoginScreenUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const navigation = useNavigation<any>();

  const LoginUser = async () => {
    try {
      setLoading(true); // Start loading indicator
      let response = await fetch(`${apiUrl}/login/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      if (response.status == 200) {
        let data = await response.json();
        dispatch(loginUser(data));
        setLoading(false); // Stop loading indicator
        return true;
      } else {
        let resp = await response.json();
        alert("" + resp.non_field_errors);
        setLoading(false); // Stop loading indicator
      }
    } catch (e) {
      alert(e);
      setLoading(false); // Stop loading indicator
    }
  };

  return (
    <Screen style={tailwind`flex-1 justify-center bg-gray-100`}>
      <View style={tailwind`px-6 py-8 bg-white rounded-2xl items-center shadow-lg`}>
        <Image source={require("../assets/azul.png")} style={tailwind`h-32 w-32 mb-8`} />
        <Text style={tailwind`text-3xl font-bold text-center text-gray-800 mb-4`}>
          Conecte-se
        </Text>
        <View style={tailwind`w-full`}>
          <TextInput
            style={tailwind`w-full border border-blue-500 bg-white p-4 rounded-lg mb-4`}
            placeholder="Seu Nome"
            autoCapitalize="none"
            value={username}
            onChangeText={(text) => setUsername(text)}
          />
          <View style={tailwind`relative w-full`}>
            <TextInput
              style={tailwind`w-full border border-blue-500 bg-white p-4 rounded-lg mb-4`}
              placeholder="Senha"
              autoComplete="off"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => setPassword(text)}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={tailwind`absolute right-4 top-4`}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={tailwind`bg-blue-500 p-4 rounded-lg items-center mt-2`}
            onPress={LoginUser}
          >
            <Text style={tailwind`text-white text-lg font-bold`}>Conecte-se</Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator style={tailwind`mt-4`} size="large" color="#3498db" />}
        </View>
        <Text style={tailwind`mt-4 text-center text-blue-500`} onPress={() => navigation.navigate("ForgotPasswordScreen")}>
          Esqueceu a senha?
        </Text>
        <Text style={tailwind`mt-4 text-center text-gray-700`} onPress={() => navigation.navigate("Signup")}>
          Não é um membro?{" "}
          <Text style={tailwind`font-bold text-blue-500`}>Inscrever-se</Text>
        </Text>
      </View>
    </Screen>
  );
}
