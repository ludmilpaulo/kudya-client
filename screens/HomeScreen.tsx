import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TextInput } from "react-native";
import tailwind from "tailwind-react-native-classnames";
import RestaurantCard from "../components/RestaurantCard";
import { baseAPI, Restaurant } from "../services/types";

type Restaurants = Restaurant[];

const HomeScreen: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurants>([]);
  const [filteredDataSource, setFilteredDataSource] = useState<Restaurants>([]);
  const [masterDataSource, setMasterDataSource] = useState<Restaurants>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${baseAPI}/customer/customer/restaurants/`)
      .then((response) => response.json())
      .then((data) => {
        const approvedRestaurants = data.restaurants.filter(
          (restaurant: Restaurant) => restaurant.is_approved
        );
        setMasterDataSource(approvedRestaurants);
        setFilteredDataSource(approvedRestaurants);
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

  return (
    <View style={tailwind`flex-1 bg-gray-100`}>
      <View style={tailwind`px-4 py-6`}>
        {loading ? (
          <View style={tailwind`flex-1 justify-center items-center`}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={tailwind`pb-4`}>
            <TextInput
              style={tailwind`p-2 border-b-2 border-gray-300`}
              placeholder="Search Restaurants"
              onChangeText={(text) => searchFilterFunction(text)}
            />
            {filteredDataSource.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default HomeScreen;
