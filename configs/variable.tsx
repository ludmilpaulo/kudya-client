import axios from "axios";
import * as Device from "expo-device";
import * as Location from "expo-location";
import { useState } from "react";
import { Platform } from "react-native";
import { ForgotPasswordRequest } from "./types";


//const [longitude, setLongitude] = useState(0);
//const [latitude, setLatitude] = useState(0);
//const [location, setLocation] = useState({});

//const [loading, setLoading] = useState(true);
//const [loadingOrder, setLoadingOrder] = useState(false);


export const googleAPi = "AIzaSyDn1X_BlFj-57ydasP6uZK_X_WTERNJb78";

export const apiUrl = "https://www.sunshinedeliver.com";

export const fetchData = async (endpoint: string) => {
  try {
    const response = await axios.get(apiUrl + endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};



export const userLocation = async () => {
  if (Platform.OS === "android" && !Device.isDevice) {
    alert(
      "Oops, this will not work on Snack in an Android Emulator. Try it on your device!"
    );
    return;
  }
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    alert("Permission to access location was denied");
    return;
  }

  let location = await Location.getCurrentPositionAsync({});
  return location.coords;
  //setLatitude(location.coords.latitude);

};





export const requestPasswordReset = async (data: ForgotPasswordRequest) => {
  try {
    const response = await fetch(`${apiUrl}/api/request-password-reset/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'An unexpected error occurred.');
    }
  } catch (error) {
    console.error(error);
    throw new Error('Failed to reset password. Please try again.');
  }
};



