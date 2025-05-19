import React, { useEffect } from 'react'
import {
  View, Text, ScrollView, ActivityIndicator, TouchableOpacity,
} from 'react-native'
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStoresByType } from '../redux/slices/storesSlice'
import { RootState, AppDispatch } from '../redux/store'
import { Image } from 'expo-image'
import tw from 'twrnc'
import { RootStackParamList } from '../navigation/navigation'

type StoresRouteProp = RouteProp<RootStackParamList, 'Stores'>
type StoresNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Stores'>

export default function StoresScreen() {
  const route = useRoute<StoresRouteProp>()
  const navigation = useNavigation<StoresNavigationProp>()
  const { storeTypeId } = route.params
  const dispatch = useDispatch<AppDispatch>()

  const stores = useSelector((state: RootState) => state.stores.data)
  const loading = useSelector((state: RootState) => state.stores.loading)
  const error = useSelector((state: RootState) => state.stores.error)

  useEffect(() => {
    dispatch(fetchStoresByType(storeTypeId))
  }, [storeTypeId, dispatch])

  return (
    <ScrollView style={tw`flex-1 bg-white px-4 py-6`}>
      <Text style={tw`text-2xl font-bold mb-4`}>Browse Stores</Text>

      {loading && (
        <View style={tw`items-center justify-center`}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}

      {!loading && error && (
        <Text style={tw`text-center text-red-500`}>{error}</Text>
      )}

      {!loading && !error && stores.length === 0 && (
        <Text style={tw`text-center text-gray-500`}>No stores available.</Text>
      )}

      {!loading && stores.map((store) => (
        <TouchableOpacity
          key={store.id}
          style={tw`flex-row items-center bg-gray-100 mb-4 rounded-lg p-3`}
          onPress={() => navigation.navigate('Products', {
            storeId: store.id,
            storeName: store.name,
          })}
        >
          <Image source={{ uri: store.logo }} style={tw`w-14 h-14 rounded-md`} contentFit="cover" />
          <View style={tw`ml-3`}>
            <Text style={tw`text-lg font-semibold`}>{store.name}</Text>
            <Text style={tw`text-sm text-gray-500`}>{store.address}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}
