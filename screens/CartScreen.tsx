import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { removeItem, clearAllCart, addItem } from "../redux/slices/basketSlice";
import { Image } from "expo-image";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { selectUser } from "../redux/slices/authSlice";
import { RootStackParamList } from "../navigation/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { formatCurrency, getCurrencyForCountry } from "../utils/currency";
import { Swipeable } from "react-native-gesture-handler";
import tw from "twrnc";
import { FontAwesome } from "@expo/vector-icons";
import * as Localization from "expo-localization";

// Use the CartItem type you defined and imported from your services/types
export interface CartItem {
  id: number;         // productId
  name: string;
  price: number;
  image?: string;
  size: string;
  quantity: number;
  store: number;      // storeId
}

type NavigationProp = StackNavigationProp<RootStackParamList, "Cart">;

export default function CartScreen() {
  const items: CartItem[] = useSelector((state: RootState) => state.basket.items);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const user = useSelector(selectUser);

  // Get locale, region, currency and language
  const localeObj = Localization.getLocales?.()[0];
  const language = (localeObj?.languageCode || "en").toLowerCase();
  const regionCode = localeObj?.regionCode || "ZA";
  const currencyCode = getCurrencyForCountry(regionCode);

  // Calculate total
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Simple translation util
  const t = (en: string, pt: string) => (language.startsWith("pt") ? pt : en);

  // Require login to view cart
  useFocusEffect(
    useCallback(() => {
      if (!user) {
        Alert.alert(
          t("Login Required", "Login Obrigatório"),
          t(
            "You need to log in to access your cart and complete your purchase.",
            "Você precisa fazer login para acessar seu carrinho e finalizar a compra."
          ),
          [
            {
              text: t("Login", "Entrar"),
              onPress: () => navigation.navigate("UserLogin"),
            },
            {
              text: t("Cancel", "Cancelar"),
              style: "cancel",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    }, [user, navigation, t])
  );

  // Handlers
  const handleRemove = (itemId: number, size?: string) => {
    dispatch(removeItem({ id: itemId, size: size || "" }));
  };

  // Always pass store!
  const handleQuantityChange = (item: CartItem, diff: 1 | -1) => {
    if (diff === 1) {
      dispatch(
        addItem({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          size: item.size,
          store: item.store,      // REQUIRED for your reducer!
          quantity: 1,
        })
      );
    } else if (item.quantity === 1) {
      dispatch(removeItem({ id: item.id, size: item.size || "" }));
    } else {
      dispatch(removeItem({ id: item.id, size: item.size || "" }));
    }
  };

  const confirmClearCart = () => {
    Alert.alert(
      t("Clear Cart", "Esvaziar carrinho"),
      t(
        "Are you sure you want to remove all items from your cart?",
        "Tem certeza que deseja remover todos os itens do carrinho?"
      ),
      [
        { text: t("Cancel", "Cancelar"), style: "cancel" },
        { text: t("Yes, Clear", "Sim, Esvaziar"), style: "destructive", onPress: () => dispatch(clearAllCart()) }
      ]
    );
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`pt-6 pb-36 px-3`}
        showsVerticalScrollIndicator={false}
      >
        <Text style={tw`text-3xl font-extrabold text-gray-800 mb-4`}>
          {t("Your Cart", "Seu carrinho")}
        </Text>

        {items.length === 0 && (
          <View style={tw`flex-1 items-center justify-center mt-24`}>
            <FontAwesome name="shopping-cart" size={60} color="#d1d5db" style={tw`mb-4`} />
            <Text style={tw`text-lg text-gray-400 font-semibold`}>
              {t("Your cart is empty", "Seu carrinho está vazio")}
            </Text>
            <TouchableOpacity
              style={tw`mt-6 bg-blue-600 px-8 py-3 rounded-full`}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={tw`text-white font-semibold`}>{t("Go Shopping", "Comprar agora")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {items.map((item, idx) => (
          <Swipeable
            key={`${item.id}-${item.size || ""}-${item.store}-${idx}`}
            renderRightActions={() => (
              <TouchableOpacity
                style={tw`bg-red-500 justify-center items-center w-16 h-full rounded-r-xl`}
                onPress={() => handleRemove(item.id, item.size)}
              >
                <FontAwesome name="trash" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            overshootRight={false}
            containerStyle={tw`mb-4`}
          >
            <View style={tw`bg-white rounded-2xl flex-row items-center p-4 shadow-lg`}>
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={tw`w-16 h-16 rounded-xl bg-gray-100`}
                  contentFit="cover"
                />
              ) : (
                <View style={tw`w-16 h-16 rounded-xl bg-gray-200 items-center justify-center`}>
                  <FontAwesome name="image" size={24} color="#bbb" />
                </View>
              )}
              <View style={tw`ml-4 flex-1`}>
                <Text style={tw`text-lg font-bold`} numberOfLines={2}>{item.name}</Text>
                {!!item.size && (
                  <Text style={tw`text-xs text-gray-500 mt-1`}>{t("Size", "Tamanho")}: {item.size}</Text>
                )}
                <View style={tw`flex-row items-center mt-2`}>
                  <TouchableOpacity
                    style={tw`bg-gray-200 w-8 h-8 rounded-full justify-center items-center`}
                    onPress={() => handleQuantityChange(item, -1)}
                  >
                    <Text style={tw`text-xl font-bold`}>-</Text>
                  </TouchableOpacity>
                  <Text style={tw`mx-3 text-lg font-semibold`}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={tw`bg-gray-200 w-8 h-8 rounded-full justify-center items-center`}
                    onPress={() => handleQuantityChange(item, 1)}
                  >
                    <Text style={tw`text-xl font-bold`}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={tw`items-end`}>
                <Text style={tw`text-base font-extrabold text-blue-700`}>
                  {formatCurrency(item.price * item.quantity, currencyCode, language)}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemove(item.id, item.size)}
                  style={tw`mt-2`}
                >
                  <Text style={tw`text-xs text-red-500 font-semibold`}>
                    {t("Remove", "Remover")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Swipeable>
        ))}
      </ScrollView>

      {/* Total Bar */}
      {items.length > 0 && (
        <View
          style={[
            tw`absolute bottom-0 left-0 right-0 px-6 py-5 bg-white border-t border-gray-200 shadow-2xl z-10`,
            Platform.OS === "ios" ? tw`pb-6` : {},
          ]}
        >
          <View style={tw`flex-row items-center justify-between mb-2`}>
            <Text style={tw`text-lg font-extrabold text-gray-800`}>
              {t("Total:", "Total:")}
            </Text>
            <Text style={tw`text-xl font-extrabold text-blue-700`}>
              {formatCurrency(total, currencyCode, language)}
            </Text>
          </View>
          <TouchableOpacity
            style={tw`bg-blue-600 py-4 rounded-xl mt-1`}
            onPress={() => navigation.navigate('Checkout')}
          >
            <Text style={tw`text-center text-white font-bold text-lg`}>
              {t("Proceed to Checkout", "Finalizar Compra")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmClearCart}>
            <Text style={tw`text-red-500 text-center mt-4 font-semibold`}>
              {t("Clear Cart", "Esvaziar carrinho")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
