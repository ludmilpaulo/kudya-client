import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Share,
} from "react-native";
import { Image } from "expo-image";
import Carousel from "react-native-reanimated-carousel";
import Animated, { FadeInUp } from "react-native-reanimated";
import tw from "twrnc";
import { FontAwesome, Feather, AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { baseAPI, Product, Review } from "../services/types";
import { addItem } from "../redux/slices/basketSlice";
import { selectUser } from "../redux/slices/authSlice";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/navigation";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { t } from "../configs/i18n";
import { formatCurrency } from "../utils/currency";
import * as Localization from "expo-localization";
import { getWishlist, removeFromWishlist, addToWishlist, fetchWishlistCount } from "../services/WishlistService";
import { setWishlistCount } from "../redux/slices/wishlistSlice";
import { StackScreenProps, StackNavigationProp } from "@react-navigation/stack";
import { fetchRelatedProducts } from "../redux/slices/relatedProductsSlice";

const { width } = Dimensions.get("window");

type Props = StackScreenProps<RootStackParamList, "ProductDetails">;

// Helper: Find product in all Redux slices (add more slices as needed)
function findProductInRedux(productId: number, state: RootState): Product | undefined {
  return (
    state.productsByCategory.data.find((p) => p.id === productId) ||
    state.relatedProducts.data.find((p) => p.id === productId) ||
    state.products.data.find((p) => p.id === productId)
  );
}

const ProductDetailScreen = ({ route }: Props) => {
  const productId = route.params.productId;
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const reduxState = useSelector((state: RootState) => state);

  // Unified Redux check
  const product: Product | undefined = useMemo(
    () => findProductInRedux(productId, reduxState),
    [reduxState, productId]
  );

  // Fallback/server fetch
  const [loading, setLoading] = useState<boolean>(!product);
  const [fetchedProduct, setFetchedProduct] = useState<Product | null>(null);

  // UI State
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);

  // Region/currency/language
  const regionCode: string = Localization.getLocales?.()[0]?.regionCode || "ZA";
  const language = (Localization.getLocales?.()[0]?.languageCode || "en").toLowerCase();

  // User/auth
  const user = useSelector(selectUser);
  const userId = user?.user_id;
  const API_BASE_URL = baseAPI;

  // Related products
  const related = useSelector((state: RootState) => state.relatedProducts);
  const relatedProducts = related.data.filter((p) => p.id !== productId);

  // Use product from Redux or fallback
  const productToShow: Product | undefined = product || fetchedProduct || undefined;

  // Cart state: check if this product+size is already in cart
  const cartItems = useSelector((state: RootState) => state.basket.items);
  const isInCart: boolean =
    !!(
      productToShow &&
      selectedSize &&
      cartItems.some(
        (item) => item.id === productToShow.id && item.size === selectedSize
      )
    );

  // Fetch product if not in Redux
  useEffect(() => {
    setFetchedProduct(null);
    setLoading(!product);

    if (!product) {
      fetch(`${API_BASE_URL}/store/products/${productId}/`)
        .then((r) => r.json())
        .then((data) => {
          if (!data || data.detail === "Not found.") {
            setFetchedProduct(null);
            Alert.alert(t("error"), t("productNotFound"));
            setLoading(false);
            return;
          }
          setFetchedProduct(data);
        })
        .catch(() => {
          setFetchedProduct(null);
          Alert.alert(t("error"), t("productNotFound"));
        })
        .finally(() => setLoading(false));
    }
  }, [productId, product]);

  // Fetch related products
  useEffect(() => {
    dispatch(fetchRelatedProducts(productId));
  }, [dispatch, productId]);

  // Wishlist and reviews fetch
  useEffect(() => {
    if (!productToShow || !userId) return;
    getWishlist(userId).then((wishlist) =>
      setIsWishlisted(
        wishlist.some((item) => item.product.id === productId)
      )
    );
    fetch(`${API_BASE_URL}/product/products/${productId}/reviews/`)
      .then((r) => r.json())
      .then((data: Review[]) => {
        setReviews(data);
        const avg =
          data.length > 0
            ? data.reduce((sum, r) => sum + r.rating, 0) / data.length
            : 0;
        setAverageRating(parseFloat(avg.toFixed(1)));
      });
  }, [productToShow, productId, userId]);

  // --- Actions ---
  const toggleWishlist = async () => {
    if (!userId || !productToShow) {
      Alert.alert(t("error"), t("addToWishlist"));
      return;
    }
    if (isWishlisted) {
      const result = await removeFromWishlist(userId, productToShow.id);
      if (result) setIsWishlisted(false);
    } else {
      await addToWishlist(userId, productToShow.id);
      setIsWishlisted(true);
    }
    const newCount = await fetchWishlistCount(userId);
    dispatch(setWishlistCount(newCount));
  };

  const handleShare = async () => {
    try {
      const universalLink = `${API_BASE_URL}/deeplink/product/${productId}`;
      const imageUrl = productToShow?.images?.[0]?.image || null;
      const shareMessage = `🛍️ ${t("share")}\n\n${productToShow?.name}\n${universalLink}`;
      if (!imageUrl) {
        await Share.share({ message: shareMessage, title: productToShow?.name });
        return;
      }
      if (Platform.OS === "android") {
        await Share.share({ message: shareMessage, title: productToShow?.name });
      } else {
        const localUri = `${FileSystem.cacheDirectory}product.jpg`;
        const download = await FileSystem.downloadAsync(imageUrl, localUri);
        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (!isSharingAvailable) {
          Alert.alert(t("error"), t("shareFailed"));
          return;
        }
        await Sharing.shareAsync(download.uri, {
          dialogTitle: `${t("share")} ${productToShow?.name}`,
          mimeType: "image/jpeg",
          UTI: "public.jpeg",
        });
      }
    } catch (error) {
      Alert.alert(t("error"), t("shareFailed"));
    }
  };

  // Add to cart
  const handleAddToCart = () => {
    if (!productToShow) return;
    if (productToShow.sizes && productToShow.sizes.length > 0 && !selectedSize) {
      Alert.alert(t("selectSize"), t("selectSize"));
      return;
    }
    if (productToShow.stock === 0) {
      Alert.alert(t("outOfStock"), t("outOfStock"));
      return;
    }
    const price = productToShow.on_sale
      ? Number(productToShow.price) -
        (Number(productToShow.price) * productToShow.discount_percentage) / 100
      : Number(productToShow.price);
    dispatch(
      addItem({
        id: productToShow.id,
        name: productToShow.name,
        size: selectedSize || "",
        price,
        image: productToShow.images?.[0]?.image || "",
        store: productToShow.store_id,
        quantity,
      })
    );
    Alert.alert(t("addToCart"), `${productToShow.name} ${t("addToCart")}!`);
  };

  // Loading state
  if (loading || !productToShow) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center bg-gray-100`}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`pb-24`}>
        {/* Top actions */}
        <View style={tw`flex-row justify-between items-center px-4 pt-4`}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`p-2 bg-gray-200 rounded-full`}
            accessibilityLabel={t("back")}
          >
            <AntDesign name="arrowleft" size={24} />
          </TouchableOpacity>
          <View style={tw`flex-row`}>
            <TouchableOpacity
              onPress={toggleWishlist}
              style={tw`mr-4`}
              accessibilityLabel={isWishlisted ? t("removeFromWishlist") : t("addToWishlist")}
            >
              <FontAwesome
                name={isWishlisted ? "heart" : "heart-o"}
                size={24}
                color={isWishlisted ? "red" : "black"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} accessibilityLabel={t("share")}>
              <Feather name="share-2" size={24} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Product Images Carousel */}
        <Animated.View entering={FadeInUp}>
          <Carousel
            width={width}
            height={width}
            data={productToShow.images || []}
            autoPlay
            autoPlayInterval={5000}
            loop
            scrollAnimationDuration={800}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.image }}
                style={tw`w-full h-full rounded-xl`}
                placeholder={{
                  uri: "https://via.placeholder.com/400?text=Loading...",
                }}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={300}
              />
            )}
          />
        </Animated.View>
        {/* Product Details */}
        <Animated.View entering={FadeInUp.delay(100)} style={tw`p-4`}>
          <Text style={tw`text-3xl font-bold text-gray-900`}>
            {productToShow.name}
          </Text>
          <View style={tw`flex-row items-center mt-1`}>
            {productToShow.on_sale ? (
              <>
                <Text style={tw`text-lg text-gray-400 line-through mr-2`}>
                  {formatCurrency(Number(productToShow.price), regionCode, language)}
                </Text>
                <Text style={tw`text-xl text-green-700 font-bold`}>
                  {formatCurrency(
                    Number(productToShow.price) -
                      (Number(productToShow.price) *
                        productToShow.discount_percentage) /
                        100,
                    regionCode,
                    language
                  )}
                </Text>
                <Text style={tw`ml-2 text-sm bg-red-500 text-white rounded px-2`}>
                  -{productToShow.discount_percentage}%
                </Text>
              </>
            ) : (
              <Text style={tw`text-xl text-green-700`}>
                {formatCurrency(Number(productToShow.price), regionCode, language)}
              </Text>
            )}
          </View>
          <Text
            style={tw`text-sm mt-1 ${
              productToShow.stock <= 3 ? "text-red-500" : "text-green-600"
            }`}
          >
            {productToShow.stock === 0
              ? t("outOfStock")
              : productToShow.stock === 1
              ? t("lastOne")
              : productToShow.stock <= 3
              ? t("lowStock")
              : `${productToShow.stock} ${t("inStock")}`}
          </Text>
          {/* Sizes */}
          {Array.isArray(productToShow.sizes) && productToShow.sizes.length > 0 && (
            <View style={tw`mt-6`}>
              <Text style={tw`text-base font-semibold mb-2 text-gray-800`}>
                {t("selectSize")}
              </Text>
              <View style={tw`flex-row flex-wrap`}>
                {productToShow.sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    style={tw`mr-2 mb-2 px-4 py-2 border rounded-full ${
                      selectedSize === size
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300"
                    }`}
                  >
                    <Text
                      style={tw`${
                        selectedSize === size ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          {/* Quantity */}
          <Animated.View entering={FadeInUp.delay(200)} style={tw`mt-6`}>
            <Text style={tw`text-base font-semibold mb-2 text-gray-800`}>
              {t("quantity")}
            </Text>
            <View style={tw`flex-row items-center`}>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={tw`px-4 py-2 bg-gray-200 rounded-l`}
                accessibilityLabel={t("decrease")}
              >
                <Text style={tw`text-xl`}>-</Text>
              </TouchableOpacity>
              <Text style={tw`px-4 py-2 border-t border-b border-gray-300`}>
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (quantity < (productToShow.stock || 1)) {
                    setQuantity((q) => q + 1);
                  } else {
                    Alert.alert(
                      t("stockLimitReached"),
                      `${t("only")} ${productToShow.stock} ${t("itemsAvailable")}.`
                    );
                  }
                }}
                style={tw`px-4 py-2 bg-gray-200 rounded-r`}
                accessibilityLabel={t("increase")}
              >
                <Text style={tw`text-xl`}>+</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          {/* Add to Cart */}
          <Animated.View entering={FadeInUp.delay(300)}>
            <TouchableOpacity
              onPress={handleAddToCart}
              disabled={productToShow.stock === 0}
              style={tw`mt-6 py-4 rounded-xl shadow-lg ${
                productToShow.stock === 0
                  ? "bg-gray-400"
                  : isInCart
                  ? "bg-blue-600"
                  : "bg-green-600"
              }`}
              accessibilityLabel={t("addToCart")}
            >
              <Text style={tw`text-white text-center font-bold text-lg`}>
                {productToShow.stock === 0
                  ? t("outOfStock")
                  : isInCart
                  ? t("goToCart")
                  : t("addToCart")}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          {/* Ratings & Reviews */}
          <Animated.View entering={FadeInUp.delay(400)} style={tw`mt-10`}>
            <Text style={tw`text-lg font-bold text-gray-800 mb-2`}>
              {t("rating")}: {averageRating} / 5
            </Text>
            <View style={tw`flex-row items-center`}>
              {[...Array(5)].map((_, i) => (
                <FontAwesome
                  key={i}
                  name={i < Math.round(averageRating) ? "star" : "star-o"}
                  size={20}
                  color="#fbbf24"
                  style={tw`mr-1`}
                />
              ))}
            </View>
          </Animated.View>
          {/* Reviews */}
          <Animated.View entering={FadeInUp.delay(500)} style={tw`mt-6`}>
            <Text style={tw`text-lg font-bold text-gray-800 mb-2`}>
              {t("customerReviews")}
            </Text>
            {reviews.length === 0 ? (
              <Text style={tw`text-sm text-gray-500`}>{t("noReviews")}</Text>
            ) : (
              reviews.map((review) => (
                <View key={review.id} style={tw`mb-4 bg-gray-100 p-3 rounded-lg`}>
                  <Text style={tw`font-semibold text-gray-700`}>
                    {review.user}
                  </Text>
                  <Text style={tw`text-sm text-gray-600`}>
                    {review.comment}
                  </Text>
                  <Text style={tw`text-xs text-gray-400 mt-1`}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </Animated.View>
        </Animated.View>

        {/* --- Related Products --- */}
        <View style={tw`mt-8`}>
          <Text style={tw`text-xl font-bold text-gray-900 mb-2`}>
            {t("youMayAlsoLike")}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {related.loading ? (
              <ActivityIndicator style={tw`mx-4`} size="small" color="#4f46e5" />
            ) : relatedProducts.length === 0 ? (
              <Text style={tw`text-gray-400 mx-4`}>{t("noReviews")}</Text>
            ) : (
              relatedProducts.map((rel) => (
                <TouchableOpacity
                  key={rel.id}
                  style={tw`w-36 mr-4`}
                  onPress={() => {
                    // Use push so params and screen are updated
                    navigation.push("ProductDetails", { productId: rel.id });
                  }}
                  activeOpacity={0.93}
                >
                  <Image
                    source={{ uri: rel.images?.[0]?.image || "https://via.placeholder.com/200" }}
                    style={tw`w-full h-32 rounded-lg bg-gray-200`}
                    contentFit="cover"
                  />
                  <Text style={tw`mt-2 text-sm font-semibold text-gray-800`} numberOfLines={2}>
                    {rel.name}
                  </Text>
                  <Text style={tw`text-xs font-bold text-blue-700`}>
                    {formatCurrency(
                      rel.on_sale
                        ? rel.price - (rel.price * rel.discount_percentage) / 100
                        : rel.price,
                      regionCode,
                      language
                    )}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;
