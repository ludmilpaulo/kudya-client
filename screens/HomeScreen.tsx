import React, { useEffect, useState, useCallback } from "react";
import Constants from "expo-constants";
import { SafeAreaView, View, Text, ScrollView, ActivityIndicator, TextInput, Image, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import RestaurantCard from "../components/RestaurantCard";
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector } from "../redux/store";
import { selectCartItems } from "../redux/slices/basketSlice";
import { Restaurant, Category, baseAPI } from "../services/types";

const HomeScreen: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredDataSource, setFilteredDataSource] = useState<Restaurant[]>([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [masterDataSource, setMasterDataSource] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState("");
  const cartItems = useAppSelector(selectCartItems);
  const navigation = useNavigation<any>();

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
        const approvedRestaurants = data.restaurants.map((restaurant: any) => {
          const [latitude, longitude] = restaurant.location.split(',').map(Number);
          return {
            ...restaurant,
            location: {
              latitude,
              longitude
            }
          };
        }).filter((restaurant: Restaurant) => restaurant.is_approved);
        
        setMasterDataSource(approvedRestaurants);

        const uniqueCategories = Array.from(
          new Set(approvedRestaurants.map((restaurant: Restaurant) => restaurant.category?.name))
        ).filter(Boolean);
        
        const categoriesWithImages = uniqueCategories.map((name) => {
          const foundRestaurant = approvedRestaurants.find((rest: Restaurant) => rest.category?.name === name);
          return {
            id: foundRestaurant?.category.id || 0,
            name: name as string,
            image: foundRestaurant?.category.image || null,
          };
        });

        setCategories(categoriesWithImages);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  const filterNearbyRestaurants = useCallback((restaurants: Restaurant[], userLat: number, userLng: number, radius: number) => {
    return restaurants.filter((restaurant) => {
      const distance = getDistance(userLat, userLng, restaurant.location.latitude, restaurant.location.longitude);
      return distance <= radius;
    });
  }, []);

  useEffect(() => {
    if (location) {
      const nearby = filterNearbyRestaurants(masterDataSource, location.latitude, location.longitude, 5);
      const withinArea = filterNearbyRestaurants(masterDataSource, location.latitude, location.longitude, 3.47);
      setNearbyRestaurants(nearby);
      setFilteredDataSource(withinArea);
    }
  }, [location, masterDataSource, filterNearbyRestaurants]);

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
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon1 - lon2) * Math.PI) / 180;
    const a =
      0.5 -
      Math.cos(dLat) / 2 +
      (Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        (1 - Math.cos(dLon))) /
        2;
    return R * 2 * Math.asin(Math.sqrt(a));
  };

  const totalItemsInCart = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <LinearGradient colors={['#FCD34D', '#3B82F6']} style={styles.container}>
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
                <TouchableOpacity style={styles.cartIconContainer} onPress={() => navigation.navigate("CartPage")}>
                  <Ionicons name="cart-outline" size={24} color="white" style={styles.icon} />
                  {totalItemsInCart > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{totalItemsInCart}</Text>
                    </View>
                  )}
                </TouchableOpacity>
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
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
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
              {nearbyRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} location={location!} />
              ))}
            </ScrollView>
            <Text style={styles.sectionTitle}>Todos os Restaurantes</Text>
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
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
