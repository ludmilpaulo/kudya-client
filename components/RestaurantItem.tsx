import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import tailwind from "tailwind-react-native-classnames";
import { ArrowRightIcon, StarIcon } from "react-native-heroicons/solid";
import Icon from 'react-native-vector-icons/FontAwesome';

import PropTypes from 'prop-types';


import { useNavigation } from "@react-navigation/native";
import { Restaurant } from "../configs/types";

interface RestaurantItemProps {
  title: string;
  description: string;
  restaurantData: Restaurant[];
}

const RestaurantItem: React.FC<RestaurantItemProps> = ({ title, description, restaurantData }) => {
  const navigation = useNavigation<any>();
 

  const handlePress = (item: Restaurant) => {
    navigation.navigate("DetailsScreen", {
      item: item,
      name: item.name,
      restaurantId: item.id,
      phone: item.phone,
      image_url: item.logo,
      address: item.address,
    });
  };

  return (
    <View>
    <View  style={tailwind`mt-4 flex-row items-center justify-between px-4`}>
      <Text  style={tailwind`font-bold text-lg`}>{title}</Text>
      <ArrowRightIcon color="#004AAD" />
    </View>

    <Text style={tailwind`text-xs text-gray-500 px-4`}>{description}</Text>
       <ScrollView
        horizontal
        contentContainerStyle={{
          paddingHorizontal: 15,
        }}
        showsHorizontalScrollIndicator={false}
        style={tailwind`pt-4`}
      >
      {restaurantData?.map((item: Restaurant, index: number) => (

        <RestaurantItemCard
          key={index}
          item={item}
          onPress={() => handlePress(item)}
        />
      ))}
     
      </ScrollView>
    </View>
  );
};

export default RestaurantItem;

const RestaurantItemCard = ({ item, onPress }: { item: Restaurant; onPress: any }) => {

 
  return (

    <TouchableOpacity
    onPress={onPress}
  
    style={tailwind`bg-white mr-3 shadow`}
  >
    <Image
       source={{ uri: item.logo }}
       style={tailwind`h-36 w-64 rounded-sm`}
    />

    <View style={tailwind`px-3 pb-4`}>
      <Text style={tailwind`font-bold text-lg pt-2`}>{item.name}</Text>
      <View style={tailwind`flex-row items-center ml-1`}>
        <StarIcon color="#004AAD" opacity={0.5} size={22} />
        <Text style={tailwind`text-xs text-gray-500`}>
          <Text style={tailwind`text-green-500`}></Text> 
        </Text>
      </View>

      <View style={tailwind`flex-row items-center ml-1`}>
      <Icon name="location-arrow" size={30} style={{ opacity: 0.4, color: 'black' }} />
        
        <Text style={tailwind`text-xs text-gray-500`}>Próximo· {item.address}</Text>
      </View>
    </View>
  </TouchableOpacity>

  );
 
};

RestaurantItemCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired, // Change this to string
    address: PropTypes.string.isRequired,
    logo: PropTypes.string.isRequired,
    category: PropTypes.shape({
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
    }),
  }).isRequired,
  onPress: PropTypes.func.isRequired,
};

