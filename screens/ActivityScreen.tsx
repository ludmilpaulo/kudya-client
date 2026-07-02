import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { RootState } from '../redux/store';
import { useTranslation } from '../hooks/useTranslation';
import { fetchRideHistory } from '../services/ridesApi';
import { fetchPackageHistory } from '../services/deliveriesApi';

function ActivityCard({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <View style={tw`bg-white rounded-2xl p-4 mb-3 border border-slate-100 flex-row items-center shadow-sm`}>
      <View style={tw`w-11 h-11 rounded-xl bg-blue-50 items-center justify-center mr-3`}>{icon}</View>
      <View style={tw`flex-1`}>
        <Text style={tw`font-semibold text-slate-900`}>{title}</Text>
        <Text style={tw`text-slate-500 capitalize mt-0.5`}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={18} color="#CBD5E1" />
    </View>
  );
}

export default function ActivityScreen() {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const token = useSelector((s: RootState) => s.auth.token);
  const [rides, setRides] = useState<Array<{ id: number; ride_number: string; status: string }>>([]);
  const [packages, setPackages] = useState<Array<{ id: number; delivery_number: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    Promise.all([fetchRideHistory(token).catch(() => []), fetchPackageHistory(token).catch(() => [])])
      .then(([r, p]) => {
        setRides(r as typeof rides);
        setPackages(p as typeof packages);
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <View style={tw`px-4 pt-4 pb-2`}>
        <Text style={tw`text-2xl font-bold text-slate-900`}>{t('activity', 'Activity')}</Text>
        <Text style={tw`text-slate-500 mt-1`}>{t('activitySubtitle', 'Rides, deliveries & orders')}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={tw`mt-16`} color="#2563EB" />
      ) : !token ? (
        <Text style={tw`text-center text-slate-500 mt-16 px-6`}>{t('loginToAccessCart')}</Text>
      ) : (
        <ScrollView style={tw`px-4 pt-2`} showsVerticalScrollIndicator={false}>
          <Text style={tw`font-bold text-slate-700 mb-3`}>{t('ridesSection', 'Rides')}</Text>
          {rides.length === 0 ? (
            <Text style={tw`text-slate-400 mb-6`}>{t('noRidesYet', 'No rides yet')}</Text>
          ) : (
            rides.map((ride) => (
              <ActivityCard
                key={ride.id}
                title={ride.ride_number}
                subtitle={t(`ride.status.${ride.status}`, ride.status.replace(/_/g, ' '))}
                icon={<Feather name="navigation" size={20} color="#2563EB" />}
              />
            ))
          )}

          <Text style={tw`font-bold text-slate-700 mb-3 mt-2`}>{t('packagesTitle', 'Packages')}</Text>
          {packages.length === 0 ? (
            <Text style={tw`text-slate-400 mb-4`}>{t('noPackagesYet', 'No deliveries yet')}</Text>
          ) : (
            packages.map((pkg) => (
              <ActivityCard
                key={pkg.id}
                title={pkg.delivery_number}
                subtitle={pkg.status}
                icon={<MaterialCommunityIcons name="package-variant" size={22} color="#2563EB" />}
              />
            ))
          )}

          <TouchableOpacity
            style={tw`mt-4 mb-8 bg-blue-50 rounded-2xl py-4 px-4 border border-blue-100`}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <Text style={tw`text-blue-700 text-center font-semibold`}>{t('viewOrders')}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
