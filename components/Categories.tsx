import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, Image, Text } from "react-native";
import tailwind from "tailwind-react-native-classnames";
import CategoryCard from "./CategoryCard";
import { Restaurant } from "../configs/types";

// Define the category type
interface Category {
  id: number;
  name: string;
  image: string;
  // Add other category properties if needed
}

interface CategoriesProps {
  onSelectCategory: (category: string) => void;
}

const Categories: React.FC<CategoriesProps> = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://www.sunshinedeliver.com/api/customer/restaurants/");
      const data = await response.json();

      // Use optional chaining to safely access nested properties
      const categoriesData = data?.restaurants.map((restaurant: Restaurant) => restaurant?.category) || [];

      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };


  return (
    <ScrollView
    contentContainerStyle={{
      paddingHorizontal: 15,
      paddingTop: 10,
    }}
    horizontal
    showsHorizontalScrollIndicator={false}
  >
    {categories.map((category, index) => (

<TouchableOpacity
style={tailwind`relative mr-2`}
onPress={() => onSelectCategory(category?.name || '')}
>
<Image
  source={{ uri : category?.image}}
  style={tailwind`h-20 w-20 rounded`}
/>
<Text style={tailwind`text-black font-bold`}>{category?.name}</Text>
</TouchableOpacity>
      
     
    ))}
  </ScrollView>
  );
};

export default Categories;