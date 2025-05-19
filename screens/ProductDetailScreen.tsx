import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { Image } from 'expo-image'
import { Heart } from 'lucide-react-native'
import tw from 'twrnc'

const ProductDetailScreen = () => {
  const route = useRoute<any>()
  const { product } = route.params

  return (
    <ScrollView style={tw`flex-1 bg-white`} contentContainerStyle={tw`pb-12`}>
      <Image
        source={{ uri: product.image_urls?.[0] || 'https://via.placeholder.com/300' }}
        style={tw`w-full h-80`}
        contentFit="cover"
      />

      <View style={tw`p-4`}>
        <View style={tw`flex-row justify-between items-center`}>
          <Text style={tw`text-2xl font-bold`}>{product.name}</Text>
          <Heart color="gray" size={24} />
        </View>

        <Text style={tw`text-lg text-gray-600 mt-2`}>R {product.price.toFixed(2)}</Text>

        <Text style={tw`mt-4 text-base text-gray-800`}>{product.description}</Text>

        <TouchableOpacity style={tw`mt-6 bg-black py-3 rounded-xl`}>
          <Text style={tw`text-center text-white font-semibold text-base`}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default ProductDetailScreen
