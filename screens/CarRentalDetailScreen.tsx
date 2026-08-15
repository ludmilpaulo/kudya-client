import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import { useSelector } from 'react-redux';
import { useAppNavigation, useAppRoute } from '../navigation/hooks';
import { RootState } from '../redux/store';
import { useTranslation } from '../hooks/useTranslation';
import { bookRental, fetchRentalVehicles, RentalVehicle } from '../services/rentalsApi';

export default function CarRentalDetailScreen() {
  const navigation = useAppNavigation();
  const route = useAppRoute<'CarRentalDetail'>();
  const { t } = useTranslation();
  const token = useSelector((s: RootState) => s.auth.token);
  const [vehicle, setVehicle] = useState<RentalVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickup, setPickup] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    fetchRentalVehicles()
      .then((rows) => setVehicle(rows.find((item) => item.id === route.params.vehicleId) ?? null))
      .catch(() => setVehicle(null))
      .finally(() => setLoading(false));
  }, [route.params.vehicleId]);

  const onBook = async () => {
    if (!token) {
      Alert.alert(t('loginRequired'), t('login'));
      return;
    }
    if (!startDate || !endDate || !pickup.trim()) {
      Alert.alert(t('error'), t('fillRequired', 'Enter dates and pickup location.'));
      return;
    }
    setSubmitting(true);
    try {
      await bookRental(token, {
        vehicle: route.params.vehicleId,
        start_date: startDate,
        end_date: endDate,
        pickup_location: pickup.trim(),
        return_location: pickup.trim(),
      });
      Alert.alert(t('success'), t('requestSubmitted', 'Rental request submitted'));
      navigation.goBack();
    } catch {
      Alert.alert(t('error'), t('bookingFailed', 'Could not complete request'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <View style={tw`flex-row items-center p-4`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} />
        </TouchableOpacity>
        <Text style={tw`text-xl font-bold ml-3`}>{t('carRental', 'Car Rental')}</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={tw`mt-16`} />
      ) : !vehicle ? (
        <Text style={tw`text-center text-slate-500 mt-16`}>{t('noVehicles', 'No vehicles available')}</Text>
      ) : (
        <ScrollView style={tw`px-4`}>
          <Text style={tw`font-bold text-lg`}>
            {vehicle.make} {vehicle.model} ({vehicle.year})
          </Text>
          <Text style={tw`text-cyan-700 font-bold mt-2`}>
            {vehicle.daily_price} {vehicle.currency}/day
          </Text>
          <TextInput
            style={tw`border rounded-xl px-4 py-3 mt-4`}
            placeholder="YYYY-MM-DD start"
            value={startDate}
            onChangeText={setStartDate}
          />
          <TextInput
            style={tw`border rounded-xl px-4 py-3 mt-3`}
            placeholder="YYYY-MM-DD end"
            value={endDate}
            onChangeText={setEndDate}
          />
          <TextInput
            style={tw`border rounded-xl px-4 py-3 mt-3`}
            placeholder={t('pickupLocation', 'Pickup location')}
            value={pickup}
            onChangeText={setPickup}
          />
          <TouchableOpacity
            style={tw`bg-cyan-700 rounded-xl py-4 items-center mt-6 mb-8`}
            onPress={onBook}
            disabled={submitting}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white font-bold`}>{t('bookVehicle', 'Request rental')}</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
