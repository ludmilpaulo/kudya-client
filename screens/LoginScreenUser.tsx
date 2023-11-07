import React, { useContext, useState, useEffect } from "react";
import {
  Keyboard,
  Alert,
  TextInput,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import Screen from "../components/Screen";
import colors from "../configs/colors";
import { useDispatch, useSelector } from "react-redux";

import { useNavigation } from "@react-navigation/native";

import { loginUser } from "../redux/slices/authSlice";

import tailwind from "tailwind-react-native-classnames";

import * as Updates from "expo-updates";

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
    <Screen style={styles.container}>
      <View style={styles.wrapper}>
        <View style={tailwind`py-4 rounded-2xl`}>
          <Image style={styles.logo} source={require("../assets/logo.png")} />
        </View>

        <Text style={styles.wellcomeTo}>
          Conecte-se ao{"\n"} <Text style={styles.brand}>SD Kudya</Text>
        </Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Seu Nome"
            autoCapitalize={"none"}
            value={username}
            onChangeText={(text) => setUsername(text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            autoCompleteType="off"
            password={true}
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
            autoCapitalize={"none"}
          />

          <TouchableOpacity style={styles.containerbot} onPress={LoginUser}>
            <Text style={styles.vamosJuntos}>Conecte-se</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.join} onPress={() => navigation.navigate("Signup")}>
          Não é um membro?{" "}
          <Text style={{ color: colors.primary }}>Inscrever-se</Text>
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
    marginTop: 16,
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
