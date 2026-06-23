import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '../redux/api/notificationApi';
import { useTranslation } from '../hooks/useTranslation';

function formatWhen(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { data: notifications = [], isLoading, isError, refetch, isFetching } =
    useGetNotificationsQuery({ limit: 100 });
  const { data: unreadData } = useGetUnreadNotificationCountQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const unread = unreadData?.unreadCount ?? 0;

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <View style={tw`flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-100`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2`}>
          <Feather name="arrow-left" size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={tw`text-lg font-bold text-slate-900`}>
          {t('notifications.title', 'Notifications')}
        </Text>
        <TouchableOpacity onPress={() => markAllRead()} style={tw`px-2 py-1`}>
          <Text style={tw`text-sky-700 font-semibold text-sm`}>
            {t('markAllRead', 'Mark all read')}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={tw`px-4 py-2 text-sm text-slate-500`}>
        {unread} {t('unreadCount', 'unread')}
      </Text>

      {isLoading ? (
        <ActivityIndicator style={tw`mt-10`} size="large" color="#2563eb" />
      ) : isError ? (
        <View style={tw`p-6`}>
          <Text style={tw`text-red-600 text-center`}>
            {t('notificationsLoadError', 'Could not load notifications.')}
          </Text>
          <TouchableOpacity onPress={() => refetch()} style={tw`mt-4 self-center bg-sky-600 px-4 py-2 rounded-xl`}>
            <Text style={tw`text-white font-semibold`}>{t('common.retry', 'Retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={tw`px-4 pb-8`}
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />
          }
        >
          {notifications.length === 0 ? (
            <Text style={tw`text-center text-slate-500 mt-10`}>
              {t('noNotifications', 'You have no notifications yet.')}
            </Text>
          ) : (
            notifications.map((item) => (
              <View
                key={item.id}
                style={tw`mb-3 rounded-2xl border p-4 ${
                  item.isRead ? 'bg-white border-slate-100' : 'bg-sky-50 border-sky-100'
                }`}
              >
                <Text style={tw`font-bold text-slate-900`}>{item.title}</Text>
                <Text style={tw`text-slate-600 mt-1`}>{item.message}</Text>
                <Text style={tw`text-xs text-slate-400 mt-2`}>{formatWhen(item.createdAt)}</Text>
                {!item.isRead ? (
                  <TouchableOpacity onPress={() => markRead(item.id)} style={tw`mt-3`}>
                    <Text style={tw`text-sky-700 font-semibold text-sm`}>
                      {t('markRead', 'Mark read')}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
