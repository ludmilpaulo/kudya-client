import React, { useEffect, useState, useRef } from "react";
import { View, Image, TouchableOpacity, Text, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import tailwind from "tailwind-react-native-classnames";
import * as Device from "expo-device";
import * as Location from "expo-location";
import { useDispatch, useSelector } from "react-redux";
import { selectBasketItems, updateBasket } from "../redux/slices/basketSlice";

import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Screen from "../components/Screen";
import { selectUser } from "../redux/slices/authSlice";
import { RootState } from "../redux/types";

const CheckoutScreen = ({ navigation }: { navigation: any }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");

  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => selectUser(state));
  const allCartItems = useSelector((state: RootState) => selectBasketItems(state));

  const [longitude, setLongitude] = useState<number>(0);
  const [latitude, setLatitude] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingOrder, setLoadingOrder] = useState<boolean>(false);

  const initialRegion = {
    latitude: latitude,
    longitude: longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  const initialCoordinate = {
    latitude: latitude,
    longitude: longitude,
  };

  const userLocation = async () => {
    if (Platform.OS === "android" && !Device.isDevice) {
      alert("Oops, this will not work on Snack in an Android Emulator. Try it on your device!");
      return;
    }

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLongitude(location.coords.longitude);
    setLatitude(location.coords.latitude);
    setLocation(location);
  };

  useEffect(() => {
    const timer = setInterval(() => userLocation(), 2000);
    return () => clearInterval(timer);
  }, []);

  const tags = allCartItems.reduce((result, key) => {
    return result.concat(key.food);
  }, []);

  let newA = tags.map(({ id, quantity }) => {
    return { meal_id: id, quantity };
  });

  let restaurantId = allCartItems.map(({ resId }: { resId: string }) => {
    return resId.toString();
  });

  const onPressBuy = async () => {
    setLoading(true);
    completeOrder();
    setLoading(false);
  };

  const completeOrder = async () => {
    let tokenvalue = user?.token;

    if (!userAddress) {
      alert("Por favor, preencha o endereço de entrega.");
    } else {
      let response = await fetch("https://www.sunshinedeliver.com/api/customer/order/add/", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: tokenvalue,
          restaurant_id: restaurantId.join(","),
          address: userAddress,
          order_details: newA,
        }),
      })
        .then((response) => response.json())
        .then((responseJson) => {
          alert(responseJson.status);
          setTimeout(() => {
            setLoadingOrder(false);
            dispatch(updateBasket([]));
            navigation.navigate("SuccessScreen");
          }, 2000);
        })
        .catch((error) => {
          alert("Selecione comida apenas de um restaurante");
          navigation.navigate("CartScreen");
          console.log(error);
        });
    }
  };

  const mapRef = useRef<MapView>(null);

  return (
    <>
      <View style={[tailwind`bg-blue-300 relative `, { height: 250 }]}>
        <MapView
          provider={PROVIDER_GOOGLE}
          region={initialRegion}
          style={tailwind`h-full z-10`}
        >
          <Marker
            coordinate={initialCoordinate}
            identifier="shop"
            anchor={{ x: 0.5, y: 0.5 }}
            title="Shop"
          >
            <Image source={require("../assets/shop.png")} style={{ height: 27, width: 27 }} />
          </Marker>
        </MapView>
      </View>

      <Screen style={tailwind`flex-1`}>
        <GooglePlacesAutocomplete
          placeholder="Adicione seu endereço"
          onPress={(data, details = null) => {
            console.log("endereco done", data?.description);
            setUserAddress(data?.description);
          }}
          query={{
            key: "YOUR_GOOGLE_API_KEY", // Replace with your actual Google API key
            language: "en",
            types: ["(cities)"],
          }}
          styles={{
            container: {
              flex: 1,
            },
            textInput: {
              height: 40,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 5,
              paddingLeft: 10,
              marginTop: 10,
              marginLeft: 10,
              marginRight: 10,
            },
            listView: {
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#ccc",
              borderTopWidth: 0,
              marginTop: -1,
              marginLeft: 10,
              marginRight: 10,
              elevation: 1,
            },
          }}
        />
        <TouchableOpacity
          style={tailwind`h-10 w-full bg-blue-500 mb-24 rounded-full items-center justify-center border border-blue-500 `}
          onPress={completeOrder}
        >
          <Text>Pagar na entrega </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tailwind`h-10 w-full bg-blue-500 rounded-full items-center justify-center border border-blue-500 `}
          onPress={onPressBuy}
        >
          <Text>FAÇA SEU PEDIDO </Text>
        </TouchableOpacity>
      </Screen>
    </>
  );
};

export default CheckoutScreen;
