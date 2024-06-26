import React, { useEffect, useState } from "react";
import Constants from "expo-constants";
import { SafeAreaView, View, Text, ScrollView, ActivityIndicator, TextInput, Image, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons'; // Import icons from expo
import tailwind from "tailwind-react-native-classnames";
import * as Location from 'expo-location';
import RestaurantCard from "../components/RestaurantCard";
import { baseAPI, Restaurant } from "../services/types";

type Category = {
  name: string;
  image: string | null;
};

const HomeScreen: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredDataSource, setFilteredDataSource] = useState<Restaurant[]>([]);
  const [masterDataSource, setMasterDataSource] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
          name: name as string,
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

  return (
    <SafeAreaView style={[styles.container]}>
      {loading ? (
        <View style={tailwind`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={tailwind`p-4`}>
          <View style={tailwind`flex-row justify-between items-center mb-4`}>
            <Text style={tailwind`text-lg font-semibold`}>{address}</Text>
            <View style={tailwind`flex-row`}>
              <Ionicons name="notifications-outline" size={24} color="black" style={tailwind`mx-2`} />
              <Ionicons name="cart-outline" size={24} color="black" style={tailwind`mx-2`} />
            </View>
          </View>
          <View style={tailwind`mb-4`}>
            <View style={tailwind`flex-row items-center bg-gray-200 p-3 rounded-full`}>
              <Ionicons name="search" size={20} color="gray" style={tailwind`mr-2`} />
              <TextInput
                style={tailwind`flex-1`}
                placeholder="Pesquisar Restaurantes"
                onChangeText={(text) => searchFilterFunction(text)}
              />
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tailwind`pb-4`}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={tailwind`items-center mx-2`}
                onPress={() => filterByCategory(category.name)}
              >
                <Image
                  source={{ uri: category.image || "https://ludmil.pythonanywhere.com/media/logo/azul.png" }}
                  style={tailwind`w-16 h-16 rounded-full`}
                />
                <Text style={tailwind`mt-2 text-center text-sm`}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={tailwind`text-xl font-semibold mb-4`}>Ofertas de Hoje</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tailwind`pb-4`}>
            {filteredDataSource.filter(restaurant => restaurant.barnner).map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} location={location} />
            ))}
          </ScrollView>
          <Text style={tailwind`text-xl font-semibold mb-4`}>Restaurantes Próximos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tailwind`pb-4`}>
            {filteredDataSource.filter(restaurant => {
              if (!location) return false;
              const [restaurantLat, restaurantLon] = restaurant.location.split(',').map(Number);
              const distance = getDistance(location.latitude, location.longitude, restaurantLat, restaurantLon);
              return distance <= 10; // filter restaurants within 10km radius
            }).map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} location={location} />
            ))}
          </ScrollView>
          <Text style={tailwind`text-xl font-semibold mb-4`}>Todos os Restaurantes</Text>
          <View>
            {filteredDataSource.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} location={location} />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
    flex: 1,
  },
  view: {
    // flex: 1
  },
});

export default HomeScreen;
