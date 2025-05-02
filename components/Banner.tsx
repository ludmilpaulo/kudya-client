import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, ScrollView, Image } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from "@react-navigation/native";
import tw from 'twrnc';

interface Restaurant {
  location: {
    latitude: number;
    longitude: number;
  };
  name: string;
  logo: string;
}

interface BannerProps {
  title: string;
  backgroundImage: string;
  backgroundApp: string;
  bottomImage: string;
  aboutText: string;
  restaurants: Restaurant[];
  userLocation: {
    latitude: number;
    longitude: number;
  };
}

const Banner: React.FC<BannerProps> = ({
  title,
  backgroundImage,
  backgroundApp,
  bottomImage,
  aboutText,
  restaurants,
  userLocation,
}) => {
  const navigation = useNavigation<any>();

  return (
    <View style={tw`flex-1`}>
      <ScrollView style={tw`flex-grow-0`}>
        <ImageBackground
          source={{ uri: backgroundImage }}
          style={tw`w-full h-64 justify-end items-center`}
          resizeMode="cover"
        >
          <Image
            source={{ uri: backgroundApp }}
            style={tw`w-20 h-20 mb-4 rounded-full shadow-lg`}
          />
          <Text style={tw`text-3xl text-white font-bold text-center mb-2`}>
            {title}
          </Text>
          <TouchableOpacity
            style={tw`bg-blue-700 px-6 py-3 rounded-full mb-2 shadow-md`}
            onPress={() => navigation.navigate("UserLogin")}
            activeOpacity={0.7}
          >
            <Text style={tw`text-white text-lg`}>
              Peça seus favoritos agora
            </Text>
          </TouchableOpacity>
        </ImageBackground>

        <ImageBackground
          source={{ uri: bottomImage }}
          style={tw`w-full h-24`}
          resizeMode="cover"
        />
      </ScrollView>

      <MapView
        style={tw`flex-1`}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {restaurants.map((restaurant, index) => (
          <Marker
            key={index}
            coordinate={restaurant.location}
            title={restaurant.name}
          >
            <Image
              source={{ uri: restaurant.logo }}
              style={tw`w-10 h-10 rounded-full`}
              resizeMode="cover"
            />
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

export default Banner;
