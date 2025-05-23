// components/StoreCard.tsx
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import tw from 'twrnc';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { formatDistance } from '../utils/distance';
import type { Store } from '../services/types';

interface StoreCardProps {
  store: Store & { distance?: number | null };
  onPress: () => void;
  index: number;
  cardWidth: number;
}

const StoreCard: React.FC<StoreCardProps> = ({ store, onPress, index, cardWidth }) => (
  <Animated.View
    entering={FadeInRight.delay(index * 60)}
    style={[tw`mb-4`, { width: cardWidth }]}
  >
    <TouchableOpacity
      activeOpacity={0.9}
      style={tw`rounded-2xl overflow-hidden`}
      onPress={onPress}
    >
      <BlurView intensity={60} tint="light" style={tw`rounded-2xl`}>
        <View style={tw`p-3 items-center`}>
          <Image
            source={store.logo ? { uri: store.logo } : undefined}
            style={tw`w-20 h-20 rounded-xl mb-2 bg-gray-200`}
            contentFit="cover"
          />
          <Text style={tw`text-lg font-semibold text-gray-800 text-center`} numberOfLines={2}>
            {store.name}
          </Text>
          <Text style={tw`text-xs text-gray-500 text-center mt-1`} numberOfLines={2}>
            {store.address}
          </Text>
          {typeof store.distance === 'number' && (
            <View style={tw`mt-2 rounded-full bg-blue-100 px-3 py-1`}>
              <Text style={tw`text-blue-600 text-xs font-bold`}>
                {formatDistance(store.distance)} away
              </Text>
            </View>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  </Animated.View>
);

export default StoreCard;
