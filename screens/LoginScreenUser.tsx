import React, { useState } from "react";
import { TextInput, Image, Text, View, TouchableOpacity } from "react-native";
import Screen from "../components/Screen";
import { useDispatch } from "react-redux";
import tailwind from "tailwind-react-native-classnames";
import { loginUser } from "../redux/slices/authSlice";

export default function LoginScreenUser({ navigation }: { navigation: any }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const LoginUser = async () => {
    try {
      let response = await fetch("https://www.sunshinedeliver.com/login/", {
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
        //  Updates.reloadAsync();
        return true;
      } else {
        let resp = await response.json();
        alert("" + resp.non_field_errors);
      }
    } catch (e) {
      alert(e);
    }
  };

  return (
    <Screen style={tailwind`flex-1 justify-center`}>
      <View style={tailwind`px-4 py-4 rounded-2xl items-center`}>
        <Image style={tailwind`h-64 w-64`} source={require("../assets/logo.png")} />
        <Text style={tailwind`text-2xl font-bold text-secondary mt-4`}>
          Conecte-se ao{"\n"}<Text style={tailwind`text-primary font-semibold`}></Text>
        </Text>
        <View style={tailwind`w-64 mt-4`}>
        <TextInput
            style={tailwind`w-full border border-medium bg-light p-4 rounded mb-4`}
            placeholder="Seu Nome"
            autoCapitalize="none"
            value={username}
            onChangeText={(text) => setUsername(text)}
          />
          <TextInput
            style={tailwind`w-full border border-medium bg-light p-4 rounded mb-4`}
            placeholder="Senha"
            autoComplete="off"
            secureTextEntry={true}
            value={password}
            onChangeText={(text) => setPassword(text)}
            autoCapitalize="none"
          />

          <TouchableOpacity style={tailwind`bg-black p-4 rounded items-center`} onPress={LoginUser}>
            <Text style={tailwind`text-white text-lg font-bold`}>Conecte-se</Text>
          </TouchableOpacity>
        </View>
        <Text style={tailwind`mt-4 text-center text-black`} onPress={() => navigation.navigate("Signup")}>
          Não é um membro?{" "}
          <Text style={tailwind`text-primary`}>Inscrever-se</Text>
        </Text>
      </View>
    </Screen>
  );
}
