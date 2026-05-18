import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStoreTypes } from '../redux/slices/storeTypeSlice';
import { RootState } from '../redux/store';
import { useTranslation } from '../hooks/useTranslation';
import { RootStackParamList } from '../navigation/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function GroceryScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const storeTypes = useSelector((s: RootState) => s.storeTypes.data);

  useEffect(() => {
    dispatch(fetchStoreTypes() as never);
  }, [dispatch]);

  const groceryType = storeTypes.find(
    (st) => st.name?.toLowerCase().includes('grocery') || st.name?.toLowerCase().includes('supermarket'),
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-emerald-50`}>
      <View style={tw`flex-row items-center p-4`}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="arrow-left" size={22} /></TouchableOpacity>
        <Text style={tw`text-xl font-bold ml-3`}>{t('groceries', 'Groceries')}</Text>
      </View>
      <View style={tw`flex-1 items-center justify-center px-8`}>
        <Feather name="shopping-bag" size={48} color="#059669" />
        <Text style={tw`text-center text-slate-600 mt-4`}>
          {t('groceryDesc', 'Browse grocery stores and add products to your cart.')}
        </Text>
        <TouchableOpacity
          style={tw`bg-emerald-600 rounded-2xl px-8 py-4 mt-6`}
          onPress={() => {
            if (groceryType?.id) {
              navigation.navigate('Stores', { storeTypeId: groceryType.id });
            } else {
              navigation.navigate('Categories');
            }
          }}
        >
          <Text style={tw`text-white font-bold`}>{t('browseStores', 'Browse Stores')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
