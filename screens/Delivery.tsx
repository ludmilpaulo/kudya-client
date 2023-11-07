import { View, Image, TouchableOpacity, Text } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Screen from "../components/Screen";
import tailwind from "tailwind-react-native-classnames";
import { XCircleIcon } from "react-native-heroicons/outline";
import * as Progress from "react-native-progress";
import { useSelector } from "react-redux";
import MapView, { Marker } from "react-native-maps";

import { googleAPi } from "../configs/variable";

import { selectUser } from "../redux/slices/authSlice";

import { selectUserLocation } from "../redux/slices/locationSlice";
import { selectDriverLocation } from "../redux/slices/driverLocationSlice";

interface LatLng {
  latitude: any;
  longitude: any;
}

const Delivery = () => {
  const navigation = useNavigation();

  const ref = useRef<MapView | null>(null);

  const [time, setTime] = React.useState("");

  const driverPosition = useSelector(selectDriverLocation);

  const [deliveryDuration, setDeliveryDuration] = useState();
  const [deliveryPoints, setDeliveryPoints] = useState();

  const [driverLocation, setDriverLocation] = useState();

  const [userlongitude, setUserLongitude] = useState(0);
  const [userlatitude, setUserLatitude] = useState(0);

  const [driverLongitude, setDriverLong] = useState(0);
  const [driverLatitude, setDriverLat] = useState(0);

  const [data, setData] = useState([{}]);
  const [driverData, setDriverData] = useState({});
  const [restaurantData, setRestaurantData] = useState([]);
  const [orderData, setOrderData] = useState([]);

  const user = useSelector(selectUser);
  const userPosition = useSelector(selectUserLocation);

  const locationObject = JSON.parse(driverPosition.location.replace(/'/g, '"'));

  const GOOGLE_MAPS_APIKEY = googleAPi;

  const initialRegion = {
    latitude: userPosition.latitude,
    longitude: userPosition.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  const [travelTime, setTravelTime] = useState<number | null>(null);

  useEffect(() => {
    pickOrder();
    const timer = setInterval(() => 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (locationObject) {
      console.debug(locationObject);
      ref.current?.animateCamera({ center: locationObject, zoom: 1 });
    }
  }, [locationObject]);

  const pickOrder = async () => {
    let response = await fetch(
      "https://www.sunshinedeliver.com/api/customer/order/latest/",
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
    )
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.order.total == null) {
          alert(" Voce Nao tem nenhum Pedido a Caminho");
          navigation.goBack();
        } else {
          setData(responseJson.order);
          setDriverData(responseJson.order.driver);
          setRestaurantData(responseJson.order.restaurant);
          setOrderData(responseJson.order.order_details);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  /*

  const calculateTravelTime = async () => {
    const apiKey = googleAPi;
    const originLat = driver ? driver?.latitude : 0;
    const originLng = driver ? driver?.longitude : 0;
    console.log("user location", initialRegion);
    console.log("driver location", initialCoordinate);
    const destinationLat = userlatitude;
    const destinationLng = userlongitude;
    const mode = "driving";
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destinationLat},${destinationLng}&mode=${mode}&key=${apiKey}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const travelTimeInSeconds = data.routes[0].legs[0].duration.value;
        const travelTimeInMinutes = Math.ceil(travelTimeInSeconds / 60);
        setTime(travelTimeInSeconds.toFixed(2));
        console.log(`Travel time: ${travelTimeInMinutes} minutes`);
      })
      .catch((error) => console.error("No route information available."));
  };

  useEffect(() => {
    const timer = setInterval(() => calculateTravelTime(), 2000);
    return () => clearInterval(timer);
  }, []);
*/
  return (
    <Screen style={tailwind`flex-1`}>
      <View style={tailwind`flex-row justify-between items-center p-5`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <XCircleIcon color="#004AAD" size={30} />
        </TouchableOpacity>
        <Text style={tailwind`font-light text-lg`}>Delivery</Text>
      </View>

      <View style={tailwind`bg-white mx-5 my-2 rounded-md p-6 z-50 shadow-md`}>
        <View style={tailwind`flex-row justify-between`}>
          <View>
            <Text style={tailwind`text-lg text-gray-400`}>
              Estimated Arrival
            </Text>

            <Text></Text>

            <Text style={tailwind`text-4xl font-bold`}>
              Travel time: {time}
            </Text>
          </View>
          <Image
            source={{
              uri: "https://links.papareact.com/fls",
            }}
            style={tailwind`h-20 w-20`}
          />
        </View>
        <Progress.Bar size={30} color="#004AAD" indeterminate={true} />
      </View>
      <View style={[tailwind`bg-blue-300 relative `, { height: 500 }]}>
        {locationObject && (
          <>
            <MapView
              ref={ref}
              region={{
                ...locationObject,
              }}
              style={tailwind`h-full z-10`}
            >
              <Marker coordinate={locationObject}>
                <Image
                  source={{
                    uri: "https://links.papareact.com/fls",
                  }}
                  style={tailwind`h-20 w-20`}
                />
              </Marker>
              <Marker coordinate={initialRegion} title="Destination" />
            </MapView>
          </>
        )}
      </View>
    </Screen>
  );
};

export default Delivery;
function setCurrentLocation(arg0: {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}) {
  throw new Error("Function not implemented.");
}
