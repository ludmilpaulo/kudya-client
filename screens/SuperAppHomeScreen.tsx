import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/navigation';
import { fetchHomeModules, PlatformModule, resolveMobileModuleScreen, FALLBACK_HOME_MODULES } from '../services/platformApi';
import { useTranslation } from '../hooks/useTranslation';
import NotificationBellButton from '../features/notifications/components/NotificationBellButton';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const ICON_MAP: Record<string, React.ReactNode> = {
  utensils: <Feather name="coffee" size={26} color="#fff" />,
  'shopping-basket': <Feather name="shopping-bag" size={26} color="#fff" />,
  car: <Feather name="navigation" size={26} color="#fff" />,
  package: <Feather name="package" size={26} color="#fff" />,
  'car-side': <FontAwesome5 name="car" size={24} color="#fff" />,
  stethoscope: <FontAwesome5 name="user-md" size={24} color="#fff" />,
  briefcase: <Feather name="briefcase" size={26} color="#fff" />,
  bed: <MaterialCommunityIcons name="bed-king-outline" size={28} color="#fff" />,
  home: <Feather name="home" size={26} color="#fff" />,
  wallet: <Feather name="credit-card" size={26} color="#fff" />,
  building: <Feather name="briefcase" size={26} color="#fff" />,
};

function ModuleIcon({ name }: { name: string }) {
  return <View>{ICON_MAP[name] ?? <Feather name="grid" size={26} color="#fff" />}</View>;
}

export default function SuperAppHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { t, languageCode } = useTranslation();
  const [modules, setModules] = useState<PlatformModule[]>(() =>
    FALLBACK_HOME_MODULES.filter((m) => m.isActive && m.availableOnMobile !== false),
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await fetchHomeModules(languageCode, 'mobile');
      setModules(data);
      setUsingFallback(false);
    } catch {
      setModules(FALLBACK_HOME_MODULES.filter((m) => m.isActive && m.availableOnMobile !== false));
      setUsingFallback(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [languageCode]);

  useEffect(() => {
    load();
  }, [load]);

  const onModulePress = (mod: PlatformModule) => {
    if (mod.key === 'food') {
      navigation.navigate('Stores', { vertical: 'food' });
      return;
    }
    if (mod.key === 'groceries') {
      navigation.navigate('Grocery');
      return;
    }
    const route = resolveMobileModuleScreen(mod.route, mod.key);
    navigation.navigate(route);
  };

  const searchLower = search.toLowerCase();
  const filtered = modules.filter((m) => {
    const name = (m.name || '').toLowerCase();
    const description = (m.description || '').toLowerCase();
    return name.includes(searchLower) || description.includes(searchLower);
  });

  return (
    <LinearGradient colors={['#0F172A', '#1E3A5F', '#2563EB']} style={tw`flex-1`}>
      <SafeAreaView style={tw`flex-1`}>
        <View style={tw`px-5 pt-2 pb-4`}>
          <View style={tw`flex-row items-start justify-between`}>
            <View style={tw`flex-1 pr-3`}>
              <Text style={tw`text-xs text-blue-200 tracking-widest uppercase`}>Kudya</Text>
              <Text style={tw`text-3xl font-bold text-white mt-1`}>
                {t('homeGreeting', 'What do you need today?')}
              </Text>
              <Text style={tw`text-sm text-blue-100 mt-1 opacity-80`}>
                {t('appTagline', 'Your life, one app')}
              </Text>
            </View>
            <NotificationBellButton />
          </View>
          <View style={tw`mt-4 flex-row items-center bg-white/10 rounded-2xl px-4 py-3 border border-white/20`}>
            <Feather name="search" size={18} color="#93C5FD" />
            <TextInput
              placeholder={t('search')}
              placeholderTextColor="#93C5FD"
              value={search}
              onChangeText={setSearch}
              style={tw`ml-3 flex-1 text-white text-base`}
            />
          </View>
        </View>

        {loading && modules.length === 0 ? (
          <ActivityIndicator size="large" color="#fff" style={tw`mt-20`} />
        ) : (
          <ScrollView
            contentContainerStyle={tw`px-4 pb-28`}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#fff" />
            }
            showsVerticalScrollIndicator={false}
          >
            {usingFallback ? (
              <Text style={tw`text-blue-100 text-xs text-center mb-3 opacity-80`}>
                {t('offlineModulesHint', 'Showing default services. Pull to refresh when online.')}
              </Text>
            ) : null}
            <View style={tw`flex-row flex-wrap justify-between`}>
              {filtered.map((mod, index) => {
                const gradientStart = mod.gradient?.[0] || mod.color || '#3B82F6';
                const gradientEnd = mod.gradient?.[1] || mod.color || '#1D4ED8';
                return (
                <Animated.View
                  key={mod.id}
                  entering={FadeInDown.delay(index * 40).springify()}
                  style={tw`w-[48%] mb-4`}
                >
                  <TouchableOpacity activeOpacity={0.85} onPress={() => onModulePress(mod)}>
                    <LinearGradient
                      colors={[gradientStart, gradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={tw`rounded-2xl p-4 min-h-[120px] justify-between shadow-lg`}
                    >
                      <ModuleIcon name={mod.icon} />
                      <View>
                        <Text style={tw`text-white font-bold text-base`}>{mod.name}</Text>
                        <Text style={tw`text-white/80 text-xs mt-0.5`}>{mod.description}</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              );})}
            </View>
            {filtered.length === 0 && (
              <Text style={tw`text-white text-center mt-10`}>{t('noStores')}</Text>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
