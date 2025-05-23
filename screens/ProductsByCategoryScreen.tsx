// screens/ProductsByCategoryScreen.tsx

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  SafeAreaView,
} from "react-native";
import tw from "twrnc";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { fetchProductsByCategory} from "../redux/slices/productsByCategorySlice";
import { addItem } from "../redux/slices/basketSlice";
import { formatCurrency, getCurrencyForCountry } from "../utils/currency";
import { t } from "../configs/i18n";
import { Image } from "expo-image";
import { FontAwesome } from "@expo/vector-icons";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/navigation";
import { SizeQuantityModal } from "../components/SizeQuantityModal";
import * as Localization from "expo-localization";
import { StackNavigationProp } from '@react-navigation/stack';
import { Product } from "../services/types";

// Navigation types
type ProductsByCategoryScreenNavigationProp = StackNavigationProp<RootStackParamList, "ProductsByCategory">;
type ProductsByCategoryRouteProp = RouteProp<RootStackParamList, "ProductsByCategory">;
interface Props {
  route: ProductsByCategoryRouteProp;
}

const ProductsByCategoryScreen: React.FC<Props> = ({ route }) => {
  const { categoryId, categoryName } = route.params;
  const dispatch = useAppDispatch();
  const navigation = useNavigation<ProductsByCategoryScreenNavigationProp>();
  const { data: products, loading, error } = useAppSelector((state) => state.productsByCategory);

  // UI state
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onSale, setOnSale] = useState(false);

  // Modal state for add-to-cart (size/quantity)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  // Currency code & language detection
  const regionCode = Localization.getLocales?.()[0]?.regionCode || "ZA";
  const lang = Localization.getLocales?.()[0]?.languageCode || "en";
  const currencyCode = getCurrencyForCountry(regionCode);

  // Debounced product fetch (search/filter)
  const loadProducts = useCallback(() => {
    dispatch(
      fetchProductsByCategory({
        categoryId,
        search,
        minPrice,
        maxPrice,
        onSale,
      })
    );
  }, [dispatch, categoryId, search, minPrice, maxPrice, onSale]);

  // On filter change (except search, see below)
  useEffect(() => { loadProducts(); }, [categoryId, minPrice, maxPrice, onSale, loadProducts]);

  // Live search with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      loadProducts();
    }, 350);
    return () => clearTimeout(timeout);
  }, [search, loadProducts]);

  // Handler for add to cart (open modal for sizes)
  const handleAddToCart = (product: Product) => {
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      setModalProduct(product);
      setModalVisible(true);
    } else {
      dispatch(addItem({
        id: product.id,
        name: product.name,
        size: "",
        price: product.on_sale
          ? product.price - (product.price * product.discount_percentage) / 100
          : product.price,
        image: product.images?.[0]?.image || "",
        store: product.store_id,
        quantity: 1,
      }));
      Alert.alert(t("addToCart"), `${product.name} ${t("addToCart")}!`);
    }
  };

  // Callback when user selects size and quantity in modal
  const handleModalAdd = (size: string, quantity: number) => {
    if (!modalProduct) return;
    dispatch(addItem({
      id: modalProduct.id,
      name: modalProduct.name,
      size,
      price: modalProduct.on_sale
        ? modalProduct.price - (modalProduct.price * modalProduct.discount_percentage) / 100
        : modalProduct.price,
      image: modalProduct.images?.[0]?.image || "",
      store: modalProduct.store_id,
      quantity,
    }));
    Alert.alert(t("addToCart"), `${modalProduct.name} ${t("addToCart")}!`);
    setModalVisible(false);
    setModalProduct(null);
  };

  // UI render
  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      {/* Header and Search */}
      <View style={tw`flex-row items-center px-4 pt-6 pb-2`}>
        <Text style={tw`flex-1 text-2xl font-bold text-gray-900`}>{categoryName}</Text>
        <TouchableOpacity onPress={loadProducts} style={tw`ml-2`}>
          <FontAwesome name="refresh" size={20} color="#2563eb" />
        </TouchableOpacity>
      </View>
      {/* Filters */}
      <View style={tw`flex-row px-4 mb-2`}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t("search")}
          style={tw`flex-1 border border-gray-300 rounded-lg px-3 py-2 mr-2`}
          returnKeyType="search"
        />
        <TouchableOpacity
          onPress={() => setOnSale((prev) => !prev)}
          style={tw`px-4 py-2 rounded-lg ${onSale ? "bg-blue-600" : "bg-gray-300"}`}
        >
          <Text style={tw`text-white font-semibold text-xs`}>{t("addToCart")}</Text>
        </TouchableOpacity>
      </View>
      <View style={tw`flex-row px-4 mb-4`}>
        <TextInput
          value={minPrice}
          onChangeText={setMinPrice}
          placeholder="Min"
          keyboardType="numeric"
          style={tw`w-16 border border-gray-300 rounded-lg px-2 py-1 mr-2`}
        />
        <TextInput
          value={maxPrice}
          onChangeText={setMaxPrice}
          placeholder="Max"
          keyboardType="numeric"
          style={tw`w-16 border border-gray-300 rounded-lg px-2 py-1`}
        />
        <TouchableOpacity
          onPress={loadProducts}
          style={tw`ml-3 px-4 py-2 bg-blue-600 rounded-lg`}
        >
          <Text style={tw`text-white text-xs font-bold`}>{t("search")}</Text>
        </TouchableOpacity>
      </View>
      {/* Product List */}
      <ScrollView style={tw`flex-1 px-4`}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={tw`mt-10`} />
        ) : error ? (
          <Text style={tw`text-red-500 mt-10 text-center`}>{t("error")}</Text>
        ) : products.length === 0 ? (
          <Text style={tw`text-gray-500 mt-8 text-center`}>{t("noReviews")}</Text>
        ) : (
          products.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={tw`flex-row items-center bg-gray-100 rounded-xl p-4 mb-4`}
              onPress={() =>
                navigation.navigate("ProductDetails", { productId: product.id })
              }
              activeOpacity={0.92}
            >
              <Image
                source={{ uri: product.images?.[0]?.image }}
                style={tw`w-20 h-20 rounded-lg mr-4`}
                contentFit="cover"
              />
              <View style={tw`flex-1`}>
                <Text style={tw`text-lg font-semibold text-gray-800`}>
                  {product.name}
                </Text>
                <Text style={tw`text-base font-bold text-green-700 mt-1`}>
                  {formatCurrency(
                    product.on_sale
                      ? product.price - (product.price * product.discount_percentage) / 100
                      : product.price,
                    currencyCode,
                    lang
                  )}
                </Text>
                <Text style={tw`text-xs text-gray-400`}>
                  {t("inStock")}: {product.stock}
                </Text>
              </View>
              <TouchableOpacity
                style={tw`ml-4 bg-blue-600 px-3 py-2 rounded-xl`}
                onPress={(e) => {
                  e.stopPropagation?.();
                  handleAddToCart(product);
                }}
              >
                <Text style={tw`text-white font-bold text-xs`}>
                  {t("addToCart")}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      {/* Size/Quantity Modal */}
      <SizeQuantityModal
        visible={modalVisible}
        sizes={modalProduct?.sizes || []}
        maxQuantity={modalProduct?.stock || 1}
        onSelect={handleModalAdd}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default ProductsByCategoryScreen;
