import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, Image, Text, ActivityIndicator } from "react-native";
import tw from "twrnc";
import { fetchstoreCategory } from "../services/apiService";

interface Category {
  id: number;
  name: string;
  image: string | null;
}

interface CategoriesProps {
  onSelectCategory: (categoryId: number, categoryName: string) => void;
}

const Categories: React.FC<CategoriesProps> = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchstoreCategory()
      .then((rows) => {
        if (cancelled) return;
        setCategories(
          rows.map((row) => ({
            id: row.id,
            name: row.name,
            image: row.image ?? null,
          })),
        );
        setError(null);
      })
      .catch(() => {
        if (!cancelled) {
          setCategories([]);
          setError("Could not load categories");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#0000ff"
        accessibilityLabel="Loading categories"
      />
    );
  }

  if (error) {
    return <Text style={tw`text-red-600 px-4`}>{error}</Text>;
  }

  if (categories.length === 0) {
    return <Text style={tw`text-slate-500 px-4`}>No categories yet</Text>;
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
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={tw`relative mr-2`}
          onPress={() => onSelectCategory(category.id, category.name)}
        >
          {category.image ? (
            <Image source={{ uri: category.image }} style={tw`h-20 w-20 rounded`} />
          ) : (
            <Text style={tw`h-20 w-20 text-center pt-6 bg-slate-200 rounded font-bold`}>
              {category.name.slice(0, 2).toUpperCase()}
            </Text>
          )}
          <Text style={tw`text-black font-bold`}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default Categories;
