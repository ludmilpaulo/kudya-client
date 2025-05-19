import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { XCircleIcon } from "react-native-heroicons/outline";
import * as Progress from "react-native-progress";
import MapView, { Marker } from "react-native-maps";
import tw from "twrnc";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import ChatComponent from "../components/ChatComponent";
import { baseAPI } from "../services/types";
import { getDistance } from "geolib";
import * as Location from "expo-location";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { fetchLatestOrder, fetchDriverLocation } from "../services/driverService";

interface LocationType {
  latitude: number;
  longitude: number;
}

const calculateETA = (userLocation: LocationType, driverLocation: LocationType): number | null => {
  if (!userLocation || !driverLocation) return null;
  const distanceInMeters = getDistance(userLocation, driverLocation);
  const averageSpeedInMetersPerSecond = 15; // approx 54 km/h
  const etaInSeconds = distanceInMeters / averageSpeedInMetersPerSecond;
  return Math.ceil(etaInSeconds / 60);
};

const Delivery = () => {
  const ref = useRef<MapView | null>(null);
  const navigation = useNavigation<any>();
  const user = useSelector(selectUser);
  const [driverLocation, setDriverLocation] = useState<LocationType | null>(null);
  const [data, setData] = useState<any>([]);
  const [driverData, setDriverData] = useState<any>(null);
  const [restaurantData, setRestaurantData] = useState<any>([]);
  const [orderData, setOrderData] = useState<any>();
  const [order_id, setOrder_id] = useState<any>();
  const [userCoordinates, setUserCoordinates] = useState<LocationType | null>(null);
  const [driverLocationFetchDone, setDriverLocationFetchDone] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isChatModalVisible, setChatModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        Alert.alert(
          "Login Required",
          "You need to log in to access your cart and complete your purchase.",
          [
            {
              text: "Login",
              onPress: () => navigation.navigate("UserLogin"),
            },
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => navigation.goBack(),
            },
          ],
        );
      }
    }, [user, navigation]),
  );

  const handlePhoneCall = () => {
    const phoneNumber = driverData?.phone;
    Linking.canOpenURL(`tel:${phoneNumber}`).then((supported) => {
      if (supported) {
        Linking.openURL(`tel:${phoneNumber}`);
      } else {
        console.error(`Phone calls are not supported`);
      }
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseJson = await fetchLatestOrder(user?.token);
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
  }, [order_id, user?.token]);

  const getDriverLocation = async () => {
    try {
      const locationData = await fetchDriverLocation(user?.token);
      const driverLocationString = locationData?.order_locations?.[0]?.driver_location;

      if (!driverLocationString) {
        alert("Seu pedido está sendo preparado pelo restaurante.");
        navigation.navigate("Home");
        setDriverLocationFetchDone(true);
        return;
      }

      const parsed: LocationType = JSON.parse(driverLocationString.replace(/'/g, '"'));
      setDriverLocation(parsed);
    } catch (error) {
      console.error("Error fetching driver location:", error);
    }
  };

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão para acessar localização foi negada");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setUserCoordinates({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (error) {
      console.error("Error fetching user location:", error);
    }
  };

  useEffect(() => {
    getDriverLocation();
    getUserLocation();

    const intervalId = setInterval(() => {
      if (!driverLocationFetchDone) getDriverLocation();
    }, 2000);
    return () => clearInterval(intervalId);
  }, [driverLocationFetchDone]);

  const driverCoordinates = useMemo<LocationType | null>(() => {
    if (!driverLocation) return null;
    return {
      latitude: driverLocation.latitude,
      longitude: driverLocation.longitude,
    };
  }, [driverLocation]);

  useEffect(() => {
    if (driverCoordinates) {
      ref.current?.animateCamera({ center: driverCoordinates, zoom: 15 });
    }
  }, [driverCoordinates]);

  const eta = useMemo(() => {
    if (!userCoordinates || !driverCoordinates) return "Calculando...";
    const min = calculateETA(userCoordinates, driverCoordinates);
    return min !== null ? `${min} Minutos` : "Calculando...";
  }, [userCoordinates, driverCoordinates]);

  const center = driverCoordinates && {
    latitude: driverCoordinates.latitude,
    longitude: driverCoordinates.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <View style={tw`flex-1 bg-blue-500`}>
      <SafeAreaView style={tw`z-50`}>
        <View style={tw`flex-row items-center justify-between p-5`}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <XCircleIcon color="#ffffff" size={30} />
          </TouchableOpacity>
          <Text style={tw`text-lg font-light text-white`}>Ajuda</Text>
        </View>

        <View style={tw`bg-white mx-5 my-2 p-6 rounded-md shadow-md`}>
          <View style={tw`flex-row justify-between`}>
            <View>
              <Text style={tw`text-lg text-gray-400`}>
                {driverData?.name
                  ? `${driverData.name} chegará em aproximadamente`
                  : "Seu pedido está a caminho"}
              </Text>
              <Text style={tw`text-4xl font-bold`}>{eta}</Text>
            </View>
            {driverData?.avatar && (
              <Image
                source={{ uri: `${baseAPI}${driverData.avatar}` }}
                style={tw`w-20 h-20 rounded-full`}
              />
            )}
          </View>

          <Progress.Bar style={{ height: 8, borderRadius: 15 }} color="#004AAD" indeterminate={true} />

          <Text style={tw`mt-3 text-gray-500`}>
            Seu pedido no {restaurantData?.name} está a caminho
          </Text>
        </View>
      </SafeAreaView>

      {loading ? (
        <ActivityIndicator size="large" color="#004AAD" />
      ) : center ? (
        <View style={[tw`relative`, { height: 350 }]}>
          <MapView ref={ref} region={center} style={tw`h-full w-full z-10`}>
            {driverLocation && (
              <Marker
                coordinate={driverLocation}
                title={driverData?.name}
                identifier="region"
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <Image
                  source={{ uri: `${baseAPI}${driverData?.avatar}` }}
                  style={tw`w-8 h-8 bg-gray-300 rounded-full`}
                />
              </Marker>
            )}
          </MapView>
        </View>
      ) : null}

      <SafeAreaView style={[tw`flex-row items-center bg-white`, { height: 90, position: "absolute", bottom: 75, width: "100%" }]}>
        {driverData?.avatar && (
          <Image
            source={{ uri: `${baseAPI}${driverData.avatar}` }}
            style={tw`w-12 h-12 rounded-full bg-gray-300 mx-4`}
          />
        )}
        <View style={tw`flex-1`}>
          <TouchableOpacity onPress={() => setChatModalVisible(true)}>
            <Text style={tw`text-blue-500 text-lg font-bold`}>Abrir Chat</Text>
          </TouchableOpacity>
          <ChatComponent
            user="customer"
            userData={user}
            accessToken={user?.token}
            orderId={order_id}
            onClose={() => setChatModalVisible(false)}
            isChatModalVisible={isChatModalVisible}
          />
        </View>
        {driverData && (
          <TouchableOpacity onPress={handlePhoneCall}>
            <Text style={tw`text-blue-500 text-lg font-bold mr-5`}>Ligar</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
};

export default Delivery;
