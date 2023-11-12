import React, { useState } from "react";
import { Image, StyleSheet, Text, View, TextInput, TouchableOpacity } from "react-native";
import Screen from "../components/Screen";
import colors from "../configs/colors";
import tailwind from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { loginUser } from "../redux/slices/authSlice";

export default function SignupScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSignup = async () => {
    try {
      let response = await fetch("https://www.sunshinedeliver.com/signup/", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          password2: password,
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        dispatch(loginUser(data));
        return true;
      } else {
        const resp = await response.json();
        alert("" + resp.username);
      }
    } catch (e) {
      alert(e);
    }
  }

  return (
    <Screen style={tailwind`flex-1 justify-center items-center`}>
      <View style={tailwind`rounded-2xl`}>
        <Image style={styles.logo} source={require("../assets/azul.png")} />
      </View>
      
      <View style={tailwind`w-64`}>
        <TextInput
          style={tailwind`border border-blue-500 bg-white p-4 rounded mb-4 w-full`}
          placeholder="Seu nome"
          autoCapitalize="none"
          onChangeText={(text) => setUsername(text)}
          value={username}
        />
        <TextInput
          style={tailwind`border border-blue-500 border bg-white p-4 rounded mb-4 w-full`}
          placeholder="Seu email"
          onChangeText={(text) => setEmail(text)}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={tailwind`border border-blue-500 bg-white p-4 rounded mb-4 w-full`}
          placeholder="Senha"
          secureTextEntry={true}
          autoComplete="off"
         
          autoCapitalize="none"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
      </View>
      <TouchableOpacity style={tailwind`bg-blue-500 p-4 rounded items-center w-64`} onPress={onSignup}>
        <Text style={tailwind`text-white text-lg font-bold`}>Inscrever-se</Text>
      </TouchableOpacity>
      <Text style={tailwind`text-center mt-4`} onPress={() => navigation.navigate("UserLogin")}>
  Já é um membro? <Text style={tailwind`font-bold`}>Conecte-se</Text>
</Text>

    </Screen>
  )
}

const styles = StyleSheet.create({
  logo: {
    height: 300,
    width: 300,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 30,
  },
})
