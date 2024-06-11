import React from "react";
import { View, Image, Text } from "react-native";
import { useNavigation, StackNavigationProp } from "@react-navigation/native";
import tailwind from "tailwind-react-native-classnames";
import AppButton from "../components/AppButton";
import Screen from "../components/Screen";

// Define the type for the navigation prop
type JoinScreenProps = {
  navigation: StackNavigationProp<{}>;
};

function JoinScreen() {
  const navigation = useNavigation<any>();

  return (
    <Screen style={tailwind`flex-1 bg-gray-100`}>
      <View style={tailwind`flex-1 justify-center items-center p-5`}>
        <Image
          source={require("../assets/azul.png")}
          style={tailwind`h-64 w-64 mb-6`}
        />
        <Text style={tailwind`text-3xl font-bold text-center mb-4`}>
          Bem-vindo ao SD Kudya!
        </Text>
        <Text style={tailwind`text-base text-gray-700 text-center mb-6`}>
          Experimente o melhor serviço de entrega de comida na sua porta. Milhares de restaurantes locais e nacionais ao seu alcance!
        </Text>
        <Text style={tailwind`text-base text-gray-700 text-center mb-6`}>
          Está com fome? Não espere! Peça agora e desfrute de refeições deliciosas entregues rápido e frescas.
        </Text>
        <AppButton
          title="Let's go"
          onPress={() => navigation.navigate("UserLogin")}
          color="primary"
          disabled={false}
         
        />
      </View>
    </Screen>
  );
}

export default JoinScreen;
