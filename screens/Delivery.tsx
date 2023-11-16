import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Image,
  ActivityIndicator,
} from "react-native";
import { XCircleIcon } from "react-native-heroicons/outline";
import * as Progress from "react-native-progress";
import MapView, { Marker } from "react-native-maps";

import tailwind from "tailwind-react-native-classnames"; 
import { useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import { apiUrl } from "../configs/variable";

import ChatComponent from "../components/ChatComponent";

type Props = {}

const Delivery = (props: Props) => {
  const ref = useRef<MapView | null>(null);

  const navigation = useNavigation<any>();
  const [driverLocation, setDriverLocation] = useState<any>();
  const [data, setData] = useState<any>([]);
  const [driverData, setDriverData] = useState<any>({});
  const [restaurantData, setRestaurantData] = useState<any>([]);
  const [orderData, setOrderData] = useState<any>();
  const [order_id, setOrder_id] = useState<any>();
  const [driverLocationFetchDone, setDriverLocationFetchDone] = useState(false);

  const [loading, setLoading] = useState<boolean>(true);

  const user = useSelector(selectUser);
  let userData = user;
  
  const handlePhoneCall = () => {
    const phoneNumber = driverData?.phone;

    // Check if the device supports the `tel` scheme
    Linking.canOpenURL(`tel:${phoneNumber}`).then((supported) => {
      if (supported) {
        // Open the phone dialer with the given phone number
        Linking.openURL(`tel:${phoneNumber}`);
      } else {
        console.error(`Phone calls are not supported on this device`);
      }
    });
  };

  const pickOrder = async () => {
    try {
      let response = await fetch('https://www.sunshinedeliver.com/api/customer/order/latest/', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: user?.token,
        }),
      });
  
      let responseJson = await response.json();
  
      if (responseJson.order.total === null) {
        alert("O restaurante ainda não aceitou o seu pedido");
        navigation.navigate("Home");
      }
  
      if (responseJson.order.length === 0) {
        alert("Você não tem nenhum pedido a caminho");
        navigation.navigate("Home");
      } else {
        setData(responseJson);
        setDriverData(responseJson.order.driver);
        setRestaurantData(responseJson.order.restaurant);
        setOrderData(responseJson.order.order_details);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await pickOrder();
  
      if (data && data.order) {
        const orderId = data.order.id;
        setOrder_id(orderId);
      } else {
        console.error("Data is not defined or does not contain an order.");
      }
    };
  
    // Reset necessary state variables when the component mounts
    setDriverLocationFetchDone(false);
    setLoading(true);
  
    fetchData();
  }, []);
  

  const getDriverLocation = async () => {
    try {
      let response = await fetch(
        "https://www.sunshinedeliver.com/api/customer/driver/location/",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: user?.token,
          }),
        }
      );
  
      if (!response.ok) {
        // If the response is not okay, show an alert and return
        alert("Your order is being prepared by the restaurant. Please check again in 5 minutes.");
        navigation.navigate("Home");
  
        // Set a flag to indicate that getDriverLocation should not be called again
        setDriverLocationFetchDone(true);
  
        return;
      }
  
      const locationData = await response.json();
      setDriverLocation(JSON.parse(locationData?.location.replace(/'/g, '"')));
    } catch (error) {
      console.error("Error fetching driver location:", error);
    }
  };
  
  useEffect(() => {
    // Fetch driver location immediately
    getDriverLocation();
  
    // Set up interval to fetch driver location every 2 seconds, but only if it hasn't been fetched already
    const intervalId = setInterval(() => {
      if (!driverLocationFetchDone) {
        getDriverLocation();
      }
    }, 2000);
  
    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [driverLocationFetchDone]);
  

  const driverCoordinates = useMemo(() => {
    const longitude = driverLocation?.longitude || 0;
    const latitude = driverLocation?.latitude || 0;
    
    return {
      longitude: parseFloat(longitude),
      latitude: parseFloat(latitude),
    };
  }, [driverLocation]);

  useEffect(() => {
    if (driverCoordinates) {
      ref.current?.animateCamera({ center: driverCoordinates, zoom: 15 });
    }
  }, [driverCoordinates]);

  let center = {
    latitude: driverCoordinates ? driverCoordinates?.latitude : 0,
    longitude: driverCoordinates ? driverCoordinates?.longitude : 0,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <View style={tailwind`bg-blue-500 flex-1`}>
      <SafeAreaView style={tailwind`z-50`}>
        <View style={tailwind`flex-row items-center justify-between p-5`}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <XCircleIcon color="#004AAD" size={30} />
          </TouchableOpacity>
          <Text style={tailwind`text-lg font-light text-white`}>Ajuda</Text>
        </View>

        <View style={tailwind`z-50 p-6 mx-5 my-2 bg-white rounded-md shadow-md`}>
          <View style={tailwind`flex-row justify-between`}>
            <View>
              <Text style={tailwind`text-lg text-gray-400`}>
                {driverData?.name}chegará estimado em
              </Text>
              <Text style={tailwind`text-4xl font-bold`}>45-55 Minutos</Text>
            </View>
            <Image
              source={{ uri: `${apiUrl}${driverData?.avatar}` || "" }}
              style={tailwind`w-20 h-20`}
            />
          </View>

          <Progress.Bar
            style={{
              height: 8,
              borderRadius: 15,
            }}
            color="#004AAD"
            indeterminate={true}
          />

          <Text style={tailwind`mt-3 text-gray-500`}>
            Seu pedido no {restaurantData?.name} está a caminho
          </Text>
        </View>
    

      {loading ? (
        <ActivityIndicator size="large" color="#004AAD" />
      ) : center ? (
        <MapView
          ref={ref}
          region={{
            ...center
          }}
          style={tailwind`h-full w-full`}
        >
          <Marker
            coordinate={{
              latitude: driverLocation?.latitude || 0,
              longitude: driverLocation?.longitude || 0,
            }}
            title={driverData?.name}
            identifier="region"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <Image
              source={{ uri: `${apiUrl}${driverData?.avatar}` || "" }}
              style={tailwind`w-8 h-8 p-4 ml-5 bg-gray-300 rounded-full`}
            />
          </Marker>
        </MapView>
      ) : null}

      <View style={tailwind`flex-row items-center mb-8 mr-5 bg-white h-28`}>
        <Image
          source={{ uri: `${apiUrl}${driverData?.avatar}` || "" }}
          style={tailwind`w-12 h-12 p-4 ml-5 bg-gray-300 rounded-full`}
        />
        <View style={tailwind`flex-1`}>
          {/* Assuming ChatComponent is a valid component */}
          <ChatComponent
            user="customer"
            userData={userData}
            accessToken={user?.token}
            orderId={order_id}
          />
        </View>
        <Text
          onPress={handlePhoneCall}
          style={tailwind`text-blue-500 text-lg mr-5 font-bold`}
        >
          Ligar
        </Text>
      </View>
      </SafeAreaView>

    </View>
  );
};

export default Delivery;
