import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TextInput, Image, TouchableOpacity, Alert } from "react-native";
import tailwind from "tailwind-react-native-classnames";
import * as Location from 'expo-location';
import RestaurantCard from "../components/RestaurantCard";
import { baseAPI, Restaurant } from "../services/types";

type Restaurants = Restaurant[];

const HomeScreen: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurants>([]);
  const [filteredDataSource, setFilteredDataSource] = useState<Restaurants>([]);
  const [masterDataSource, setMasterDataSource] = useState<Restaurants>([]);
  const [categories, setCategories] = useState<{ name: string; image: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão para acessar localização foi negada');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      let reverseGeocode = await Location.reverseGeocodeAsync(loc.coords);
      if (reverseGeocode.length > 0) {
        const { city, region } = reverseGeocode[0];
        setAddress(`${city}, ${region}`);
      }
    })();
  }, []);

  useEffect(() => {
    fetch(`${baseAPI}/customer/customer/restaurants/`)
      .then((response) => response.json())
      .then((data) => {
        const approvedRestaurants = data.restaurants.filter(
          (restaurant: Restaurant) => restaurant.is_approved
        );
        setMasterDataSource(approvedRestaurants);
        setFilteredDataSource(approvedRestaurants);
        const uniqueCategories = [...new Set(approvedRestaurants.map((restaurant) => restaurant.category.name))];
        const categoriesWithImages = uniqueCategories.map(name => ({
          name,
          image: approvedRestaurants.find(rest => rest.category.name === name)?.category.image || null
        }));
        setCategories(categoriesWithImages);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const searchFilterFunction = (text: string) => {
    if (text) {
      const newData = masterDataSource.filter((item) => {
        const itemData = item.name ? item.name.toUpperCase() : "".toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredDataSource(newData);
    } else {
      setFilteredDataSource(masterDataSource);
    }
  };

  const filterByCategory = (categoryName: string) => {
    const newData = masterDataSource.filter((item) => item.category.name === categoryName);
    setFilteredDataSource(newData);
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      0.5 - Math.cos(dLat) / 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
  };

  const calculateTime = (distance: number) => {
    const speed = 40; // average speed in km/h
    const time = distance / speed;
    return `${Math.round(time * 60)} mins`;
  };

  const nearbyRestaurants = (restaurants: Restaurants, location: { latitude: number; longitude: number }) => {
    if (!location) return [];
    return restaurants.filter((restaurant) => {
      const distance = getDistance(location.latitude, location.longitude, restaurant.latitude, restaurant.longitude);
      return distance <= 10; // filter restaurants within 10km radius
    });
  };

  const dailyOffers = masterDataSource.filter(restaurant => restaurant.barnner);
  const otherRestaurants = masterDataSource.filter(restaurant => !restaurant.barnner);

  return (
    <View style={tailwind`flex-1 bg-gray-100`}>
      <View style={tailwind`px-4 py-6`}>
        {loading ? (
          <View style={tailwind`flex-1 justify-center items-center`}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <>
            <Text style={tailwind`text-lg font-semibold mb-2`}>Sua localização: {address}</Text>
            <TextInput
              style={tailwind`p-4 mb-4 bg-white border rounded-full shadow-sm`}
              placeholder="Pesquisar Restaurantes"
              onChangeText={(text) => searchFilterFunction(text)}
            />
            <Text style={tailwind`text-xl font-semibold mb-4`}>Categorias</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tailwind`pb-4`}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={tailwind`m-2 items-center`}
                  onPress={() => filterByCategory(category.name)}
                >
                  <Image
                    source={{ uri: category.image || "https://ludmil.pythonanywhere.com/media/logo/azul.png" }}
                    style={tailwind`w-20 h-20 rounded-full`}
                  />
                  <Text style={tailwind`mt-2 text-center text-sm`}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={tailwind`text-xl font-semibold mb-4`}>Ofertas de Hoje</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tailwind`pb-4`}>
              {dailyOffers.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} location={location} />
              ))}
            </ScrollView>
            <Text style={tailwind`text-xl font-semibold mb-4 mt-4`}>Restaurantes Próximos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tailwind`pb-4`}>
              {nearbyRestaurants(filteredDataSource, location).map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} location={location} />
              ))}
            </ScrollView>
            <Text style={tailwind`text-xl font-semibold mb-4 mt-4`}>Todos os Restaurantes</Text>
            <ScrollView contentContainerStyle={tailwind`pb-4`}>
              {filteredDataSource.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} location={location} />
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
};

export default HomeScreen;
