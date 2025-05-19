import React, { useState, useEffect } from "react";
import {
  Image,
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
import LinearGradient from "expo-linear-gradient";
import { googleAPi } from "../configs/variable";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { selectUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import Geocoder from "react-native-geocoding";
import * as Device from "expo-device";
import * as Location from "expo-location";
import { baseAPI } from "../services/types";
import * as Icons from "@expo/vector-icons"; // ✅ Fixed import
import tw from "twrnc";

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
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  const [imageInfo, setImageInfo] = useState<ImageInfoType | undefined>();

  const userLocation = async () => {
    if (Platform.OS === "android" && !Device.isDevice) {
      alert("Oops, this won't work on Snack in an Android Emulator. Try it on your device!");
      return;
    }
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
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

  const handleImagePickerResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) {
      alert("Image selection was canceled");
    } else {
      const selectedAsset = (result as ImagePicker.ImagePickerSuccessResult).assets[0];
      const { uri, type } = selectedAsset;
      setImageInfo({ uri, type: type || "", width: 0, height: 0 });
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location denied");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
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

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    handleImagePickerResult(result);
  };

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

      let formData = new FormData();
      formData.append("avatar" as any, {
        uri,
        type: blob.type,
        name: "image.jpg",
      } as any);
      formData.append("access_token", user?.token);
      formData.append("address", address);
      formData.append("first_name", first_name);
      formData.append("last_name", last_name);
      formData.append("phone", phone);

      const apiEndpoint = `${baseAPI}/customer/customer/profile/update/`;

      const apiResponse = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

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
      alert("Error updating profile. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#FCD34D", "#3B82F6"]} style={tw`flex-1`}>
      <Screen style={tw`flex-1`}>
        <ScrollView style={tw`flex-1`}>
          <View style={tw`px-5`}>
            <View style={tw`items-center justify-center mt-4`}>
              <View style={tw`rounded-full overflow-hidden w-48 h-48`}>
                {imageInfo && <Image source={{ uri: imageInfo.uri }} style={tw`w-48 h-48`} />}
              </View>
              <TouchableOpacity onPress={handleTakePhoto} style={tw`flex-row items-center mt-5 p-3 bg-blue-800 rounded-xl`}>
                <Icons.Ionicons name="camera" size={24} color="white" />
                <Text style={tw`text-white text-lg font-bold ml-2`}>Tire uma Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSelectPhoto} style={tw`flex-row items-center mt-4 p-3 bg-blue-800 rounded-xl`}>
                <Icons.Ionicons name="image" size={24} color="white" />
                <Text style={tw`text-white text-lg font-bold ml-2`}>Carregue sua Foto</Text>
              </TouchableOpacity>
            </View>

            {loading && (
              <ActivityIndicator style={tw`mt-4`} size="large" color="#0000ff" />
            )}

            <View style={tw`mt-4`}>
              <TextInput
                style={tw`bg-gray-100 border border-gray-300 rounded-lg p-4 mt-4`}
                placeholder="Primeiro Nome"
                autoCapitalize="none"
                onChangeText={setFirst_name}
                value={first_name}
                onSubmitEditing={Keyboard.dismiss}
              />
              <TextInput
                style={tw`bg-gray-100 border border-gray-300 rounded-lg p-4 mt-4`}
                placeholder="Último Nome"
                onChangeText={setLast_name}
                value={last_name}
                autoCapitalize="none"
                onSubmitEditing={Keyboard.dismiss}
              />
              <TextInput
                style={tw`bg-gray-100 border border-gray-300 rounded-lg p-4 mt-4`}
                placeholder="Número de Telefone"
                autoComplete="off"
                value={phone}
                onChangeText={setPhone}
                autoCapitalize="none"
                onSubmitEditing={Keyboard.dismiss}
              />

              <TouchableOpacity onPress={userUpdate} style={tw`bg-blue-900 rounded-lg mt-6 py-4 items-center`}>
                <Text style={tw`text-white text-lg font-bold`}>Atualize seu Perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`flex-row items-center mt-6 p-3 bg-blue-700 rounded-lg`}
                onPress={() => navigation.navigate("Order_History")}
              >
                <Icons.MaterialIcons name="history" size={24} color="white" />
                <Text style={tw`text-white text-lg font-bold ml-2`}>Histórico de pedidos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Screen>
    </LinearGradient>
  );
};

export default UserProfile;
