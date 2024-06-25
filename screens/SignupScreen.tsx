import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import tailwind from "tailwind-react-native-classnames";
import { Eye, EyeOff } from "react-native-feather";
import { signup } from "../services/authService";
import { loginUser } from "../redux/slices/authSlice";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { RootStackParamList } from "../services/types"; // Import your navigation types

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();

  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    logo: null as File | null,
    restaurant_license: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [licencaLoading, setLicencaLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"client" | "restaurant">("client");

  const handleRoleChange = (value: "client" | "restaurant") => {
    setRole(value);
  };

  const handleInputChange = (name: string, value: string) => {
    setSignupData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (name: string, file: File | null) => {
    if (name === "logo") {
      setLogoLoading(true);
      setTimeout(() => {
        setSignupData((prevState) => ({ ...prevState, [name]: file }));
        setLogoLoading(false);
      }, 2000);
    } else if (name === "restaurant_license") {
      setLicencaLoading(true);
      setTimeout(() => {
        setSignupData((prevState) => ({ ...prevState, [name]: file }));
        setLicencaLoading(false);
      }, 2000);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { status, data } = await signup(role, signupData);

      if (status === 201 || data.status === "201") {
        dispatch(loginUser(data));
        Alert.alert("Success", "Você se conectou com sucesso. Agora você pode saborear sua refeição.");
        if (role === "restaurant") {
          navigation.navigate("RestaurantDashboard");
        } else {
          navigation.navigate("HomeScreen");
        }
      } else {
        handleErrorResponse(status, data);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Ocorreu um erro inesperado. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleErrorResponse = (status: number, data: any) => {
    switch (status) {
      case 400:
        Alert.alert("Erro", data.message || "Requisição inválida.");
        break;
      case 401:
        Alert.alert("Erro", data.message || "Não autorizado.");
        break;
      case 404:
        Alert.alert("Erro", data.message || "Recurso não encontrado.");
        break;
      case 200:
        Alert.alert("Sucesso", data.message || "Você se conectou com sucesso. Agora você pode saborear sua refeição.");
        break;
      default:
        Alert.alert("Erro", data.message || "Ocorreu um erro.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <LinearGradient colors={['#FCB61A', '#0171CE']} style={tailwind`flex-1 justify-center items-center`}>
      <ScrollView contentContainerStyle={tailwind`flex-1 justify-center items-center px-4 py-16`}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 500 }}
          style={tailwind`w-full p-10 mt-16 bg-white rounded-lg shadow-lg lg:w-1/3 md:w-1/2`}
        >
          <View style={tailwind`flex justify-center mb-6 items-center`}>
            <Image source={require("../assets/azul.png")} style={tailwind`w-32 h-32`} />
          </View>
          <Text style={tailwind`text-2xl font-extrabold leading-6 text-gray-800 text-center mb-4`}>
            Inscreva-se Para ter uma Conta
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("LoginScreenUser")}>
            <Text style={tailwind`mt-4 text-sm font-medium leading-none text-gray-500 text-center`}>
              Se você tem uma conta?{" "}
              <Text style={tailwind`text-sm font-medium leading-none text-indigo-700 underline`}>
                Entre aqui
              </Text>
            </Text>
          </TouchableOpacity>
          <View style={tailwind`my-6 flex-row justify-center`}>
            <TouchableOpacity onPress={() => handleRoleChange("client")} style={tailwind`mr-4`}>
              <Text style={tailwind`text-lg ${role === "client" ? "text-indigo-700 underline" : "text-gray-500"}`}>
                Cliente
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRoleChange("restaurant")}>
              <Text style={tailwind`text-lg ${role === "restaurant" ? "text-indigo-700 underline" : "text-gray-500"}`}>
                Fornecedor de Negócio
              </Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={tailwind`flex items-center justify-center`}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : (
            <View style={tailwind`flex flex-col space-y-4`}>
              <TextInput
                placeholder="Usuário"
                onChangeText={(text) => handleInputChange("username", text)}
                style={tailwind`p-2 border rounded`}
              />
              <TextInput
                placeholder="Email"
                keyboardType="email-address"
                onChangeText={(text) => handleInputChange("email", text)}
                style={tailwind`p-2 border rounded`}
              />
              <View style={tailwind`relative`}>
                <TextInput
                  placeholder="Senha"
                  secureTextEntry={!showPassword}
                  onChangeText={(text) => handleInputChange("password", text)}
                  style={tailwind`w-full p-2 border rounded`}
                />
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={tailwind`absolute inset-y-0 right-0 flex items-center justify-center h-full px-3`}
                >
                  {showPassword ? <EyeOff width={20} height={20} /> : <Eye width={20} height={20} />}
                </TouchableOpacity>
              </View>
              {role === "restaurant" && (
                <>
                  <TextInput
                    placeholder="Nome do Fornecedor ou do Negócio"
                    onChangeText={(text) => handleInputChange("name", text)}
                    style={tailwind`p-2 border rounded`}
                  />
                  <TextInput
                    placeholder="Telefone"
                    keyboardType="phone-pad"
                    onChangeText={(text) => handleInputChange("phone", text)}
                    style={tailwind`p-2 border rounded`}
                  />
                  <TextInput
                    placeholder="Endereço"
                    onChangeText={(text) => handleInputChange("address", text)}
                    style={tailwind`p-2 border rounded`}
                  />
                  <View style={tailwind`relative`}>
                    <TextInput
                      placeholder="Carregar o Logo"
                      editable={false}
                      style={tailwind`p-2 border rounded bg-gray-200 text-gray-400`}
                    />
                    <TouchableOpacity
                      onPress={() => handleFileChange("logo", signupData.logo)}
                      style={tailwind`absolute inset-y-0 right-0 flex items-center justify-center h-full px-3`}
                    >
                      {logoLoading ? (
                        <ActivityIndicator size="small" color="#0000ff" />
                      ) : (
                        <Text style={tailwind`text-indigo-700`}>Carregar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={tailwind`relative`}>
                    <TextInput
                      placeholder="Carregar a Licença"
                      editable={false}
                      style={tailwind`p-2 border rounded bg-gray-200 text-gray-400`}
                    />
                    <TouchableOpacity
                      onPress={() => handleFileChange("restaurant_license", signupData.restaurant_license)}
                      style={tailwind`absolute inset-y-0 right-0 flex items-center justify-center h-full px-3`}
                    >
                      {licencaLoading ? (
                        <ActivityIndicator size="small" color="#0000ff" />
                      ) : (
                        <Text style={tailwind`text-indigo-700`}>Carregar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
              <TouchableOpacity
                onPress={handleSubmit}
                style={tailwind`w-full py-4 text-sm font-semibold leading-none text-white bg-indigo-700 rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700`}
              >
                <Text>Inscreva-se Agora</Text>
              </TouchableOpacity>
            </View>
          )}
        </MotiView>
      </ScrollView>
    </LinearGradient>
  );
};

export default SignupScreen;
