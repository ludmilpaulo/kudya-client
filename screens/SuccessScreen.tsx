import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, Image } from "react-native";
import * as Animatable from "react-native-animatable";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";
import {LinearGradient} from "expo-linear-gradient";
import tw from "twrnc"; // ✅ Using `twrnc` instead of tailwind-react-native-classnames

const SuccessScreen = () => {
  const navigation = useNavigation<any>();
  const [orderSent, setOrderSent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOrderSent(true);
      setTimeout(() => {
        navigation.navigate("Delivery");
      }, 3000); // Redirect after 3 seconds of showing the "order sent" message
    }, 10000); // Show "order sent" message after 10 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#004AAD', '#004AAD']}
      style={tw`flex-1`}
    >
      <SafeAreaView style={tw`flex-1 justify-center items-center`}>
        <Animatable.Image
          source={require("../assets/orderLoading.gif")}
          animation="slideInUp"
          iterationCount={1}
          style={tw`h-96 w-96`}
        />

        <Animatable.Text
          animation="slideInUp"
          iterationCount={1}
          style={tw`my-10 text-lg font-bold text-center text-white`}
        >
          {orderSent
            ? "Seu pedido foi enviado ao restaurante!"
            : "Aguardando o Restaurante aceitar seu pedido!"}
        </Animatable.Text>

        <Progress.Circle size={60} indeterminate={true} color="#ffffff" />

        {orderSent && (
          <Animatable.Text
            animation="fadeIn"
            duration={500}
            style={tw`mt-5 text-lg font-bold text-center text-white`}
          >
            Redirecionando...
          </Animatable.Text>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SuccessScreen;
