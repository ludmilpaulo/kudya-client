import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";

import RestaurantCard from "../components/RestaurantCard";
import { useAppSelector } from "../redux/store";
import { selectCartItems } from "../redux/slices/basketSlice";
import { Restaurant, Category, baseAPI } from "../services/types";

type RootStackParamList = {
  CartPage: undefined;
};

type Coords = {
  latitude: number;
  longitude: number;
};

const HomeScreen: React.FC = () => {
  const [filteredDataSource, setFilteredDataSource] = useState<Restaurant[]>([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [masterDataSource, setMasterDataSource] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Coords | null>(null);
  const [address, setAddress] = useState("");
  const cartItems = useAppSelector(selectCartItems);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    (async () => {
      let coords: Coords = { latitude: -25.747868, longitude: 28.229271 };
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          coords = loc.coords;
          const reverseGeocode = await Location.reverseGeocodeAsync(loc.coords);
          if (reverseGeocode.length > 0) {
            const { city, region } = reverseGeocode[0];
            setAddress(`${city}, ${region}`);
          }
        } else {
          Alert.alert("Permissão negada", "Mostrando localização padrão.");
        }
      } catch (error) {
        console.warn("Erro de localização:", error);
      } finally {
        setLocation(coords);
      }
    })();
  }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(`${baseAPI}/customer/customer/restaurants/`);
        const json = await response.json();

        const approved = (json.restaurants || []).filter(
          (r: any) => typeof r.location === "string" && r.location.includes(",") && r.is_approved
        );

        const parsedRestaurants: Restaurant[] = approved.map((r: any) => {
          const [latitude, longitude] = r.location.split(",").map(Number);
          return {
            ...r,
            location: { latitude, longitude },
          };
        });

        setMasterDataSource(parsedRestaurants);
        setFilteredDataSource(parsedRestaurants);

        const uniqueCategories = Array.from(
          new Set(parsedRestaurants.map((r) => r.category?.name).filter(Boolean))
        );

        const catList: Category[] = uniqueCategories.map((name) => {
          const match = parsedRestaurants.find((r) => r.category?.name === name);
          return {
            id: match?.category?.id || 0,
            name: name!,
            image: match?.category?.image || null,
          };
        });

        setCategories(catList);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar restaurantes:", error);
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      0.5 -
      Math.cos(dLat) / 2 +
      (Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        (1 - Math.cos(dLon))) /
        2;
    return R * 2 * Math.asin(Math.sqrt(a));
  };

  const filterNearbyRestaurants = useCallback(
    (restaurants: Restaurant[], lat: number, lng: number, radius: number) =>
      restaurants.filter((r) => getDistance(lat, lng, r.location.latitude, r.location.longitude) <= radius),
    []
  );

  useEffect(() => {
    if (location) {
      const nearby = filterNearbyRestaurants(masterDataSource, location.latitude, location.longitude, 5);
      setNearbyRestaurants(nearby);
    }
  }, [location, masterDataSource, filterNearbyRestaurants]);

  const searchFilterFunction = (text: string) => {
    if (text) {
      const newData = masterDataSource.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredDataSource(newData);
    } else {
      setFilteredDataSource(masterDataSource);
    }
  };

  const filterByCategory = (categoryName: string) => {
    const newData = masterDataSource.filter((item) => item.category?.name === categoryName);
    setFilteredDataSource(newData);
  };

  const totalItemsInCart = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <LinearGradient colors={["#FCD34D", "#3B82F6"]} style={tw`flex-1`}>
      <SafeAreaView style={tw`flex-1 pt-[${Constants.statusBarHeight}]`}>
        {loading ? (
          <View style={tw`flex-1 justify-center items-center`}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={tw`p-4`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-white text-lg font-bold`}>{address}</Text>
              <View style={tw`flex-row`}>
                <Ionicons name="notifications-outline" size={24} color="white" style={tw`mx-2`} />
                <TouchableOpacity onPress={() => navigation.navigate("CartPage")} style={tw`relative`}>
                  <Ionicons name="cart-outline" size={24} color="white" />
                  {totalItemsInCart > 0 && (
                    <View style={tw`absolute -top-2 -right-2 bg-red-600 rounded-full w-6 h-6 justify-center items-center`}>
                      <Text style={tw`text-white text-xs font-bold`}>{totalItemsInCart}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={tw`mb-4`}>
              <View style={tw`flex-row items-center bg-gray-200 p-3 rounded-full`}>
                <Ionicons name="search" size={20} color="gray" style={tw`mr-2`} />
                <TextInput
                  placeholder="Pesquisar Restaurantes"
                  placeholderTextColor="gray"
                  onChangeText={searchFilterFunction}
                  style={tw`flex-1 text-black`}
                />
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`pb-4`}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => filterByCategory(category.name)}
                  style={tw`items-center mx-2`}
                >
                  <Image
                    source={{ uri: category.image || "https://ludmil.pythonanywhere.com/media/logo/azul.png" }}
                    style={tw`w-16 h-16 rounded-full`}
                  />
                  <Text style={tw`mt-2 text-white text-sm`}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={tw`text-white text-xl font-bold mb-4`}>Ofertas de Hoje</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`pb-4`}>
              {filteredDataSource.filter((r) => r.barnner).map((restaurant) => (
                location && <RestaurantCard key={restaurant.id} restaurant={restaurant} location={location} />
              ))}
            </ScrollView>

            <Text style={tw`text-white text-xl font-bold mb-4`}>Restaurantes Próximos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`pb-4`}>
              {nearbyRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} location={location!} />
              ))}
            </ScrollView>

            <Text style={tw`text-white text-xl font-bold mb-4`}>Todos os Restaurantes</Text>
            <View>
              {filteredDataSource.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} location={location!} />
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default HomeScreen;
