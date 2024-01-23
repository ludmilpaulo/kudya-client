import React, { useState } from "react";
import { TextInput, Image, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import Screen from "../components/Screen";
import { useDispatch } from "react-redux";
import tailwind from "tailwind-react-native-classnames";
import { loginUser } from "../redux/slices/authSlice";
import { useNavigation } from "@react-navigation/native";
import { apiUrl } from "../configs/variable";

export default function LoginScreenUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    <Screen style={tailwind`flex-1 justify-center`}>
      <View style={tailwind`px-4 py-4 rounded-2xl items-center`}>
      <Image source={require("../assets/azul.png")} style={tailwind`h-64 w-64`} />

        <Text style={tailwind`text-2xl font-bold mt-4`}>
          Conecte-se {"\n"}<Text style={tailwind`text-black font-semibold`}></Text>
        </Text>
        <View style={tailwind`w-64 mt-4`}>
        <TextInput
            style={tailwind`w-full border border-blue-500 bg-white p-4 rounded mb-4`}
            placeholder="Seu Nome"
            autoCapitalize="none"
            value={username}
            onChangeText={(text) => setUsername(text)}
          />
          <TextInput
            style={tailwind`w-full border border-blue-500 bg-white p-4 rounded mb-4`}
            placeholder="Senha"
            autoComplete="off"
            secureTextEntry={true}
            value={password}
            onChangeText={(text) => setPassword(text)}
            autoCapitalize="none"
          />

          <TouchableOpacity style={tailwind`bg-blue-500 p-4 rounded items-center`} onPress={LoginUser}>
            <Text style={tailwind`text-white text-lg font-bold`}>Conecte-se</Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator style={tailwind`mt-4`} size="large" color="#0000ff" />}

        </View>
        <Text style={tailwind`mt-4 text-center text-black`} onPress={() => navigation.navigate("Signup")}>
          Não é um membro?{" "}
          <Text style={tailwind`font-bold`}>Inscrever-se</Text>
        </Text>
 
      </View>
    </Screen>
  );
}
