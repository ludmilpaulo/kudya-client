import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, Linking, Image, ActivityIndicator, Alert } from "react-native";
import { XCircleIcon } from "react-native-heroicons/outline";
import * as Progress from "react-native-progress";
import MapView, { Marker } from "react-native-maps";
import tailwind from "tailwind-react-native-classnames"; 
import { useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import ChatComponent from "../components/ChatComponent";

import { baseAPI } from "../services/types";
import { getDistance } from 'geolib';
import * as Location from 'expo-location';
import { useNavigation } from "@react-navigation/native";
import { fetchLatestOrder, fetchDriverLocation } from "../services/driverService";

interface Location {
  latitude: number;
  longitude: number;
}

const calculateETA = (userLocation: Location, driverLocation: Location): number | null => {
  if (!userLocation || !driverLocation) return null;

  const distanceInMeters = getDistance(userLocation, driverLocation);
  const averageSpeedInMetersPerSecond = 15; // average speed in m/s (assuming 54 km/h)

  const etaInSeconds = distanceInMeters / averageSpeedInMetersPerSecond;
  const etaInMinutes = Math.ceil(etaInSeconds / 60);

  return etaInMinutes;
};

const Delivery = () => {
  const ref = useRef<MapView | null>(null);
  const navigation = useNavigation<any>();
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);
  const [data, setData] = useState<any>([]);
  const [driverData, setDriverData] = useState<any>(null);
  const [restaurantData, setRestaurantData] = useState<any>([]);
  const [orderData, setOrderData] = useState<any>();
  const [order_id, setOrder_id] = useState<any>();
  const [userCoordinates, setUserCoordinates] = useState<Location | null>(null);
  const [driverLocationFetchDone, setDriverLocationFetchDone] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatModalVisible, setChatModalVisible] = useState(false);
  const user = useSelector(selectUser);
  let userData = user;

  const handlePhoneCall = () => {
    const phoneNumber = driverData?.phone;
    Linking.canOpenURL(`tel:${phoneNumber}`).then((supported) => {
      if (supported) {
        Linking.openURL(`tel:${phoneNumber}`);
      } else {
        console.error(`Phone calls are not supported on this device`);
      }
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching latest order data...");
      try {
        const responseJson = await fetchLatestOrder(user?.token);
        console.log("Latest order data:", responseJson);

        const order = responseJson?.orders?.[0];

        if (!order) {
          alert("Você não tem nenhum pedido a caminho");
          navigation.navigate("Home");
          return;
        }

        if (order?.total === null) {
          alert("O restaurante ainda não aceitou o seu pedido");
          navigation.navigate("Home");
          setLoading(false);
          return;
        }

        setData(responseJson);
        setDriverData(order.driver);
        setRestaurantData(order.restaurant);
        setOrderData(order.order_details);
        setOrder_id(order.id);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching latest order:", error);
      }
    };

    fetchData();
  }, [order_id, user?.token, navigation]);

  const getDriverLocation = async () => {
    console.log("Fetching driver location...");
    try {
      const locationData = await fetchDriverLocation(user?.token);
      console.log("Driver location data:", locationData);

      const driverLocationString = locationData?.order_locations?.[0]?.driver_location;

      if (!driverLocationString) {
        alert("Seu pedido está sendo preparado pelo restaurante. Verifique novamente em 5 minutos.");
        navigation.navigate("Home");
        setDriverLocationFetchDone(true);
        return;
      }

      const driverLocationParsed: Location = JSON.parse(driverLocationString.replace(/'/g, '"'));
      setDriverLocation(driverLocationParsed);
    } catch (error) {
      console.error("Error fetching driver location:", error);
    }
  };

  const getUserLocation = async () => {
    console.log("Fetching user location...");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão para acessar localização foi negada');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const userLocation = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setUserCoordinates(userLocation);
    } catch (error) {
      console.error("Error fetching user location:", error);
    }
  };

  useEffect(() => {
    getDriverLocation();
    getUserLocation();

    const intervalId = setInterval(() => {
      if (!driverLocationFetchDone) {
        getDriverLocation();
      }
    }, 2000);
    return () => clearInterval(intervalId);
  }, [driverLocationFetchDone]);

  const driverCoordinates = useMemo<Location | null>(() => {
    if (!driverLocation) return null;
    return { longitude: driverLocation.longitude, latitude: driverLocation.latitude };
  }, [driverLocation]);

  useEffect(() => {
    if (driverCoordinates) {
      ref.current?.animateCamera({ center: driverCoordinates, zoom: 15 });
    }
  }, [driverCoordinates]);

  const eta = useMemo(() => {
    if (!userCoordinates || !driverCoordinates) return "Calculando...";
    const calculatedETA = calculateETA(userCoordinates, driverCoordinates);
    console.log("Calculated ETA:", calculatedETA);
    return calculatedETA !== null ? `${calculatedETA} Minutos` : "Calculando...";
  }, [userCoordinates, driverCoordinates]);

  const center = driverCoordinates ? {
    latitude: driverCoordinates.latitude,
    longitude: driverCoordinates.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  } : null;

  const openChat = () => {
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  return (
    <View style={tailwind`bg-blue-500 flex-1`}>
      <SafeAreaView style={tailwind`z-50`}>
        <View style={tailwind`flex-row items-center justify-between p-5`}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <XCircleIcon color="#ffffff" size={30} />
          </TouchableOpacity>
          <Text style={tailwind`text-lg font-light text-white`}>Ajuda</Text>
        </View>

        <View style={tailwind`z-50 p-6 mx-5 my-2 bg-white rounded-md shadow-md`}>
          <View style={tailwind`flex-row justify-between`}>
            <View>
              <Text style={tailwind`text-lg text-gray-400`}>
                {driverData ? `${driverData.name} chegará em aproximadamente` : 'Seu pedido está a caminho'}
              </Text>
              <Text style={tailwind`text-4xl font-bold`}>{eta}</Text>
            </View>
            {driverData && (
              <Image
                source={{ uri: `${baseAPI}${driverData.avatar}` || "" }}
                style={tailwind`w-20 h-20 rounded-full`}
              />
            )}
          </View>

          <Progress.Bar
            style={{ height: 8, borderRadius: 15 }}
            color="#004AAD"
            indeterminate={true}
          />

          <Text style={tailwind`mt-3 text-gray-500`}>
            Seu pedido no {restaurantData?.name} está a caminho
          </Text>
        </View>
      </SafeAreaView>

      {loading ? (
        <ActivityIndicator size="large" color="#004AAD" />
      ) : center ? (
        <View style={[tailwind`relative`, { height: 350 }]}>
          <MapView
            ref={ref}
            region={center}
            style={tailwind`h-full w-full z-10`}
          >
            {driverLocation && (
              <Marker
                coordinate={{ latitude: driverLocation.latitude, longitude: driverLocation.longitude }}
                title={driverData?.name}
                identifier="region"
                anchor={{ x: 0.5, y: 0.5 }}
              >
                {driverData && (
                  <Image
                    source={{ uri: `${baseAPI}${driverData.avatar}` || "" }}
                    style={tailwind`w-8 h-8 bg-gray-300 rounded-full`}
                  />
                )}
              </Marker>
            )}
          </MapView>
        </View>
      ) : null}

      <SafeAreaView style={[tailwind`flex-row items-center bg-white h-32`, { position: 'absolute', bottom: 75, width: '100%' }]}>
        {driverData && (
          <Image
            source={{ uri: `${baseAPI}${driverData.avatar}` || "" }}
            style={tailwind`w-12 h-12 bg-gray-300 rounded-full`}
          />
        )}
        <View style={tailwind`flex-1`}>
          <TouchableOpacity
            onPress={() => setChatModalVisible(true)}
            style={tailwind`text-blue-500 text-lg mr-2 font-bold`}
          >
            <Text>Abrir Chat</Text>
          </TouchableOpacity>
          <ChatComponent
            user="customer"
            userData={userData}
            accessToken={user?.token}
            orderId={order_id}
            onClose={() => setChatModalVisible(false)}
            isChatModalVisible={isChatModalVisible}
          />
        </View>
        {driverData && (
          <Text onPress={handlePhoneCall} style={tailwind`text-blue-500 text-lg mr-5 font-bold`}>
            Ligar
          </Text>
        )}
      </SafeAreaView>
    </View>
  );
};

export default Delivery;
