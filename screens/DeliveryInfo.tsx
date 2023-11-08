import React from "react";
import { useNavigation } from "@react-navigation/native";

import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { XIcon } from "react-native-heroicons/solid";
import * as Progress from "react-native-progress";
import MapView, { Marker } from "react-native-maps";
import tailwind from "tailwind-react-native-classnames"; // Import tailwind correctly

const DeliveryInfo = () => {
  const navigation = useNavigation<any>();
  const restaurant = {
    title: "Restaurant Name",
    lat: 123.456, // Replace with the actual latitude
    long: 78.901, // Replace with the actual longitude
  };

  return (
    <View style={tailwind`bg-[#004AAD] flex-1`}>
      <SafeAreaView style={tailwind`z-50`}>
        <View style={tailwind`flex-row items-center justify-between p-5`}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <XIcon color="white" size={30} />
          </TouchableOpacity>
          <Text style={tailwind`text-lg font-light text-white`}>Order Help</Text>
        </View>

        <View style={tailwind`z-50 p-6 mx-5 my-2 bg-white rounded-md shadow-md`}>
          <View style={tailwind`flex-row justify-between`}>
            <View>
              <Text style={tailwind`text-lg text-gray-400`}>Estimated Arrival</Text>
              <Text style={tailwind`text-4xl font-bold`}>45-55 Minutes</Text>
            </View>
            <Image
              source={{
                uri: "https://links.papareact.com/fls",
              }}
              style={tailwind`w-20 h-20`}
            />
          </View>

          <Progress.Bar size={30} color="#004AAD" indeterminate={true} />

          <Text style={tailwind`mt-3 text-gray-500`}>
            Your order at {restaurant.title} is being prepared
          </Text>
        </View>
      </SafeAreaView>

      <MapView
        initialRegion={{
          latitude: restaurant.lat,
          longitude: restaurant.long,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        style={tailwind`z-0 flex-1 -mt-10`}
        mapType="mutedStandard"
      >
        <Marker
          coordinate={{
            latitude: restaurant.lat,
            longitude: restaurant.long,
          }}
          title={restaurant.title}
          description={""}
          identifier="origin"
          pinColor="#004AAD"
        />
      </MapView>

      <SafeAreaView style={tailwind`flex-row items-center space-x-5 bg-white h-28`}>
        <Image
          source={{
            uri: "https://links.papareact.com/wru",
          }}
          style={tailwind`w-12 h-12 p-4 ml-5 bg-gray-300 rounded-full`}
        />
        <View style={tailwind`flex-1`}>
          <Text style={tailwind`text-lg`}>Sonny Sangha</Text>
          <Text style={tailwind`text-gray-400`}>Seu motorista</Text>
        </View>

        <Text style={tailwind`text-[#004AAD] text-lg mr-5 font-bold`}>Ligar</Text>
      </SafeAreaView>
    </View>
  );
};

export default DeliveryInfo;
