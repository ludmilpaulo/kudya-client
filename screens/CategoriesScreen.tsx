import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import tw from "twrnc";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { t } from "../configs/i18n";
import { fetchCategories } from "../redux/slices/categorySlice";
import { RootStackParamList } from "../navigation/navigation";

const { width } = Dimensions.get("window");

type Category = {
  id: number;
  name: string;
  icon?: string;
};

type CategoriesScreenNavigationProp = StackNavigationProp<RootStackParamList, "Categories">;

const iconFallback = "th-large";

const gradientColors: ReadonlyArray<[string, string]> = [
  ["#2563eb", "#60a5fa"],
  ["#16a34a", "#4ade80"],
  ["#f59e42", "#fbbf24"],
  ["#ec4899", "#f472b6"],
];

const getGradient = (idx: number) => gradientColors[idx % gradientColors.length];

const CategoriesScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<CategoriesScreenNavigationProp>();
  const { data: categories, loading, error } = useAppSelector((state) => state.categories);

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Memoized filtered categories (case and accent insensitive)
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const normalized = (str: string) =>
      str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return categories.filter((cat) =>
      normalized(cat.name).includes(normalized(search))
    );
  }, [categories, search]);

  // Loading
  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white`}>
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={tw`mt-4 text-gray-500`}>{t("loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error
  if (error) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white`}>
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-red-500 text-base`}>{t("error")}</Text>
          <Text style={tw`text-xs text-gray-400 text-center mt-2 px-6`}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Sticky/animated header */}
        <Animated.View
          entering={FadeInDown}
          style={[
            tw`w-full pb-4 pt-10 px-6 bg-white z-10`,
            {
              shadowColor: "#2563eb",
              shadowOpacity: 0.09,
              shadowOffset: { width: 0, height: 5 },
              shadowRadius: 10,
              elevation: 7,
            },
          ]}
        >
          <Text style={tw`text-3xl font-bold text-gray-900 mb-1`}>
            {t("browse")}
          </Text>
          <Text style={tw`text-base text-gray-500 mb-3`}>
            {t("search")} {t("selectStore").toLowerCase()}
          </Text>
          <View
            style={tw`flex-row items-center rounded-xl bg-gray-100 px-4 py-2`}
          >
            <FontAwesome5 name="search" size={18} color="#64748b" style={tw`mr-2`} />
            <TextInput
              style={tw`flex-1 text-base text-gray-800`}
              placeholder={t("search")}
              placeholderTextColor="#a3a3a3"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
              accessibilityLabel={t("search")}
              clearButtonMode="while-editing"
              returnKeyType="search"
            />
          </View>
        </Animated.View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingTop: 8,
            paddingBottom: 30,
          }}
          showsVerticalScrollIndicator={false}
        >
          {filteredCategories.length > 0 ? (
            filteredCategories.map((cat: Category, idx: number) => (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.90}
                style={[
                  tw`flex-row items-center mb-4 rounded-2xl bg-white`,
                  {
                    paddingVertical: 17,
                    paddingHorizontal: 16,
                    elevation: 3,
                    shadowColor: "#2563eb",
                    shadowOpacity: 0.10,
                    shadowRadius: 13,
                    shadowOffset: { width: 0, height: 7 },
                    minHeight: 80,
                  },
                ]}
                onPress={() =>
                  navigation.navigate("ProductsByCategory", {
                    categoryId: cat.id,
                    categoryName: cat.name,
                  })
                }
              >
                <LinearGradient
                  colors={getGradient(idx)}
                  style={[
                    tw`rounded-xl justify-center items-center mr-4`,
                    { width: 52, height: 52 },
                  ]}
                  start={{ x: 0, y: 0.6 }}
                  end={{ x: 1, y: 0 }}
                >
                  <FontAwesome5
                    name={(cat.icon as any) || iconFallback}
                    size={25}
                    color="#fff"
                  />
                </LinearGradient>
                <Text style={tw`text-lg font-semibold text-gray-900 flex-1`}>
                  {cat.name}
                </Text>
                <FontAwesome5
                  name="chevron-right"
                  color="#b6c0d6"
                  size={17}
                  style={tw`ml-2`}
                />
              </TouchableOpacity>
            ))
          ) : (
            <View style={tw`justify-center items-center mt-24`}>
              <Text style={tw`text-gray-400 text-base text-center mb-4`}>
                {t("noStores")}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CategoriesScreen;
