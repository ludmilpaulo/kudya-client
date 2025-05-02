import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import tw from 'twrnc'; // ✅ Replaced tailwind-react-native-classnames
import Banner from '../components/Banner';
import { fetchAboutUsData } from '../services/information';
import { baseAPI, Restaurant } from '../services/types';

const JoinScreen = () => {
  const [headerData, setHeaderData] = useState<any | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [userLocation, setUserLocation] = useState({ latitude: -25.747868, longitude: 28.229271 }); // Default fallback location
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocationAndData = async () => {
      let fallbackLocation = { latitude: -25.747868, longitude: 28.229271 };
  
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          try {
            const location = await Location.getCurrentPositionAsync({});
            fallbackLocation = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };
          } catch (locError) {
            console.warn("Could not get GPS location, using fallback.");
          }
        } else {
          console.warn("Location permission denied, using fallback.");
        }
  
        setUserLocation(fallbackLocation);
  
        const header = await fetchAboutUsData();
        const restaurantResponse = await fetch(`${baseAPI}/customer/customer/restaurants/`)
          .then(response => response.json());
  
        const approvedRestaurants = restaurantResponse.restaurants.map((restaurant: any) => ({
          ...restaurant,
          location: parseLocation(restaurant.location),
        }));
  
        setHeaderData(header);
        setRestaurants(approvedRestaurants);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchLocationAndData();
  }, []);
  

  return (
    <View style={tw`flex-1 bg-gray-100`}>
      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : headerData && (
        <Banner
          title={headerData.title}
          backgroundImage={headerData.backgroundImage}
          backgroundApp={headerData.backgroundApp}
          bottomImage={headerData.bottomImage}
          aboutText={headerData.about}
          restaurants={restaurants}
          userLocation={userLocation}
        />
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
