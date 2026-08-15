import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import * as Location from 'expo-location';
import { RootState } from '../redux/store';
import { useTranslation } from '../hooks/useTranslation';
import { geocodeAddress } from '../utils/getCoordsFromLocationOrAddress';
import { estimatePackage, requestPackage } from '../services/deliveriesApi';
import PaymentDetails from '../components/PaymentDetails';
import { followUpPayment } from '../utils/followUpPayment';
import * as DocumentPicker from 'expo-document-picker';
import type { LocalProofFile } from '../services/paymentService';

const PACKAGE_TYPES = ['envelope', 'small', 'medium', 'large', 'fragile', 'document'] as const;

type Coords = {
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
};

export default function SendPackageScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const token = useSelector((s: RootState) => s.auth.token);
  const [packageType, setPackageType] = useState<(typeof PACKAGE_TYPES)[number]>('small');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [proofName, setProofName] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<LocalProofFile | null>(null);

  const useCurrentLocationAsPickup = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('error'),
          t(
            'locationPermissionDenied',
            'Location permission is required to set pickup from your current position.',
          ),
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;
      setCoords((prev) => ({
        pickup_lat: latitude,
        pickup_lng: longitude,
        dropoff_lat: prev?.dropoff_lat ?? latitude,
        dropoff_lng: prev?.dropoff_lng ?? longitude,
      }));
      if (!pickupAddress.trim()) {
        setPickupAddress(t('currentLocation', 'Current location'));
      }
    } catch {
      Alert.alert(t('error'), t('locationUnavailable', 'Could not read your location.'));
    } finally {
      setLocating(false);
    }
  };

  const parseManualDropoff = async (): Promise<Coords | null> => {
    if (!pickupAddress.trim() || !dropoffAddress.trim()) {
      Alert.alert(t('error'), t('enterAddresses', 'Enter pickup and drop-off addresses.'));
      return null;
    }
    const pickupHit = coords
      ? { lat: coords.pickup_lat, lng: coords.pickup_lng }
      : await geocodeAddress(pickupAddress.trim());
    const dropoffHit = await geocodeAddress(dropoffAddress.trim());
    if (!pickupHit || !dropoffHit) {
      Alert.alert(
        t('error'),
        t('geocodeFailed', 'Could not find those addresses. Enter a more specific pickup and drop-off.'),
      );
      return null;
    }
    if (pickupHit.lat === dropoffHit.lat && pickupHit.lng === dropoffHit.lng) {
      Alert.alert(t('error'), t('distinctDropoffRequired', 'Pickup and drop-off must be different locations.'));
      return null;
    }
    const next = {
      pickup_lat: pickupHit.lat,
      pickup_lng: pickupHit.lng,
      dropoff_lat: dropoffHit.lat,
      dropoff_lng: dropoffHit.lng,
    };
    setCoords(next);
    return next;
  };

  const onEstimate = async () => {
    const active = await parseManualDropoff();
    if (!active) return;
    setLoading(true);
    try {
      const r = await estimatePackage({
        ...active,
        package_type: packageType,
        urgency: 'standard',
      });
      setPrice(r.estimated_price);
    } catch {
      Alert.alert(t('error'), t('packageBookingFailed'));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    if (!token) {
      Alert.alert(t('loginRequired'), t('login'));
      return;
    }
    const active = await parseManualDropoff();
    if (!active) return;
    if (!recipientName.trim() || !recipientPhone.trim()) {
      Alert.alert(t('error'), t('recipientRequired', 'Recipient name and phone are required.'));
      return;
    }
    setLoading(true);
    try {
      const parcel = await requestPackage(token, {
        package_type: packageType,
        urgency: 'standard',
        pickup_address: pickupAddress.trim(),
        dropoff_address: dropoffAddress.trim(),
        ...active,
        recipient_name: recipientName.trim(),
        recipient_phone: recipientPhone.trim(),
      });
      await followUpPayment({
        token,
        amount: parcel.price || price || 0,
        method: paymentMethod,
        phone: paymentPhone,
        proof: proofFile,
        serviceType: 'package',
        objectId: parcel.id,
        currency: parcel.currency,
      });
      Alert.alert(t('success'), t('packageRequested', 'Courier request sent'));
      navigation.goBack();
    } catch {
      Alert.alert(t('error'), t('packageBookingFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <View style={tw`flex-row items-center p-4 border-b border-slate-100`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} />
        </TouchableOpacity>
        <Text style={tw`text-xl font-bold ml-3`}>{t('sendPackage', 'Send Package')}</Text>
      </View>
      <ScrollView style={tw`p-4`} keyboardShouldPersistTaps="handled">
        <Text style={tw`font-semibold mb-2`}>{t('packageSize', 'Package size')}</Text>
        <View style={tw`flex-row flex-wrap mb-4`}>
          {PACKAGE_TYPES.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPackageType(p)}
              style={tw`mr-2 mb-2 px-3 py-2 rounded-lg ${packageType === p ? 'bg-violet-600' : 'bg-slate-100'}`}
            >
              <Text style={tw`${packageType === p ? 'text-white' : 'text-slate-700'} capitalize text-sm`}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={tw`bg-slate-100 rounded-xl py-3 px-4 mb-3 flex-row items-center`}
          onPress={useCurrentLocationAsPickup}
          disabled={locating}
        >
          {locating ? (
            <ActivityIndicator />
          ) : (
            <Feather name="map-pin" size={18} color="#7C3AED" />
          )}
          <Text style={tw`ml-2 text-violet-700 font-semibold`}>
            {t('useCurrentLocationPickup', 'Use current location for pickup')}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={tw`border rounded-xl px-4 py-3 mb-3`}
          placeholder={t('pickupAddress', 'Pickup address')}
          value={pickupAddress}
          onChangeText={setPickupAddress}
        />
        <TextInput
          style={tw`border rounded-xl px-4 py-3 mb-3`}
          placeholder={t('dropoffAddress', 'Drop-off address')}
          value={dropoffAddress}
          onChangeText={setDropoffAddress}
        />
        <TextInput
          style={tw`border rounded-xl px-4 py-3 mb-3`}
          placeholder={t('recipientName', 'Recipient name')}
          value={recipientName}
          onChangeText={setRecipientName}
        />
        <TextInput
          style={tw`border rounded-xl px-4 py-3 mb-4`}
          placeholder={t('recipientPhone', 'Recipient phone')}
          value={recipientPhone}
          onChangeText={setRecipientPhone}
          keyboardType="phone-pad"
        />
        {price && (
          <Text style={tw`text-lg font-bold text-violet-700 mb-4`}>
            {t('estimatedPrice', 'Estimated')}: {price}
          </Text>
        )}
        <PaymentDetails
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          phone={paymentPhone}
          setPhone={setPaymentPhone}
          proofName={proofName}
          onPickProof={() => {
            void (async () => {
              const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
                copyToCacheDirectory: true,
              });
              if (result.canceled || !result.assets?.[0]) return;
              const asset = result.assets[0];
              setProofName(asset.name);
              setProofFile({
                uri: asset.uri,
                name: asset.name,
                type: asset.mimeType || 'image/jpeg',
              });
            })();
          }}
        />
        <TouchableOpacity
          style={tw`bg-slate-200 rounded-xl py-3 items-center mb-2`}
          onPress={onEstimate}
          disabled={loading}
        >
          <Text>{t('seePrice', 'See price')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`bg-violet-600 rounded-xl py-4 items-center`}
          onPress={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={tw`text-white font-bold`}>{t('requestCourier', 'Request Courier')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
