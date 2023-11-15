import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, Image, Text } from "react-native";
import tailwind from "tailwind-react-native-classnames";
import { Restaurant } from "../configs/types";

interface Category {
  id?: number;
  name: string;
  image: string;
}

interface CategoriesProps {
  onSelectCategory: (category: string) => void;
}

const Categories: React.FC<CategoriesProps> = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  
  // ...

const fetchCategories = async () => {
  try {
    const response = await fetch("https://www.sunshinedeliver.com/api/customer/restaurants/");
    const data = await response.json();

    // Use a Set to ensure unique categories
    const uniqueCategories = new Set<string>();

    // Iterate through the restaurants and add their primary categories to the Set
    data?.restaurants.forEach((restaurant: Restaurant) => {
      const restaurantCategory = restaurant?.category || {};

      // Make sure to access the name property correctly
      const categoryName = (restaurantCategory as { name?: string }).name || "";

      uniqueCategories.add(categoryName);
    });

    // Convert the Set back to an array
    const categoriesData: Category[] = Array.from(uniqueCategories).map((name, index) => {
      // Fetch the default image URL for each category from your data
      const matchingRestaurant = data.restaurants.find(
        (restaurant: Restaurant) => restaurant.category?.name === name
      );

      // Use the category image from the first restaurant that matches the category name
      const defaultImage = matchingRestaurant?.category?.image || "";

      return {
        id: index + 1,
        name: name,
        image: defaultImage,
      };
    });

    setCategories(categoriesData);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

// ...


  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 15,
        paddingTop: 10,
      }}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={tailwind`relative mr-2`}
          onPress={() => onSelectCategory(category.name)}
        >
          <Image source={{ uri: category.image }} style={tailwind`h-20 w-20 rounded`} />
          <Text style={tailwind`text-black font-bold`}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default Categories;
