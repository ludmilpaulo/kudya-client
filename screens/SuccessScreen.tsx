import { View, Text } from "react-native";
import tailwind from "tailwind-react-native-classnames";
import React from "react";
import Screen from "../components/Screen";
import * as Animatable from "react-native-animatable";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

const SuccessScreen = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    setTimeout(() => {
      navigation.navigate("Home");
    }, 7000);
  }, []);
  return (
    <>
      <Animatable.Image
        source={require("../assets/Lem.gif")}
        animation="slideInUp"
        iterationCount={1}
      />
    </>
  );
};

export default SuccessScreen;
