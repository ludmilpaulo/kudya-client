import React, { useState, useEffect, useRef, useContext } from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";
import Screen from "../components/Screen";
import tailwind from "tailwind-react-native-classnames";
import AppHead from "../components/AppHead";

import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

import { logoutUser, selectUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";

import { useNavigation } from "@react-navigation/native";
import * as Updates from "expo-updates";

const AccountScreen = () => {
  const user = useSelector(selectUser);

  const dispatch = useDispatch();

  const url = "https://www.sunshinedeliver.com";

  const [username, setUsername] = useState();
  const [userPhoto, setUserPhoto] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userId, setUserId] = useState<any>();
  const navigation = useNavigation<any>();

  const customer_avatar = `${userPhoto}`;
  const customer_image = `${url}${customer_avatar}`;

  const pickUser = async () => {
    let response = await fetch(
      "https://www.sunshinedeliver.com/api/customer/profile/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      }
    )
      .then((response) => response.json())
      .then((responseJson) => {
        setUserPhone(responseJson.customer_detais.phone);
        setUserAddress(responseJson.customer_detais.address);
        setUserPhoto(responseJson.customer_detais.avatar);
      })
      .catch((error) => {
        // console.error(error);
      });
  };

  useEffect(() => {
    pickUser();
    setUserId(user?.user_id);
    setUsername(user?.username);
  }, [userPhone, userAddress, userId]);

  const editProfile = async () => {
    try {
      navigation.navigate("UserProfile");
    } catch (e) {
      console.log(e);
    }
  };

  const orderProfile = async () => {
    try {
      navigation.navigate("Order_History");
    } catch (e) {
      console.log(e);
    }
  };

  const onLogout = async () => {
    try {
      dispatch(logoutUser());
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Screen style={tailwind`flex-1`}>
      <AppHead title={`Conta`} icon="settings-outline" />
      <View style={tailwind`justify-center items-center`}>
        <View style={tailwind`rounded-full overflow-hidden w-48 h-48 mt-4`}>
          <Image source={{ uri: customer_image }} style={tailwind`w-48 h-48`} />
        </View>
        <Text style={tailwind`mt-4 text-3xl font-bold`}>{username}</Text>
        <Text style={tailwind`text-lg text-indigo-900`}></Text>
      </View>
      <View style={tailwind`mx-4 border-t border-t-2 mt-5 border-gray-100`}>
        <Text style={tailwind`text-gray-800 mt-2 text-lg mb-2`}>
          Suas informações
        </Text>
        <SavedPlaces
          title="address"
          text={userAddress}
          Icon={() => <AntDesign name="home" size={24} color="black" />}
        />
        <SavedPlaces
          title="Telefone"
          text={userPhone}
          Icon={() => <AntDesign name="phone" size={24} color="black" />}
        />
      </View>
      <View style={tailwind`mx-4 border-t border-t-2 mt-5 border-gray-100`}>
        <Text style={tailwind`text-gray-800 mt-2 text-lg`}>Outras opções</Text>

        {/*      <TouchableOpacity onPress={() => orderProfile()}>
                    <Text style={tailwind`text-green-900 mt-2`}>Histórico de pedidos</Text>
                </TouchableOpacity>*/}

        <TouchableOpacity onPress={() => editProfile()}>
          <Text style={tailwind`text-green-900 mt-2`}>Edit o Seu Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onLogout()}>
          <Text style={tailwind`text-green-900 mt-2`}>Sair</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

export default AccountScreen;

const SavedPlaces = ({
  title,
  text,
  Icon,
}: {
  title: any;
  text: any;
  Icon: any;
}) => (
  <TouchableOpacity
    style={tailwind`flex-row items-center my-3`}
    //  onPress={() => editProfile()}
  >
    <Icon />
    <View style={tailwind`ml-5`}>
      <Text style={tailwind`text-gray-800`}>{title}</Text>
      <Text style={tailwind`text-gray-600 text-xs mt-1`}>{text}</Text>
    </View>
  </TouchableOpacity>
);
