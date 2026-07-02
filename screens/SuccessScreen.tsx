import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, Image } from "react-native";
import * as Animatable from "react-native-animatable";
import * as Progress from "react-native-progress";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";
import { useAppNavigation } from "../navigation/hooks";

const AnimatableImage = Animatable.Image;
const AnimatableText = Animatable.Text;

const SuccessScreen = () => {
  const navigation = useAppNavigation();
  const [orderSent, setOrderSent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOrderSent(true);
      setTimeout(() => {
        navigation.navigate("Delivery");
      }, 3000);
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={['#004AAD', '#004AAD']}
      style={tw`flex-1`}
    >
      <SafeAreaView style={tw`flex-1 justify-center items-center`}>
        <AnimatableImage
          source={require("../assets/orderLoading.gif")}
          animation="slideInUp"
          iterationCount={1}
          style={tw`h-96 w-96`}
        />

        <AnimatableText
          animation="slideInUp"
          iterationCount={1}
          style={tw`my-10 text-lg font-bold text-center text-white`}
        >
          {orderSent
            ? "Seu pedido foi enviado ao storee!"
            : "Aguardando o storee aceitar seu pedido!"}
        </AnimatableText>

        <Progress.Circle size={60} indeterminate={true} color="#ffffff" />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SuccessScreen;
