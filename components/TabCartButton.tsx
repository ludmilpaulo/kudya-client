import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";

const TabCartButton: React.FC = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.navigate("CartPage" as never)}>
      <View style={tw`bg-white w-16 h-16 rounded-full border-4 border-gray-200 justify-center items-center shadow-md`}>
        <Ionicons name="cart" color="#004AAD" size={28} />
      </View>
    </TouchableOpacity>
  );
};

export default TabCartButton;
