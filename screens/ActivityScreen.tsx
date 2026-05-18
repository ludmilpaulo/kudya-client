import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useTranslation } from '../hooks/useTranslation';
import { fetchRideHistory } from '../services/ridesApi';
import { fetchPackageHistory } from '../services/deliveriesApi';

export default function ActivityScreen() {
  const { t } = useTranslation();
  const token = useSelector((s: RootState) => s.auth.token);
  const [rides, setRides] = useState<unknown[]>([]);
  const [packages, setPackages] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetchRideHistory(token).catch(() => []),
      fetchPackageHistory(token).catch(() => []),
    ]).then(([r, p]) => {
      setRides(r);
      setPackages(p);
    }).finally(() => setLoading(false));
  }, [token]);

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <Text style={tw`text-2xl font-bold px-4 pt-4 text-slate-900`}>{t('activity', 'Activity')}</Text>
      {loading ? (
        <ActivityIndicator style={tw`mt-16`} />
      ) : !token ? (
        <Text style={tw`text-center text-slate-500 mt-16 px-6`}>{t('loginToAccessCart')}</Text>
      ) : (
        <ScrollView style={tw`px-4 pt-4`}>
          <Text style={tw`font-bold text-slate-700 mb-2`}>{t('ridesTitle', 'Rides')}</Text>
          {rides.length === 0 ? (
            <Text style={tw`text-slate-400 mb-4`}>{t('noActivity', 'No rides yet')}</Text>
          ) : (
            rides.map((ride: { id: number; ride_number: string; status: string }) => (
              <View key={ride.id} style={tw`bg-white rounded-xl p-3 mb-2 border border-slate-100`}>
                <Text style={tw`font-semibold`}>{ride.ride_number}</Text>
                <Text style={tw`text-slate-500 capitalize`}>{ride.status}</Text>
              </View>
            ))
          )}
          <Text style={tw`font-bold text-slate-700 mb-2 mt-4`}>{t('sendPackage', 'Packages')}</Text>
          {packages.length === 0 ? (
            <Text style={tw`text-slate-400`}>{t('noActivity', 'No deliveries yet')}</Text>
          ) : (
            packages.map((pkg: { id: number; delivery_number: string; status: string }) => (
              <View key={pkg.id} style={tw`bg-white rounded-xl p-3 mb-2 border border-slate-100`}>
                <Text style={tw`font-semibold`}>{pkg.delivery_number}</Text>
                <Text style={tw`text-slate-500 capitalize`}>{pkg.status}</Text>
              </View>
            ))
          )}
          <TouchableOpacity style={tw`mt-6 mb-8`}>
            <Text style={tw`text-blue-600 text-center`}>{t('viewOrders', 'View food & grocery orders in Orders tab')}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
