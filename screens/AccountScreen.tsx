import React, { useCallback, useEffect, useState } from 'react';
import { View, Image, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useAppNavigation } from '../navigation/hooks';

import { logoutUser, selectUser } from '../redux/slices/authSlice';
import { baseAPI } from '../services/types';
import { fetchUserDetails } from '../services/checkoutService';
import { useTranslation } from '../hooks/useTranslation';

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={tw`flex-row items-center bg-white/95 rounded-2xl px-4 py-3.5 mb-2`}
      activeOpacity={0.85}
    >
      <View style={tw`w-10 h-10 rounded-xl bg-blue-50 items-center justify-center`}>{icon}</View>
      <Text style={tw`flex-1 ml-3 text-base font-semibold text-slate-800`}>{label}</Text>
      <Feather name="chevron-right" size={20} color="#94A3B8" />
    </TouchableOpacity>
  );
}

export default function AccountScreen() {
  const { t } = useTranslation();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigation = useAppNavigation();

  const [username, setUsername] = useState('');
  const [userPhoto, setUserPhoto] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAddress, setUserAddress] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        Alert.alert(t('loginRequired'), t('loginToAccessCart'), [
          { text: t('login'), onPress: () => navigation.navigate('UserLogin') },
          { text: t('cancel'), style: 'cancel', onPress: () => navigation.goBack() },
        ]);
      }
    }, [user, navigation, t]),
  );

  useEffect(() => {
    if (!user?.user_id || !user?.token) return;
    setUsername(user.username ?? '');
    fetchUserDetails(user.user_id, user.token)
      .then((details) => {
        setUserPhone(details.phone ?? '');
        setUserAddress(details.address ?? '');
        setUserPhoto(details.avatar ?? '');
      })
      .catch(() => dispatch(logoutUser()));
  }, [user, dispatch]);

  const avatarUri = userPhoto ? `${baseAPI}${userPhoto}` : undefined;

  return (
    <LinearGradient colors={['#1D4ED8', '#2563EB', '#3B82F6']} style={tw`flex-1`}>
      <SafeAreaView style={tw`flex-1`}>
        <View style={tw`flex-row items-center justify-between px-4 pt-2`}>
          <Text style={tw`text-2xl font-bold text-white`}>{t('account', 'Account')}</Text>
          <TouchableOpacity
            onPress={() => dispatch(logoutUser())}
            style={tw`flex-row items-center bg-white/15 rounded-full px-3 py-2`}
          >
            <AntDesign name="logout" size={18} color="#FEE2E2" />
            <Text style={tw`text-red-100 ml-2 font-semibold text-sm`}>{t('logout', 'Log out')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={tw`px-4 pb-10`} showsVerticalScrollIndicator={false}>
          <View style={tw`items-center mt-6 mb-8`}>
            <View style={tw`rounded-full p-1 bg-white/30`}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={tw`w-28 h-28 rounded-full bg-slate-200`} />
              ) : (
                <View style={tw`w-28 h-28 rounded-full bg-white/20 items-center justify-center`}>
                  <Ionicons name="person" size={48} color="#fff" />
                </View>
              )}
            </View>
            <Text style={tw`mt-4 text-2xl font-bold text-white`}>{username || '—'}</Text>
            <Text style={tw`text-blue-100 mt-1`}>{t('profile', 'Profile')}</Text>
          </View>

          <Text style={tw`text-white/90 font-semibold mb-2 ml-1`}>{t('yourInfo', 'Your information')}</Text>
          <View style={tw`bg-white/10 rounded-2xl p-4 mb-6`}>
            <View style={tw`flex-row items-start mb-4`}>
              <AntDesign name="home" size={20} color="#BFDBFE" />
              <View style={tw`ml-3 flex-1`}>
                <Text style={tw`text-blue-100 text-xs uppercase tracking-wide`}>{t('addressLabel', 'Address')}</Text>
                <Text style={tw`text-white mt-1`}>{userAddress || '—'}</Text>
              </View>
            </View>
            <View style={tw`flex-row items-start`}>
              <AntDesign name="phone" size={20} color="#BFDBFE" />
              <View style={tw`ml-3 flex-1`}>
                <Text style={tw`text-blue-100 text-xs uppercase tracking-wide`}>{t('phone', 'Phone')}</Text>
                <Text style={tw`text-white mt-1`}>{userPhone || '—'}</Text>
              </View>
            </View>
          </View>

          <MenuRow
            icon={<MaterialIcons name="history" size={22} color="#2563EB" />}
            label={t('orderHistory', 'Order history')}
            onPress={() => navigation.navigate('OrderHistory')}
          />
          <MenuRow
            icon={<Ionicons name="person-circle" size={22} color="#2563EB" />}
            label={t('editProfile', 'Edit profile')}
            onPress={() => navigation.navigate('UserProfile')}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
