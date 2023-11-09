import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import tailwind from "tailwind-react-native-classnames";
import CategoryCard from "./CategoryCard";

const Categories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();  // Implement this function to fetch categories
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://www.sunshinedeliver.com/api/categories/");
      const data = await response.json();
      setCategories(data);
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
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          title={category.name}
          onPress={() => handleCategoryPress(category.slug)}
        />
      ))}
    </ScrollView>
  );
};

export default Categories;
