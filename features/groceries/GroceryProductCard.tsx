import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList } from '../../navigation/navigation';
import { AppDispatch, RootState } from '../../redux/store';
import { addItem, removeItem, selectCartItems } from '../../redux/slices/basketSlice';
import { selectUser } from '../../redux/slices/authSlice';
import { useToggleGroceryFavoriteMutation } from '../../redux/api/groceryApi';
import { formatCurrency, getCurrencyForCountry } from '../../utils/currency';
import { useTranslation } from '../../hooks/useTranslation';
import { sellingUnitTranslationKey } from '../../utils/groceryUnits';
import type { GroceryProduct } from './types';
import { GROCERY_THEME } from './theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  product: GroceryProduct;
  regionCode: string;
  width?: number;
};

export default function GroceryProductCard({ product, regionCode, width }: Props) {
  const { t, languageCode } = useTranslation();
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const cartItems = useSelector(selectCartItems);
  const [toggleFavorite] = useToggleGroceryFavoriteMutation();
  const quantity = cartItems.find((item) => item.id === product.id)?.quantity ?? 0;
  const currency = getCurrencyForCountry(regionCode);
  const salePrice = product.sale_price || product.price;
  const showOriginal = product.on_sale && product.discount_percentage > 0 && product.price > salePrice;
  const src = product.image || product.images[0] || null;
  const outOfStock = product.stock <= 0;

  function add() {
    if (outOfStock) return;
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        price: salePrice,
        image: src || '',
        store: product.store,
        size: '',
        quantity: product.allows_fractional ? 0.5 : 1,
        selling_unit: product.selling_unit,
        allows_fractional: product.allows_fractional,
      }),
    );
  }

  return (
    <Pressable
      onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
      style={{
        width,
        flex: width ? undefined : 1,
        backgroundColor: GROCERY_THEME.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: GROCERY_THEME.border,
        padding: 10,
      }}
    >
      <View style={{ backgroundColor: GROCERY_THEME.background, borderRadius: 12, aspectRatio: 1, marginBottom: 8 }}>
        {src ? (
          <Image source={{ uri: src }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: GROCERY_THEME.primary }}>{product.name.slice(0, 1)}</Text>
          </View>
        )}
        {product.on_sale && product.discount_percentage > 0 ? (
          <View
            style={{
              position: 'absolute',
              left: 8,
              top: 8,
              backgroundColor: GROCERY_THEME.primary,
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>-{product.discount_percentage}%</Text>
          </View>
        ) : null}
        <Pressable
          onPress={() => {
            if (!user) {
              navigation.navigate('UserLogin');
              return;
            }
            void toggleFavorite(product.id);
          }}
          hitSlop={8}
          style={{
            position: 'absolute',
            right: 8,
            top: 8,
            height: 32,
            width: 32,
            borderRadius: 16,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel={product.is_favorited ? t('removeFromWishlist') : t('addToWishlist')}
        >
          <Feather
            name="heart"
            size={16}
            color={product.is_favorited ? GROCERY_THEME.primary : GROCERY_THEME.muted}
          />
        </Pressable>
      </View>
      <Text numberOfLines={2} style={{ fontSize: 13, fontWeight: '700', color: GROCERY_THEME.text, minHeight: 34 }}>
        {product.name}
      </Text>
      {product.unit ? (
        <Text style={{ fontSize: 11, color: GROCERY_THEME.muted, marginTop: 2 }}>{product.unit}</Text>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: GROCERY_THEME.text }}>
          {formatCurrency(salePrice, currency, languageCode)}
          {` / ${t(sellingUnitTranslationKey(product.selling_unit, 'grocery'))}`}
        </Text>
        {showOriginal ? (
          <Text style={{ fontSize: 11, color: GROCERY_THEME.muted, textDecorationLine: 'line-through' }}>
            {formatCurrency(product.price, currency, languageCode)}
          </Text>
        ) : null}
      </View>
      {quantity > 0 ? (
        <View
          style={{
            marginTop: 10,
            height: 40,
            borderRadius: 999,
            backgroundColor: GROCERY_THEME.light,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 4,
          }}
        >
          <Pressable onPress={() => dispatch(removeItem({ id: product.id, size: '' }))} style={{ height: 32, width: 32, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="minus" size={16} color={GROCERY_THEME.dark} />
          </Pressable>
          <Text style={{ fontWeight: '800', color: GROCERY_THEME.dark }}>{quantity}</Text>
          <Pressable
            onPress={add}
            style={{
              height: 32,
              width: 32,
              borderRadius: 16,
              backgroundColor: GROCERY_THEME.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name="plus" size={16} color="#fff" />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={add}
          disabled={outOfStock}
          style={{
            marginTop: 10,
            height: 40,
            borderRadius: 999,
            backgroundColor: outOfStock ? '#D1D5DB' : GROCERY_THEME.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Feather name="shopping-cart" size={14} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
            {outOfStock ? t('groceryOutOfStock') : t('groceryAdd')}
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}
