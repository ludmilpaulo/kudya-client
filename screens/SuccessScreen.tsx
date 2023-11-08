import React, { useEffect } from "react";
import { View, Text, SafeAreaView } from "react-native";
import * as Animatable from "react-native-animatable";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";
import tailwind from 'tailwind-react-native-classnames';

const SuccessScreen = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    setTimeout(() => {
      navigation.navigate("DeliveryInfo");
    }, 4000);
  }, []);

  return (
    <SafeAreaView style={tailwind`bg-[#004AAD] flex-1 justify-center items-center`}>
      <Animatable.Image
        source={require("../assets/orderLoading.gif")}
        animation="slideInUp"
        iterationCount={1}
        style={tailwind`h-96 w-96`}
      />

      <Animatable.Text
        animation="slideInUp"
        iterationCount={1}
        style={tailwind`my-10 text-lg font-bold text-center text-Black`}
      >
       Aguardando o Restaurante aceitar seu pedido!
      </Animatable.Text>

      <Progress.Circle size={60} indeterminate={true} color= "#004AAD" />
    </SafeAreaView>
  );
};

export default SuccessScreen;
