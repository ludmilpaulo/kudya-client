import React, { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Keyboard,
  ScrollView,
} from "react-native";
import Screen from "../components/Screen";
import tailwind from "tailwind-react-native-classnames";


import colors from "../configs/colors";
import { googleAPi } from "../configs/variable";

import * as ImagePicker from "expo-image-picker";

import { useNavigation } from "@react-navigation/native";

import { selectUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";

import Geocoder from "react-native-geocoding";
import * as Device from "expo-device";
import * as Location from "expo-location";


type ImageInfoType = {
  uri: string;
  width: number;
  height: number;
  type: string;
};

Geocoder.init(googleAPi);

const UserProfile = () => {
  const user = useSelector(selectUser);

  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");

  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const [Type, setType] = useState("");

  const navigation = useNavigation<any>();

  const [keyboardStatus, setKeyboardStatus] = useState(undefined);

  const userLocation = async () => {
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
    // dispatch(setLocation(location.coords))
    console.log(location.coords);

    Geocoder.from(location?.coords)
      .then((response) => {
        const formattedAddress = response.results[0].formatted_address;
        setAddress(formattedAddress);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    userLocation();

  }, []);

  const [imageInfo, setImageInfo] = useState<ImageInfoType | undefined>();

  const handleImagePickerResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) {
      // Handle the cancellation case
      alert("Image selection was canceled");
    } else {
      // Handle the success case
      const selectedAsset = (result as ImagePicker.ImagePickerSuccessResult).assets[0];
      const { uri, type } = selectedAsset;
      setImageInfo({ uri, type: type || '', width: 0, height: 0 });
    }
  };
  
  

  const handleTakePhoto = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location denied");
      return;
    }
  
    const result: ImagePicker.ImagePickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    handleImagePickerResult(result);
  };
  
  const handleSelectPhoto = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location denied");
      return;
    }
  
    const result: ImagePicker.ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    handleImagePickerResult(result);
  }


  const userUpdate = async () => {
    setLoading(true); 
    if (!imageInfo) {
      alert("Please select an image first");
      return;
    }
  
    const { uri } = imageInfo;
  
    try {
      const response = await fetch(uri);
  
      if (!response.ok) {
        console.error("Failed to fetch image");
        return;
      }
  
      const blob = await response.blob();
     
      // Create FormData
      let formData = new FormData();
      formData.append("avatar" as any, {
        uri,
        type: blob.type, // Set the type directly from the blob
        name: "image.jpg",
      } as any);
      formData.append("access_token", user?.token);
      formData.append("address", address);
      formData.append("first_name", first_name);
      formData.append("last_name", last_name);
      formData.append("phone", phone);
  
      // Make API request
      const apiEndpoint = "https://www.kudya.shop/api/customer/profile/update/";
  
      console.log("Sending API request to:", apiEndpoint);
  
      
  
      const apiResponse = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
  
      // Handle API response
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        alert(data.status);
        setLoading(false); 
        navigation.navigate("HomeScreen");
      } else {
        const errorData = await apiResponse.json();
        alert("" + errorData.non_field_errors);
        setLoading(false); 
      }
    } catch (error) {
      console.error(error);
      // Provide additional information or handle the error as needed
      alert("Error updating profile. Please try again later.");
      setLoading(false); 
    }
  };
  


  return (
    <>
    <>
  <ScrollView style={tailwind`flex-1`}>
    <View style={styles.wrapper}>
      <View style={tailwind`justify-center items-center`}>
        <View style={tailwind`rounded-full overflow-hidden w-48 h-48 mt-4`}>
          {imageInfo && (
            <Image
              source={{ uri: imageInfo.uri }}
              style={tailwind`w-48 h-48`}
            />
          )}
        </View>
        <TouchableOpacity onPress={() => handleTakePhoto()}>
          <Text style={styles.wellcomeTo}>Tire uma Foto{"\n"} ou </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSelectPhoto()}>
          <Text style={styles.brand}>Carregue sua Foto</Text>
        </TouchableOpacity>
      </View>
      {loading && (
        <ActivityIndicator style={tailwind`mt-4`} size="large" color="#0000ff" />
      )}
      <View>
        <View>
          <TextInput
            style={styles.input}
            placeholder="Primeiro Nome"
            autoCapitalize={"none"}
            onChangeText={(text) => setFirst_name(text)}
            value={first_name}
            onSubmitEditing={Keyboard.dismiss}
          />
          <TextInput
            style={styles.input}
            placeholder="Ultimo Nome"
            onChangeText={(text) => setLast_name(text)}
            value={last_name}
            autoCapitalize={"none"}
            onSubmitEditing={Keyboard.dismiss}
          />

          <TextInput
            style={styles.input}
            placeholder="Número de Telefone"
            autoComplete="off"
            value={phone}
            onChangeText={(text) => setPhone(text)}
            autoCapitalize={"none"}
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>

        <TouchableOpacity
          style={styles.containerbot}
          onPress={() => userUpdate()}
        >
          <Text style={styles.vamosJuntos}>Atualize seu Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  </ScrollView>
</>

    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    justifyContent: "center",
  },
  wrapper: {
    paddingHorizontal: 20,
  },
  logo: {
    height: 160,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 30,
  },
  wellcomeTo: {
    fontSize: 23,
    fontWeight: "700",
    color: colors.secondary,
    marginTop: 20,
    textAlign: "center",
  },
  brand: {
    fontSize: 23,
    color: colors.primary,
    textAlign: "center",
    fontWeight: "500",
  },
  form: {
    marginTop: 10,
  },
  join: {
    marginTop: 10,
    textAlign: "center",
    color: colors.black,
  },
  or: {
    color: colors.gray,
    textAlign: "center",
    marginVertical: 20,
  },
  containertest: {
    position: "relative",
  },
  input: {
    borderColor: colors.medium,
    backgroundColor: colors.light,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  inputError: {
    borderColor: colors.denger,
  },
  icon: {
    position: "absolute",
    right: 15,
    top: 32,
  },
  button: {
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 15,
    marginVertical: 5,
    marginTop: 15,
  },
  text: {
    color: colors.white,
    fontSize: 18,
    // textTransform: 'uppercase',
    fontWeight: "700",
  },

  containerbot: {
    backgroundColor: "rgba(0,74,173,1)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 15,
    marginVertical: 5,
    marginTop: 15,
  },
  containertext: {
    width: 159,
    // height: 42,
  },
  vamosJuntos: {
    color: colors.white,
    fontSize: 18,
    // textTransform: 'uppercase',
    fontWeight: "700",
  },
});

export default UserProfile;
