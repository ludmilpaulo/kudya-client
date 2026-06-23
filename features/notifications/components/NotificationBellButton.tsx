import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/navigation';
import { useGetUnreadNotificationCountQuery } from '../redux/api/notificationApi';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function NotificationBellButton() {
  const navigation = useNavigation<Nav>();
  const { data } = useGetUnreadNotificationCountQuery(undefined, {
    pollingInterval: 60000,
  });
  const unread = data?.unreadCount ?? 0;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Notifications')}
      style={tw`relative p-2`}
      accessibilityLabel="Notifications"
    >
      <Feather name="bell" size={22} color="#fff" />
      {unread > 0 ? (
        <View style={tw`absolute top-0 right-0 bg-red-500 rounded-full min-w-4 min-h-4 items-center justify-center px-1`}>
          <Text style={tw`text-white text-[10px] font-bold`}>{unread > 99 ? '99+' : unread}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
