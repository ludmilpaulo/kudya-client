import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { fetchRentalVehicles, RentalVehicle } from '../services/rentalsApi';
import { useTranslation } from '../hooks/useTranslation';

export default function CarRentalScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState<RentalVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentalVehicles()
      .then(setVehicles)
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <View style={tw`flex-row items-center p-4`}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="arrow-left" size={22} /></TouchableOpacity>
        <Text style={tw`text-xl font-bold ml-3`}>{t('carRental', 'Car Rental')}</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={tw`mt-16`} />
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={tw`px-4 pb-8`}
          ListEmptyComponent={<Text style={tw`text-center text-slate-500 mt-16`}>{t('noVehicles', 'No vehicles available')}</Text>}
          renderItem={({ item }) => (
            <View style={tw`bg-white rounded-2xl mb-3 p-4 border border-slate-100`}>
              {item.images?.[0]?.image ? (
                <Image source={{ uri: item.images[0].image }} style={tw`w-full h-36 rounded-xl mb-3`} />
              ) : (
                <View style={tw`w-full h-36 bg-slate-200 rounded-xl mb-3 items-center justify-center`}>
                  <FontAwesome5 name="car" size={40} color="#94A3B8" />
                </View>
              )}
              <Text style={tw`font-bold text-lg`}>{item.make} {item.model} ({item.year})</Text>
              <Text style={tw`text-slate-500 text-sm`}>{item.seats} seats · {item.transmission} · {item.fuel_type}</Text>
              <Text style={tw`text-cyan-700 font-bold mt-2`}>{item.daily_price} {item.currency}/day</Text>
              <Text style={tw`text-slate-400 text-xs`}>{t('deposit', 'Deposit')}: {item.deposit_amount} {item.currency}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
