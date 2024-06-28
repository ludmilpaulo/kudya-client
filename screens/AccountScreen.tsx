import React, { useState, useEffect } from "react";
import { View, Image, Text, TouchableOpacity, ScrollView } from "react-native";
import Screen from "../components/Screen";
import tailwind from "tailwind-react-native-classnames";
import AppHead from "../components/AppHead";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { logoutUser, selectUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { baseAPI } from "../services/types";
import { fetchUserDetails } from "../services/checkoutService";

const AccountScreen = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const url = baseAPI;
  const [username, setUsername] = useState<string | undefined>();
  const [userPhoto, setUserPhoto] = useState<string>("");
  const [userPhone, setUserPhone] = useState<string>("");
  const [userAddress, setUserAddress] = useState<string>("");
  const [userId, setUserId] = useState<any>();
  const navigation = useNavigation<any>();
  const customer_avatar = `${userPhoto}`;
  const customer_image = `${url}${customer_avatar}`;

  const pickUser = async () => {
    if (user?.user_id && user?.token) {
      try {
        const details = await fetchUserDetails(user.user_id, user.token);
        setUserPhone(details.phone);
        setUserAddress(details.address);
        setUserPhoto(details.avatar);
      } catch (error) {
        console.error('Erro ao buscar detalhes do usuário:', error);
        dispatch(logoutUser());
      }
    }
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
      navigation.navigate("OrderHistory");
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
    <LinearGradient colors={['#FCD34D', '#3B82F6']} style={{ flex: 1 }}>
      <Screen style={tailwind`flex-1`}>
      <TouchableOpacity onPress={onLogout} style={tailwind`flex-row items-center my-3`}>
              <AntDesign name="logout" size={24} color="red" />
              <Text style={tailwind`text-white ml-5`}>Sair</Text>
            </TouchableOpacity>
        <ScrollView contentContainerStyle={tailwind`flex-1`}>
          <View style={tailwind`justify-center items-center mt-6`}>
            <View style={tailwind`rounded-full overflow-hidden w-48 h-48 mt-4`}>
              <Image source={{ uri: customer_image }} style={tailwind`w-48 h-48`} />
            </View>
            <Text style={tailwind`mt-4 text-3xl font-bold text-white`}>{username}</Text>
          </View>
          <View style={tailwind`mx-4 border-t border-t-2 mt-5 border-gray-100`}>
            <Text style={tailwind`text-white mt-2 text-lg mb-2`}>Suas informações</Text>
            <SavedPlaces
              title="Endereço"
              text={userAddress}
              Icon={() => <AntDesign name="home" size={24} color="white" />}
            />
            <SavedPlaces
              title="Telefone"
              text={userPhone}
              Icon={() => <AntDesign name="phone" size={24} color="white" />}
            />
          </View>
          <View style={tailwind`mx-4 border-t border-t-2 mt-5 border-gray-100`}>
            <Text style={tailwind`text-white mt-2 text-lg`}>Outras opções</Text>
            <TouchableOpacity onPress={orderProfile} style={tailwind`flex-row items-center my-3`}>
              <MaterialIcons name="history" size={24} color="white" />
              <Text style={tailwind`text-white ml-5`}>Histórico de pedidos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={editProfile} style={tailwind`flex-row items-center my-3`}>
              <Ionicons name="person-circle" size={24} color="white" />
              <Text style={tailwind`text-white ml-5`}>Editar Perfil</Text>
            </TouchableOpacity>
            
          </View>
        </ScrollView>
      </Screen>
    </LinearGradient>
  );
};

export default AccountScreen;

type SavedPlacesProps = {
  title: string;
  text: string;
  Icon: React.ComponentType;
};

const SavedPlaces: React.FC<SavedPlacesProps> = ({ title, text, Icon }) => (
  <View style={tailwind`flex-row items-center my-3`}>
    <Icon />
    <View style={tailwind`ml-5`}>
      <Text style={tailwind`text-white`}>{title}</Text>
      <Text style={tailwind`text-white text-xs mt-1`}>{text}</Text>
    </View>
  </View>
);
