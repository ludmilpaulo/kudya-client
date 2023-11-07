import React, { useContext, useState, useEffect } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";

import Screen from "../components/Screen";
import colors from "../configs/colors";

import tailwind from "tailwind-react-native-classnames";

import { useNavigation } from "@react-navigation/native";

import { useDispatch, useSelector } from "react-redux";

import { loginUser } from "../redux/slices/authSlice";

import * as Updates from "expo-updates";

export default function SignupScreen({ navigation }: { navigation: any }) {
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

      if (response.status == 200) {
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
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.wrapper}>
        <View style={tailwind`py-4 rounded-2xl`}>
          <Image style={styles.logo} source={require("../assets/logo.png")} />
        </View>

        <Text style={styles.wellcomeTo}>
          Junte-se ao {"\n"} <Text style={styles.brand}>SD Food</Text>
        </Text>

        <View style={styles.form}>
          <View style={styles.containertest}>
            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              autoCapitalize={"none"}
              onChangeText={(text) => setUsername(text)}
              value={username}
            />
            <TextInput
              style={styles.input}
              placeholder="Seu email"
              onChangeText={(text) => setEmail(text)}
              value={email}
              autoCapitalize={"none"}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              secureTextEntry={true}
              autoCompleteType="off"
              password={true}
              //onChangeText={(password) => updateState({ password })}
              value={password}
              onChangeText={(text) => setPassword(text)}
              autoCapitalize={"none"}
            />
          </View>

          <TouchableOpacity style={styles.containerbot} onPress={onSignup}>
            <Text style={styles.vamosJuntos}>Inscrever-se</Text>
          </TouchableOpacity>
        </View>

        <Text
          style={styles.join}
          onPress={() => navigation.navigate("UserLogin")}
        >
          Já é um membro?{" "}
          <Text style={{ color: colors.primary }}>Conecte-se</Text>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: colors.white,
    justifyContent: "center",
  },
  wrapper: {
    paddingHorizontal: 20,
  },
  logo: {
    height: 160,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 30,
  },
  wellcomeTo: {
    fontSize: 23,
    fontWeight: "700",
    color: colors.secondary,
    marginTop: 20,
    textAlign: "center",
  },
  brand: {
    fontSize: 23,
    color: colors.primary,
    textAlign: "center",
    fontWeight: "500",
  },
  form: {
    marginTop: 10,
  },
  join: {
    marginTop: 10,
    textAlign: "center",
    color: colors.black,
  },
  or: {
    color: colors.gray,
    textAlign: "center",
    marginVertical: 20,
  },
  containertest: {
    position: "relative",
  },
  input: {
    borderColor: colors.medium,
    backgroundColor: colors.light,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  inputError: {
    borderColor: colors.denger,
  },
  icon: {
    position: "absolute",
    right: 15,
    top: 32,
  },
  button: {
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 15,
    marginVertical: 5,
    marginTop: 15,
  },
  text: {
    color: colors.white,
    fontSize: 18,
    // textTransform: 'uppercase',
    fontWeight: "700",
  },

  containerbot: {
    backgroundColor: "rgba(0,74,173,1)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 15,
    marginVertical: 5,
    marginTop: 15,
  },
  containertext: {
    width: 159,
    height: 32,
  },
  vamosJuntos: {
    color: colors.white,
    fontSize: 18,
    // textTransform: 'uppercase',
    fontWeight: "700",
  },
});
