import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  Keyboard,
} from "react-native";
import Screen from "../components/Screen";
import tailwind from "tailwind-react-native-classnames";
import AppHead from "../components/AppHead";

import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

import colors from "../configs/colors";
import { googleAPi } from "../configs/variable";

import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import {
  launchCamera,
  launchImageLibrary,
  Asset,
} from "react-native-image-picker";

import { useNavigation } from "@react-navigation/native";
import * as Updates from "expo-updates";

import { logoutUser, selectUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import Geocoder from "react-native-geocoding";
import * as Device from "expo-device";
import * as Location from "expo-location";
import { Camera } from "expo-camera";

type ImageInfo = {
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

    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardStatus("Keyboard Shown");
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardStatus("Keyboard Hidden");
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const [imageInfo, setImageInfo] = useState<ImageInfo | undefined>();

  const handleTakePhoto = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    //let { status } = await Camera.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access camera denied");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.cancelled) {
      setImageInfo(result);
    }
  };

  const handleSelectPhoto = async () => {
    const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
    if (status !== "granted") {
      alert("Permission to access media library denied");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.cancelled) {
      setImageInfo(result);
    }
  };

  const userUpdate = async () => {
    // ImagePicker saves the taken photo to disk and returns a local URI to it
    if (!imageInfo) {
      alert("Please select an image first");
      return;
    }
    const { uri, type } = imageInfo;

    // Upload the image using the fetch and FormData APIs
    let formData = new FormData();
    // Assume "photo" is the name of the form field the server expects
    formData.append("avatar", { uri, type, name: "image.jpg" });
    formData.append("access_token", user?.token);
    formData.append("address", address);
    formData.append("first_name", first_name);
    formData.append("last_name", last_name);
    formData.append("phone", phone);

    console.log("shool ==>", formData);

    // try {
    let response = await fetch(
      "https://www.sunshinedeliver.com/api/customer/profile/update/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      }
    );
    //response = await response.json();

    if (response.status == 200) {
      let data = await response.json();

      alert(data.status);
      navigation.navigate("HomeScreen");
      return true;
    } else {
      let resp = await response.json();
      alert("" + resp.non_field_errors);
      console.log("err", resp);
    }
    //  } catch (e) {
    //  console.log("alila", e);
    // alert("O usuário não existe, inscreva-se ou tente fazer login novamente");

    Updates.reloadAsync();
    //  }
  };

  return (
    <>
      <Screen style={tailwind`flex-1 `}>
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
                autoCompleteType="off"
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
      </Screen>
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
