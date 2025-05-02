import React, { useState, useEffect } from "react";
import { View, Image, Text, TouchableOpacity, ScrollView } from "react-native";
import Screen from "../components/Screen";
import AppHead from "../components/AppHead";
import LinearGradient from "expo-linear-gradient";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { logoutUser, selectUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { baseAPI } from "../services/types";
import { fetchUserDetails } from "../services/checkoutService";
import tw from "twrnc";

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
  const customer_image = `${url}${userPhoto}`;

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

  const editProfile = () => navigation.navigate("UserProfile");
  const orderProfile = () => navigation.navigate("OrderHistory");
  const onLogout = () => dispatch(logoutUser());

  return (
    <LinearGradient colors={['#FCD34D', '#3B82F6']} style={tw`flex-1`}>
      <Screen style={tw`flex-1`}>
        <TouchableOpacity onPress={onLogout} style={tw`flex-row items-center my-3 px-5`}>
          <AntDesign name="logout" size={24} color="red" />
          <Text style={tw`text-white ml-5`}>Sair</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={tw`pb-10`}>
          <View style={tw`items-center mt-6`}>
            <View style={tw`rounded-full overflow-hidden w-48 h-48`}>
              <Image source={{ uri: customer_image }} style={tw`w-48 h-48`} />
            </View>
            <Text style={tw`mt-4 text-3xl font-bold text-white`}>{username}</Text>
          </View>

          <View style={tw`mx-4 mt-6 border-t border-gray-100`}>
            <Text style={tw`text-white mt-3 text-lg mb-2`}>Suas informações</Text>
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

          <View style={tw`mx-4 mt-6 border-t border-gray-100`}>
            <Text style={tw`text-white mt-3 text-lg mb-2`}>Outras opções</Text>

            <TouchableOpacity onPress={orderProfile} style={tw`flex-row items-center my-3`}>
              <MaterialIcons name="history" size={24} color="white" />
              <Text style={tw`text-white ml-5`}>Histórico de pedidos</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={editProfile} style={tw`flex-row items-center my-3`}>
              <Ionicons name="person-circle" size={24} color="white" />
              <Text style={tw`text-white ml-5`}>Editar Perfil</Text>
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
  <View style={tw`flex-row items-center my-3`}>
    <Icon />
    <View style={tw`ml-5`}>
      <Text style={tw`text-white`}>{title}</Text>
      <Text style={tw`text-white text-xs mt-1`}>{text}</Text>
    </View>
  </View>
);
