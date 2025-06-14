import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import tw from "twrnc";
import { FontAwesome5 } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { useDispatch, useSelector } from "react-redux";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import * as Localization from "expo-localization";
import { fetchProductsByStore } from "../redux/slices/productsSlice";
import { RootState, AppDispatch } from "../redux/store";
import { LinearGradient } from "expo-linear-gradient";
import { Product } from "../services/types";
import { formatCurrency, getCurrencyForCountry } from "../utils/currency";
import { RootStackParamList } from "../navigation/navigation";
import { addItem, removeItem, selectCartItems } from "../redux/slices/basketSlice";
import { useTranslation } from "../hooks/useTranslation";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function ProductsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Products">>();
  const navigation = useNavigation<any>();
  const { storeId, storeName } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof storeId === "number") {
      dispatch(fetchProductsByStore(storeId));
    }
  }, [storeId, dispatch]);

  const products = useSelector((state: RootState) => state.products.data) as Product[];
  const loading = useSelector((state: RootState) => state.products.loading);
  const error = useSelector((state: RootState) => state.products.error);

  const cartItems = useSelector(selectCartItems);

  const [activeCartProductId, setActiveCartProductId] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Categories
  const categories = useMemo(
    () => [
      ...new Set(products.map((p) => p.category || "All")),
    ],
    [products]
  );

  // Filtered products
  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (p) => (p.category || "All") === selectedCategory
      );
    }
    if (search.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search.trim().toLowerCase()) ||
          (p.description ?? "")
            .toLowerCase()
            .includes(search.trim().toLowerCase())
      );
    }
    return filtered;
  }, [products, search, selectedCategory]);

  // On sale products (promo carousel)
  const onSaleProducts = useMemo(
    () =>
      products.filter((p) => p.on_sale && p.discount_percentage > 0),
    [products]
  );

  // Carousel banners for sales (top 5)
  const promoBanners = onSaleProducts.slice(0, 5).map((product) => ({
    id: product.id,
    name: product.name,
    subtitle: product.discount_percentage > 0 ? `-${product.discount_percentage}%` : "SALE",
    image:
      product.images?.[0]?.image?.startsWith("/media/")
        ? `${process.env.NEXT_PUBLIC_BASE_API}${product.images[0].image}`
        : product.images?.[0]?.image ||
          "https://via.placeholder.com/400x150",
  }));

  // Language and currency
  const language = (Localization.getLocales?.()[0]?.languageCode || "en").toLowerCase();
  const localeObj = Localization.getLocales?.()[0];
  const regionCode = localeObj?.regionCode ?? undefined; // string | undefined
  const currencyCode = getCurrencyForCountry(regionCode);

  // Get cart item (for product+size)
  const getCartItem = (productId: number, size: string | null) => {
    return cartItems.find(
      (item) =>
        item.id === productId &&
        (item.size || "") === (size || "")
    );
  };

  // Add to cart flow logic
  const handleAddToCart = (product: Product) => {
    setActiveCartProductId(product.id);
    setSelectedSize(null);
  };

  // Size select
  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    // Add to cart immediately with quantity 1
    if (activeCartProductId !== null) {
      const product = products.find((p) => p.id === activeCartProductId);
      if (product) {
        dispatch(
          addItem({
            id: product.id,
            name: product.name,
            price:
              product.on_sale && product.discount_percentage > 0
                ? product.price - (product.price * product.discount_percentage) / 100
                : product.price,
            image: product.images?.[0]?.image,
            size,
            store: storeId,
            quantity: 1,
          })
        );
      }
    }
  };

  // Plus/minus quantity
  const handleChangeQuantity = (
    change: 1 | -1,
    product: Product,
    size: string | null
  ) => {
    const cartItem = getCartItem(product.id, size);

    if (change === 1) {
      if (cartItem && cartItem.quantity >= product.stock) {
        Alert.alert(
          t("stockLimitReached", "Stock Limit Reached"),
          `${t("only", "Only")} ${product.stock} ${t("itemsAvailable", "items available")}.`
        );
        return;
      }
      dispatch(
        addItem({
          id: product.id,
          name: product.name,
          price:
            product.on_sale && product.discount_percentage > 0
              ? product.price - (product.price * product.discount_percentage) / 100
              : product.price,
          image: product.images?.[0]?.image,
          size: size || "",
          store: storeId,
          quantity: 1,
        })
      );
    } else if (cartItem) {
      if (cartItem.quantity === 1) {
        dispatch(removeItem({ id: product.id, size: size || "" }));
        setActiveCartProductId(null);
        setSelectedSize(null);
      } else {
        dispatch(removeItem({ id: product.id, size: size || "" }));
      }
    }
  };

  // Check if product (with any size) is already in cart
  const isProductInCart = (product: Product) => {
    // If product has sizes, check all
    if (product.sizes && product.sizes.length > 0) {
      return cartItems.some(item => item.id === product.id);
    }
    // No sizes: check id only
    return cartItems.some(item => item.id === product.id && (!item.size || item.size === ""));
  };

  // UI render
  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <LinearGradient
        colors={["#FCD34D", "#ffcc00", "#3B82F6"]}
        style={tw`flex-1 absolute w-full h-full`}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-16 pt-4`}
      >
        {/* Carousel: Sales Banners */}
        {promoBanners.length > 0 && (
          <Carousel
            loop
            width={width}
            height={150}
            autoPlay
            autoPlayInterval={4000}
            data={promoBanners}
            scrollAnimationDuration={1000}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation.navigate("ProductDetails", { productId: item.id })}
                style={tw`relative rounded-xl overflow-hidden mx-4 mt-2`}
                activeOpacity={0.92}
              >
                <Image
                  source={{ uri: item.image }}
                  style={tw`w-full h-40 rounded-xl`}
                  contentFit="cover"
                />
                <View style={tw`absolute inset-0 bg-black/40 flex justify-center px-4`}>
                  <Text style={tw`text-white text-lg font-bold`}>
                    {item.name}
                  </Text>
                  <Text style={tw`text-white text-sm mt-1 font-semibold`}>
                    {item.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Header */}
        <Text style={tw`text-2xl font-bold mb-3 mx-4 text-white`}>
          {storeName || t("Stores", "Loja")}
        </Text>

        {/* Search Bar */}
        <View style={tw`flex-row items-center bg-gray-100 rounded-full px-4 py-3 shadow-sm mx-4 mb-4`}>
          <FontAwesome5 name="search" size={16} color="#666" style={tw`mr-3`} />
          <TextInput
            placeholder={t("search", "Pesquisar produtos...")}
            placeholderTextColor="#888"
            style={tw`flex-1 text-base text-black`}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`pl-4 pr-2 pb-2`}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory("all")}
            style={[
              tw`px-4 py-2 rounded-full border mr-2`,
              selectedCategory === "all"
                ? tw`bg-black border-black`
                : tw`bg-white border-gray-300`,
            ]}
          >
            <Text style={tw`${selectedCategory === "all" ? "text-white" : "text-gray-800"} text-sm font-semibold`}>
              {t("Categories", "Todas")}
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                tw`px-4 py-2 rounded-full border mr-2`,
                selectedCategory === cat
                  ? tw`bg-black border-black`
                  : tw`bg-white border-gray-300`,
              ]}
            >
              <Text style={tw`${selectedCategory === cat ? "text-white" : "text-gray-800"} text-sm font-semibold`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Error/Empty/Loading States */}
        {loading && (
          <View style={tw`items-center justify-center w-full py-12`}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={tw`text-gray-100 mt-3`}>
              {t("loading", "Carregando produtos...")}
            </Text>
          </View>
        )}

        {!loading && error && (
          <Text style={tw`text-red-100 bg-red-500/70 text-center w-full py-3 rounded-xl mx-4`}>
            {t("error", "Falha ao carregar produtos. Tente novamente.")}
          </Text>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <Text style={tw`text-center text-white/90 mt-16 w-full`}>
            {t("noStores", "Nenhum produto encontrado.")}
          </Text>
        )}

        {/* Product Grid */}
        <View style={tw`flex-row flex-wrap justify-between px-4`}>
          {!loading &&
            !error &&
            filteredProducts.map((product, idx) => {
              const hasSale = product.on_sale && product.discount_percentage > 0;
              const price = hasSale
                ? product.price - (product.price * product.discount_percentage) / 100
                : product.price;

              // Stock status
              let stockLabel = "";
              let stockBadgeColor = "";
              let disableAddToCart = false;
              if (product.stock <= 0) {
                stockLabel = t("outOfStock", "Esgotado");
                stockBadgeColor = "#EF4444";
                disableAddToCart = true;
              } else if (product.stock === 1) {
                stockLabel = t("lastOne", "Último!");
                stockBadgeColor = "#F59E42";
                disableAddToCart = true;
              } else if (product.stock < 10) {
                stockLabel = t("lowStock", "Pouco Stock");
                stockBadgeColor = "#FCD34D";
              }

              // Get cart item (product+size)
              const isActive =
                activeCartProductId === product.id ||
                !!getCartItem(product.id, selectedSize);
              const cartItem =
                getCartItem(product.id, selectedSize) ||
                (product.sizes?.length
                  ? getCartItem(product.id, selectedSize)
                  : getCartItem(product.id, ""));

              const alreadyInCart = isProductInCart(product);

              return (
                <Animated.View
                  key={product.id}
                  entering={FadeInUp.delay(idx * 60)}
                  style={[{ width: cardWidth }, tw`mb-4`]}
                >
                  <View
                    style={[
                      tw`bg-white rounded-2xl p-3 shadow-md relative`,
                      hasSale && { borderWidth: 2, borderColor: "#3B82F6" },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.95}
                      onPress={() => navigation.navigate("ProductDetails", { productId: product.id })}
                    >
                      <View>
                        <Image
                            source={
                              product.images?.[0]
                                ? {
                                    uri: product.images[0].startsWith("/media/")
                                      ? `${process.env.NEXT_PUBLIC_BASE_API}${product.images[0]}`
                                      : product.images[0]
                                  }
                                : undefined
                            }
                            style={tw`w-full h-28 rounded-lg mb-2 bg-gray-200`}
                            contentFit="cover"
                          />

                        {hasSale && (
                          <View style={tw`absolute top-2 right-2 bg-blue-500 rounded-lg px-2 py-1 flex-row items-center`}>
                            <Text style={tw`text-white text-xs font-bold`}>
                              -{product.discount_percentage}%
                            </Text>
                          </View>
                        )}
                        {stockLabel && (
                          <View style={[
                            tw`absolute top-2 left-2 rounded-lg px-2 py-1`,
                            { backgroundColor: stockBadgeColor }
                          ]}>
                            <Text style={tw`text-white text-xs font-bold`}>
                              {stockLabel}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={tw`text-base font-bold text-gray-800 mt-1`} numberOfLines={2}>
                        {product.name}
                      </Text>
                    </TouchableOpacity>
                    <View style={tw`flex-row items-center mt-2 mb-2`}>
                      {hasSale && (
                        <Text style={tw`text-gray-400 line-through text-xs mr-2`}>
                          {formatCurrency(product.price, currencyCode, language)}
                        </Text>
                      )}
                      <Text style={tw`text-blue-700 font-semibold text-base`}>
                        {formatCurrency(price, currencyCode, language)}
                      </Text>
                    </View>

                    {/* Add to Cart flow */}
                    {!alreadyInCart && !disableAddToCart && (
                      <>
                        {/* 1. Button */}
                        {!isActive && (
                          <TouchableOpacity
                            style={tw`bg-green-600 py-2 rounded-lg items-center`}
                            onPress={() => handleAddToCart(product)}
                            disabled={disableAddToCart}
                          >
                            <Text style={tw`text-white font-bold`}>
                              {t("addToCart", "Adicionar ao Carrinho")}
                            </Text>
                          </TouchableOpacity>
                        )}

                        {/* 2. Select Size */}
                        {isActive &&
                          product.sizes &&
                          product.sizes.length > 0 &&
                          !selectedSize && (
                            <View style={tw`flex-row flex-wrap mt-2`}>
                              {product.sizes.map((size) => (
                                <TouchableOpacity
                                  key={size}
                                  style={[
                                    tw`px-4 py-2 rounded-full border m-1`,
                                    selectedSize === size
                                      ? tw`bg-black border-black`
                                      : tw`bg-white border-gray-300`,
                                  ]}
                                  onPress={() => handleSelectSize(size)}
                                >
                                  <Text
                                    style={tw`font-bold ${selectedSize === size ? "text-white" : "text-gray-800"}`}
                                  >
                                    {size}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}

                        {/* 3. Plus/Minus Quantity */}
                        {isActive &&
                          ((product.sizes && product.sizes.length > 0 && selectedSize) ||
                            (!product.sizes || product.sizes.length === 0)) && (
                            <View style={tw`flex-row items-center justify-center mt-2`}>
                              <TouchableOpacity
                                style={tw`bg-gray-200 rounded-full w-10 h-10 items-center justify-center`}
                                onPress={() => handleChangeQuantity(-1, product, selectedSize)}
                                disabled={!cartItem || cartItem.quantity <= 0}
                              >
                                <Text style={tw`text-xl font-bold`}>-</Text>
                              </TouchableOpacity>
                              <Text style={tw`mx-6 text-lg font-bold`}>
                                {cartItem?.quantity || 1}
                              </Text>
                              <TouchableOpacity
                                style={tw`bg-gray-200 rounded-full w-10 h-10 items-center justify-center`}
                                onPress={() => handleChangeQuantity(1, product, selectedSize)}
                                disabled={
                                  !cartItem ||
                                  cartItem.quantity >= product.stock
                                }
                              >
                                <Text style={tw`text-xl font-bold`}>+</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                      </>
                    )}

                    {/* Show "Go to Cart" if in cart */}
                    {alreadyInCart && (
                      <TouchableOpacity
                        style={tw`bg-blue-600 py-2 rounded-lg items-center`}
                        onPress={() => navigation.navigate("Cart")}
                      >
                        <Text style={tw`text-white font-bold`}>
                        {t("goToCart")}
                      </Text>

                      </TouchableOpacity>
                    )}
                  </View>
                </Animated.View>
              );
            })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
