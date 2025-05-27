import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, Image, Text, ActivityIndicator } from "react-native";
import tailwind from "tailwind-react-native-classnames";
import { store } from "../configs/types";

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

// ... (imports and interfaces)

const Categories: React.FC<CategoriesProps> = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://www.kudya.shop/api/customer/stores/");
      const data = await response.json();
  
      // Initialize an object to track unique categories based on their names
      const uniqueCategories: { [key: string]: Category } = {};
  
      // Iterate through the stores and add their primary category names to the uniqueCategories object
      data?.stores.forEach((store:any) => {
        const storeCategory = store?.category;
  
        if (
          storeCategory &&
          typeof storeCategory === 'object' &&
          'name' in storeCategory &&
          typeof storeCategory.name === 'string' &&
          typeof storeCategory.image === 'string'
        ) {
          const categoryName = storeCategory.name;
  
          // Add the category to the uniqueCategories object using its name as the key
          uniqueCategories[categoryName] = {
            id: Object.keys(uniqueCategories).length, // Use the current length as a unique identifier
            name: categoryName,
            image: storeCategory.image || 'defaultImageUrl',
          };
        }
      });
  
      // Convert the values of uniqueCategories object to an array
      const categoriesArray: Category[] = Object.values(uniqueCategories);
  
      console.log("Categories Array", categoriesArray);
  
      setCategories(categoriesArray);
      setLoading(false); // Set loading to false once categories are set
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  
  
  
  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#0000ff"
        accessibilityLabel="Loading categories"
      />
    );
  }
  

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

