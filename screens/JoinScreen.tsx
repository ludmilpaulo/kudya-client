import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import tw from 'twrnc';
import Banner from '../components/Banner';
import { fetchAboutUsData } from '../services/information';
import { AboutUsData, baseAPI, store } from '../services/types';

type ApiStoreRow = Omit<store, 'location'> & { location: string };

const JoinScreen = () => {
  const [headerData, setHeaderData] = useState<AboutUsData | null>(null);
  const [stores, setstores] = useState<store[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocationAndData = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        let coords: { latitude: number; longitude: number } | null = null;
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setUserLocation(coords);
        } else {
          setUserLocation(null);
        }

        const header = await fetchAboutUsData();
        const params = new URLSearchParams();
        if (coords) {
          params.set('latitude', String(coords.latitude));
          params.set('longitude', String(coords.longitude));
          params.set('radius', '25');
        }
        params.set('page_size', '24');
        const storeResponse = await fetch(`${baseAPI}/customer/customer/stores/?${params.toString()}`).then(
          (response) => response.json(),
        );

        const approvedstores = ((storeResponse.stores || []) as ApiStoreRow[]).map((storeRow) => ({
          ...storeRow,
          location: parseLocation(storeRow.location),
        }));

        setHeaderData(header);
        setstores(approvedstores);
      } catch {
        setHeaderData(null);
        setstores([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchLocationAndData();
  }, []);

  return (
    <View style={tw`flex-1 bg-gray-100`}>
      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : headerData ? (
        <Banner
          title={headerData.title}
          backgroundImage={headerData.backgroundImage}
          backgroundApp={headerData.backgroundApp}
          bottomImage={headerData.bottomImage}
          aboutText={headerData.about}
          stores={stores}
          userLocation={userLocation}
        />
      ) : (
        <Text style={tw`text-center mt-16 text-slate-500`}>Unable to load</Text>
      )}
    </View>
  );
};

function parseLocation(locationString: string): { latitude: number; longitude: number } {
  if (!locationString) {
    return { latitude: 0, longitude: 0 };
  }
  const [latitude, longitude] = locationString.split(',').map(Number);
  return { latitude, longitude };
}

export default JoinScreen;
