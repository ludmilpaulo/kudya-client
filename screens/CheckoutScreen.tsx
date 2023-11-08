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
 

  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => selectUser(state));
  const allCartItems = useSelector((state: RootState) => selectBasketItems(state));

  
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingOrder, setLoadingOrder] = useState<boolean>(false);

  console.log(allCartItems)

  





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
      
    </>
  );
};

export default CheckoutScreen;
