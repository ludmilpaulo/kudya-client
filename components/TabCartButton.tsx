import React from "react";
import { TouchableOpacity, GestureResponderEvent, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";

interface TabCartButtonProps {
  onPress: (event: GestureResponderEvent) => void;
}

const TabCartButton: React.FC<TabCartButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={tw`bg-white w-15 h-15 rounded-full border-4 border-gray-200 justify-center items-center -mb-6`}>
        <Ionicons name="cart" color="#004AAD" size={27} />
      </View>
    </TouchableOpacity>
  );
};

export default TabCartButton;
