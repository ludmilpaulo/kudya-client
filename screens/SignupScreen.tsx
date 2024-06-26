import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { Eye, EyeOff } from "react-native-feather";
import { signup } from "../services/authService"; // Ensure this import points to your signup service
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from 'moti';
import { loginUser } from "../redux/slices/authSlice"; // Ensure correct path
import tailwind from "tailwind-react-native-classnames";
import ImagePicker from 'react-native-image-picker';

interface SignupData {
  username: string;
  email: string;
  password: string;
  name?: string;
  phone?: string;
  address?: string;
  logo?: {
    uri: string;
    type: string;
    name: string;
  };
  restaurant_license?: {
    uri: string;
    type: string;
    name: string;
  };
}

const SignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [signupData, setSignupData] = useState<SignupData>({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'client' | 'restaurant'>('client');

  const handleInputChange = (name: string, value: string) => {
    setSignupData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name: 'logo' | 'restaurant_license') => {
    ImagePicker.showImagePicker({}, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const file = {
          uri: response.uri,
          type: response.type,
          name: response.fileName,
        };
        setSignupData(prev => ({ ...prev, [name]: file }));
      }
    });
  };

  const handleSubmit = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const { status, data } = await signup(role, signupData);
      console.log("Received", data);

      if (status === 200 || status === 201) {
        dispatch(loginUser(data));
        Alert.alert("Sucesso", "Você se cadastrou com sucesso.");
        navigation.navigate(role === 'restaurant' ? 'RestaurantDashboard' : 'HomeScreen');
      } else {
        Alert.alert("Falha no Cadastro", data.message || "Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Erro de Rede", "Não foi possível conectar. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  return (
    <LinearGradient colors={['#FCB61A', '#0171CE']} style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: -100 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.formContainer}
      >
        <View style={styles.imageContainer}>
          <Image source={require("../assets/azul.png")} style={styles.logo} />
        </View>
        <Text style={styles.title}>Crie sua conta</Text>
        <TouchableOpacity onPress={() => navigation.navigate("LoginScreenUser")}>
          <Text style={styles.signupLink}>
            Já tem uma conta?{" "}
            <Text style={styles.signupText}>Faça login aqui</Text>
          </Text>
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Nome de usuário"
            value={signupData.username}
            onChangeText={text => handleInputChange('username', text)}
            style={styles.input}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            value={signupData.email}
            onChangeText={text => handleInputChange('email', text)}
            style={styles.input}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Senha"
            value={signupData.password}
            onChangeText={text => handleInputChange('password', text)}
            secureTextEntry={!showPassword}
            style={styles.input}
          />
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            {showPassword ? <EyeOff width={20} height={20} /> : <Eye width={20} height={20} />}
          </TouchableOpacity>
        </View>
      
        <TouchableOpacity onPress={handleSubmit} style={styles.signupButton} disabled={loading}>
          <Text style={styles.signupButtonText}>Inscreva-se</Text>
        </TouchableOpacity>
      </MotiView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowColor: '#000',
    shadowOffset: { height: 0, width: 0 }
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  logo: {
    width: 100,
    height: 100
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  signupLink: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20
  },
  signupText: {
    color: '#0077cc',
    textDecorationLine: 'underline'
  },
  inputContainer: {
    marginBottom: 10
  },
  input: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    width: '100%'
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 12,
    padding: 10
  },
  roleSelection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleButton: (selected: boolean) => ({
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: selected ? '#0077cc' : '#ccc',
    backgroundColor: selected ? '#0077cc' : '#fff',
    borderRadius: 5,
    alignItems: 'center',
  }),
  roleButtonText: {
    color: '#000',
  },
  fileButton: {
    width: '100%',
    padding: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: '#0077cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default SignupScreen;
