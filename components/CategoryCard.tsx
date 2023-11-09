import React from "react";
import { TouchableOpacity, Text } from "react-native";
import tailwind from "tailwind-react-native-classnames";

const CategoryCard = ({ title, onPress }) => {
  return (
    <TouchableOpacity
      style={tailwind`relative mr-2`}
      onPress={onPress}
    >
      <Text style={tailwind`text-white font-bold`}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CategoryCard;
