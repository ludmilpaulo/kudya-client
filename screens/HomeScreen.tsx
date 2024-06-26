import React, { useEffect, useState } from "react";
import Constants from "expo-constants";
import { SafeAreaView, View, Text, ScrollView, ActivityIndicator, TextInput, Image, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import RestaurantCard from "../components/RestaurantCard";
import { baseAPI, Restaurant } from "../services/types";
import { LinearGradient } from 'expo-linear-gradient';

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
        const uniqueCategories = Array.from(new Set(approvedRestaurants.map((restaurant) => restaurant.category?.name))).filter(Boolean);
        const categoriesWithImages = uniqueCategories.map(name => ({
          name: name as string,
          image: approvedRestaurants.find(rest => rest.category?.name === name)?.category?.image || null
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
    const newData = masterDataSource.filter((item) => item.category?.name === categoryName);
    setFilteredDataSource(newData);
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      0.5 - Math.cos(dLat) / 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
  };

  return (
    <LinearGradient
      colors={['#FCD34D', '#3B82F6']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.headerContainer}>
              <Text style={styles.addressText}>{address}</Text>
              <View style={styles.iconContainer}>
                <Ionicons name="notifications-outline" size={24} color="white" style={styles.icon} />
                <Ionicons name="cart-outline" size={24} color="white" style={styles.icon} />
              </View>
            </View>
            <View style={styles.searchContainer}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Pesquisar Restaurantes"
                  placeholderTextColor="gray"
                  onChangeText={(text) => searchFilterFunction(text)}
                />
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollView}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.categoryButton}
                  onPress={() => filterByCategory(category.name)}
                >
                  <Image
                    source={{ uri: category.image || "https://ludmil.pythonanywhere.com/media/logo/azul.png" }}
                    style={styles.categoryImage}
                  />
                  <Text style={styles.categoryText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.sectionTitle}>Ofertas de Hoje</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.restaurantScrollView}>
              {filteredDataSource.filter(restaurant => restaurant.barnner).map((restaurant) => (
                location && <RestaurantCard key={restaurant.id} restaurant={restaurant} location={location} />
              ))}
            </ScrollView>
            <Text style={styles.sectionTitle}>Restaurantes Próximos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.restaurantScrollView}>
              {filteredDataSource.filter(restaurant => {
                if (!location) return false;
                const [restaurantLat, restaurantLon] = restaurant.location.split(',').map(Number);
                const distance = getDistance(location.latitude, location.longitude, restaurantLat, restaurantLon);
                return distance <= 10;
              }).map((restaurant) => (
                location && <RestaurantCard key={restaurant.id} restaurant={restaurant} location={location} />
              ))}
            </ScrollView>
            <Text style={styles.sectionTitle}>Todos os Restaurantes</Text>
            <View>
              {filteredDataSource.map((restaurant) => (
                location && <RestaurantCard key={restaurant.id} restaurant={restaurant} location={location} />
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  iconContainer: {
    flexDirection: 'row',
  },
  icon: {
    marginHorizontal: 8,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    padding: 12,
    borderRadius: 9999,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#000',
  },
  categoryScrollView: {
    paddingBottom: 16,
  },
  categoryButton: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  categoryImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  categoryText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    color: '#FFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#FFF',
  },
  restaurantScrollView: {
    paddingBottom: 16,
  },
});

export default HomeScreen;
