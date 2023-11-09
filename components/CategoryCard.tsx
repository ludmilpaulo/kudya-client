import React from "react";
import { TouchableOpacity, Text, Image, ImageSourcePropType } from "react-native";
import tailwind from "tailwind-react-native-classnames";

interface CategoryCardProps {
  title: string;
  imgUrl: ImageSourcePropType;
  onPress: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, imgUrl, onPress }) => {
  return (
    <TouchableOpacity
      style={tailwind`relative mr-2`}
      onPress={onPress}
    >
      <Image
        source={imgUrl}
        style={tailwind`h-20 w-20 rounded`}
      />
      <Text style={tailwind`text-white font-bold`}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CategoryCard;
