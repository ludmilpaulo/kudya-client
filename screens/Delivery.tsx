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
  const [counter, setCounter] = useState(0);
  const [driverLocationFetchDone, setDriverLocationFetchDone] = useState(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatModalVisible, setChatModalVisible] = useState(false);

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

 


  useEffect(() => {
   // setLoading(true)
    const fetchData = async () => {
      try {
        let response = await fetch('https://www.kudya.shop/api/customer/order/latest/', {
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
          setLoading(false);

        }
    
        if (responseJson.order.length === 0) {
          alert("Você não tem nenhum pedido a caminho");
          navigation.navigate("Home");
        } else {
          setData(responseJson);
          setDriverData(responseJson.order.driver);
          setRestaurantData(responseJson.order.restaurant);
          setOrderData(responseJson.order.order_details);
          setOrder_id(responseJson?.order.id);
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
      }
    };

    // Reset necessary state variables when the component mounts
    setDriverLocationFetchDone(false);
   
    // Run the effect three times
    if (counter < 3) {
      fetchData();
      setCounter((prevCounter) => prevCounter + 1);
    }
  }, [order_id, counter]);
  

  const getDriverLocation = async () => {
    try {
      let response = await fetch(
        "https://www.kudya.shop/api/customer/driver/location/",
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
        alert("Seu pedido está sendo preparado pelo restaurante. Verifique novamente em 5 minutos.");
        navigation.navigate("Home");
  
        // Set a flag to indicate that getDriverLocation should not be called again
        setDriverLocationFetchDone(true);
  
        return;
      }
  
      const locationData = await response.json();
      //console.log(locationData)
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
      </SafeAreaView>

      {loading ? (
        <ActivityIndicator size="large" color="#004AAD" />
      ) : center ? (
        <View style={[tailwind`bg-blue-300 relative`, { height: 350 }]}>
        <MapView
          ref={ref}
          region={{
            ...center
          }}
          style={tailwind`h-full w-full z-10`}
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
        </View>
      ) : null}

<SafeAreaView style={[tailwind`flex-row items-center bg-white h-32`, { position: 'absolute', bottom: 0, width: '100%' }]}>
  <Image
    source={{ uri: `${apiUrl}${driverData?.avatar}` || "" }}
    style={tailwind`w-12 h-12 p-4 ml-5 bg-gray-300 rounded-full`}
  />
  <View style={tailwind`flex-1`}>
    {/* Assuming ChatComponent is a valid component */}
    <TouchableOpacity
            onPress={() => setChatModalVisible(true)}
            style={tailwind`text-blue-500 text-lg mr-2 font-bold`}
          >
           <Text> Abrir Chat</Text>
          </TouchableOpacity>

        
          <ChatComponent
  user="customer"
  userData={userData}
  accessToken={user?.token}
  orderId={order_id}
  onClose={() => setChatModalVisible(false)}
  isChatModalVisible={isChatModalVisible} // Pass the boolean value here
/>

   
  </View>
  <Text
    onPress={handlePhoneCall}
    style={tailwind`text-blue-500 text-lg mr-5 font-bold`}
  >
    Ligar
  </Text>
</SafeAreaView>

    </View>
  );
};

export default Delivery;
