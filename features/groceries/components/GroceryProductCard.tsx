import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import * as Localization from 'expo-localization';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { addItem, removeItem, selectCartItems } from '../../../redux/slices/basketSlice';
import { selectUser } from '../../../redux/slices/authSlice';
import {
  useAddGroceryFavouriteMutation,
  useRemoveGroceryFavouriteMutation,
} from '../../../redux/api/groceriesApi';
import { formatCurrency, getCurrencyForCountry } from '../../../utils/currency';
import { useTranslation } from '../../../hooks/useTranslation';
import type { RootStackParamList } from '../../../navigation/navigation';
import type { GroceryProduct } from '../types';
import { groceryProductImage } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function GroceryProductCard({ product }: { product: GroceryProduct }) {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const cartItems = useAppSelector(selectCartItems);
  const [addFavourite] = useAddGroceryFavouriteMutation();
  const [removeFavourite] = useRemoveGroceryFavouriteMutation();
  const cartItem = cartItems.find((item) => item.id === product.id && (item.size || '') === '');
  const quantity = cartItem?.quantity ?? 0;
  const language = (Localization.getLocales?.()[0]?.languageCode || 'en').toLowerCase();
  const region = Localization.getLocales?.()[0]?.regionCode ?? undefined;
  const currency = getCurrencyForCountry(region);
  const unit = product.selling_unit || product.unit || 'item';
  const step = unit === 'kg' || unit === 'litre' ? 0.5 : 1;
  const outOfStock = product.is_purchasable === false || product.stock_quantity <= 0 || product.stock <= 0;
  const showOriginal =
    product.on_sale && product.discount_percentage > 0 && product.original_price > product.price;
  const image = groceryProductImage(product);

  async function toggleFavourite() {
    if (!user) {
      navigation.navigate('UserLogin');
      return;
    }
    if (product.is_favourite) {
      await removeFavourite(product.id);
      return;
    }
    await addFavourite(product.id);
  }

  function addToCart() {
    if (outOfStock) return;
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image,
        store: product.store,
        size: '',
        quantity: step,
        selling_unit: unit,
      }),
    );
  }

  return (
    <Pressable
      onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
      style={({ pressed }) => [
        tw`flex-1 rounded-2xl border border-[#E5E7EB] bg-white p-3`,
        { opacity: pressed ? 0.92 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={product.name}
    >
      <View style={tw`mb-3 h-36 overflow-hidden rounded-2xl bg-[#F8FAF9]`}>
        {image ? (
          <Image source={{ uri: image }} style={tw`h-full w-full`} contentFit="contain" />
        ) : (
          <View style={tw`h-full w-full items-center justify-center bg-[#EAF7EE]`}>
            <Text style={tw`text-[#0B8F45] text-xs`}>{product.name}</Text>
          </View>
        )}
        {product.on_sale && product.discount_percentage > 0 ? (
          <View style={tw`absolute left-2 top-2 rounded-full bg-[#0B8F45] px-2 py-1`}>
            <Text style={tw`text-white text-[10px] font-bold`}>-{product.discount_percentage}%</Text>
          </View>
        ) : null}
        <Pressable
          onPress={toggleFavourite}
          hitSlop={8}
          style={tw`absolute right-2 top-2 h-11 w-11 items-center justify-center rounded-full bg-white`}
          accessibilityRole="button"
          accessibilityLabel={
            product.is_favourite
              ? t('removeFromWishlist', 'Remove from favourites')
              : t('addToWishlist', 'Add to favourites')
          }
        >
          <Feather
            name="heart"
            size={18}
            color={product.is_favourite ? '#0B8F45' : '#6B7280'}
          />
        </Pressable>
      </View>
      <Text style={tw`text-sm font-semibold text-[#111827]`} numberOfLines={1}>
        {product.name}
      </Text>
      {product.unit || product.selling_unit ? <Text style={tw`mt-0.5 text-xs text-[#6B7280]`}>{product.unit || product.selling_unit}</Text> : null}
      <View style={tw`mt-2 flex-row items-baseline`}>
        {showOriginal ? (
          <Text style={tw`mr-2 text-xs text-[#6B7280] line-through`}>
            {formatCurrency(product.original_price, currency, language)}
          </Text>
        ) : null}
        <Text style={tw`text-base font-bold text-[#111827]`}>
          {product.price_display || `${formatCurrency(product.price, currency, language)}${unit !== 'item' ? ` / ${unit}` : ''}`}
        </Text>
      </View>
      {quantity > 0 ? (
        <View style={tw`mt-3 h-11 flex-row items-center justify-between rounded-xl bg-[#EAF7EE] px-2`}>
          <Pressable
            onPress={() => dispatch(removeItem({ id: product.id, size: '' }))}
            style={tw`h-11 w-11 items-center justify-center`}
            accessibilityLabel={t('decreaseQuantity', 'Decrease quantity')}
          >
            <Feather name="minus" size={16} color="#0B8F45" />
          </Pressable>
          <Text style={tw`font-bold text-[#056B34]`}>{quantity}</Text>
          <Pressable
            onPress={addToCart}
            style={tw`h-11 w-11 items-center justify-center`}
            accessibilityLabel={t('increaseQuantity', 'Increase quantity')}
          >
            <Feather name="plus" size={16} color="#0B8F45" />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={addToCart}
          disabled={outOfStock}
          style={tw`mt-3 h-11 flex-row items-center justify-center rounded-xl bg-[#0B8F45]`}
        >
          <Feather name="shopping-cart" size={16} color="#fff" />
          <Text style={tw`ml-2 font-semibold text-white`}>
            {outOfStock ? t('outOfStock', 'Out of stock') : t('add', 'Add')}
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}
