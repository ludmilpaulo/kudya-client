import React, { useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { useRoute, RouteProp } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/navigation'
import { fetchProductsByStore } from '../redux/slices/productsSlice'
import { RootState, AppDispatch } from '../redux/store'
import { Image } from 'expo-image'
import tw from 'twrnc'

type ProductsRouteProp = RouteProp<RootStackParamList, 'Products'>
type ProductsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Products'>

export default function ProductsScreen() {
  const route = useRoute<ProductsRouteProp>()
  const { storeId, storeName } = route.params
  const dispatch = useDispatch<AppDispatch>()

  const products = useSelector((state: RootState) => state.products.data)
  const loading = useSelector((state: RootState) => state.products.loading)
  const error = useSelector((state: RootState) => state.products.error)

  useEffect(() => {
    dispatch(fetchProductsByStore(storeId))
  }, [storeId, dispatch])

  return (
    <ScrollView style={tw`flex-1 bg-white`} contentContainerStyle={tw`px-4 py-6 pb-28`}>
      <Text style={tw`text-2xl font-bold mb-4 text-gray-800`}>
        Products from {storeName}
      </Text>

      {loading && (
        <View style={tw`items-center justify-center mt-10`}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={tw`text-gray-500 mt-3`}>Loading products...</Text>
        </View>
      )}

      {!loading && error && (
        <Text style={tw`text-red-500 text-center mt-6`}>
          Failed to load products. Please try again.
        </Text>
      )}

      {!loading && products.length === 0 && (
        <Text style={tw`text-center text-gray-500 mt-10`}>
          No products available in this store.
        </Text>
      )}

      {!loading &&
        products.map((product) => (
          <TouchableOpacity
            key={product.id}
            activeOpacity={0.8}
            style={tw`bg-gray-100 rounded-xl p-4 mb-4 shadow-sm flex-row items-center`}
          >
            <Image
              source={{ uri: product.images[0] }}
              style={tw`w-14 h-14 rounded-lg mr-4`}
              contentFit="cover"
            />
            <View style={tw`flex-1`}>
              <Text style={tw`text-lg font-semibold text-gray-800`}>
                {product.name}
              </Text>
              <Text style={tw`text-sm text-gray-500`} numberOfLines={2}>
                {product.description}
              </Text>
              <Text style={tw`text-blue-600 font-semibold mt-1`}>
                ${product.price.toFixed(2)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
    </ScrollView>
  )
}
