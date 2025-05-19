import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { useAutoRefreshStoreTypes } from '../redux/hooks/useAutoRefreshStoreTypes'
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import Animated, { FadeInRight } from 'react-native-reanimated'
import tw from 'twrnc'

// ✅ new correct import
import i18n from '../configs/i18n' 


import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/navigation'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>

const getFallbackIcon = (name: string) => {
  const key = name.toLowerCase()
  if (key.includes('restaurant')) return <MaterialIcons name="restaurant" size={24} color="white" />
  if (key.includes('clothing')) return <FontAwesome5 name="tshirt" size={24} color="white" />
  if (key.includes('tech')) return <Feather name="cpu" size={24} color="white" />
  if (key.includes('pharmacy')) return <MaterialIcons name="local-pharmacy" size={24} color="white" />
  if (key.includes('supermarket')) return <Feather name="shopping-cart" size={24} color="white" />
  if (key.includes('gift')) return <Feather name="gift" size={24} color="white" />
  if (key.includes('book')) return <FontAwesome5 name="book" size={24} color="white" />
  if (key.includes('pet')) return <FontAwesome5 name="dog" size={24} color="white" />
  return <Feather name="box" size={24} color="white" />
}

export default function HomeScreen() {
  const storeTypes = useSelector((state: RootState) => state.storeTypes.data)
  const loading = useSelector((state: RootState) => state.storeTypes.loading)
  const [searchTerm, setSearchTerm] = useState('')
  const navigation = useNavigation<NavigationProp>()

  useAutoRefreshStoreTypes()

  const filteredTypes = useMemo(() => {
    return storeTypes.filter(type =>
      type.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, storeTypes])

  return (
    <LinearGradient
      colors={['#FCD34D', '#ffcc00', '#3B82F6']}
      style={tw`flex-1`}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={tw`flex-1`}>
        <View style={tw`px-6 pt-4`}>
          <Text style={tw`text-3xl font-extrabold text-white`}>
            {i18n.t('selectStore')}
          </Text>
          <Text style={tw`text-sm text-white opacity-80 mt-1`}>
            {i18n.t('browse')}
          </Text>

          <View style={tw`mt-4 flex-row items-center bg-white/90 rounded-full px-4 py-2`}>
            <Feather name="search" size={18} color="#9CA3AF" />
            <TextInput
              placeholder={i18n.t('search')}
              placeholderTextColor="#9CA3AF"
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={tw`ml-2 flex-1 text-sm text-gray-700`}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={tw`p-4 pb-32 flex-row flex-wrap justify-between`}
          showsVerticalScrollIndicator={false}
        >
          {loading && (
            <Text style={tw`text-white mt-10 text-center`}>
              {i18n.t('loading')}
            </Text>
          )}

          {!loading && filteredTypes.map((type, index) => (
            <Animated.View
              key={type.id}
              entering={FadeInRight.delay(index * 50)}
              style={tw`w-[48%] mb-4`}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  navigation.navigate('Stores', { storeTypeId: type.id })
                }
              >
                <BlurView intensity={50} tint="light" style={tw`rounded-2xl overflow-hidden`}>
                  <View style={tw`p-4 items-center justify-center`}>
                    {type.icon ? (
                      <Image
                        source={{ uri: type.icon }}
                        style={tw`w-14 h-14 rounded-xl mb-2`}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={tw`w-14 h-14 bg-blue-500 rounded-xl mb-2 items-center justify-center`}>
                        {getFallbackIcon(type.name)}
                      </View>
                    )}
                    <Text style={tw`text-base font-semibold text-center text-gray-800`}>
                      {type.name}
                    </Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}
