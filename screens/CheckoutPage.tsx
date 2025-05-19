import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, logoutUser } from '../redux/slices/authSlice';
import { selectCartItems, clearCart } from '../redux/slices/basketSlice';
import { fetchRestaurantDetails, fetchUserDetails, completeOrderRequest } from '../services/checkoutService';
import ProfileModal from '../components/ProfileModal';
import AddressInput from '../components/AddressInput';
import PaymentDetails from '../components/PaymentDetails';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../services/types'; // Ensure the correct path
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';

type CheckoutPageRouteProp = RouteProp<RootStackParamList, 'CheckoutPage'>;

const CheckoutPage: React.FC = () => {
  const [restaurant, setRestaurant] = useState<any | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({ latitude: 0, longitude: 0 });
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("Entrega");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(true);
  const [deliveryNotes, setDeliveryNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<any>();
  const route = useRoute<CheckoutPageRouteProp>(); // Use the typed useRoute hook
  const { restaurantId } = route.params;
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const allCartItems = useSelector(selectCartItems);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        Alert.alert(
          "Login Required",
          "You need to log in to access your cart and complete your purchase.",
          [
            {
              text: "Login",
              onPress: () => navigation.navigate("UserLogin"),
            },
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => navigation.goBack(),
            },
          ],
        );
      }
    }, [user, navigation]),
  );

  useEffect(() => {
    const fetchData = async () => {
      if (restaurantId) {
        try {
          const restaurantDetails = await fetchRestaurantDetails(restaurantId);
          setRestaurant(restaurantDetails);
        } catch (error) {
          console.error('Error fetching restaurant details:', error);
        }
      }

      if (user?.user_id && user?.token) {
        try {
          const details = await fetchUserDetails(user.user_id, user.token);
          setUserDetails(details);
          if (!details.avatar) {
            setIsProfileModalOpen(true);
          }
        } catch (error) {
          console.error('Erro ao buscar detalhes do usuário:', error);
          dispatch(logoutUser());
        }
      }
      getUserLocation();
    };

    fetchData();
  }, [restaurantId, user?.user_id, user?.token, dispatch]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permissão para acessar localização foi negada");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      Alert.alert("Não foi possível obter sua localização");
    }
  };

  const calculateDeliveryFee = () => {
    if (!restaurant || !location.latitude || !location.longitude) return 100; // Return minimum fee if data is missing

    const userLocation = { latitude: location.latitude, longitude: location.longitude }; // User location
    const restaurantLocation = { latitude: parseFloat(restaurant.location.split(',')[0]), longitude: parseFloat(restaurant.location.split(',')[1]) }; // Restaurant location
    const distance = getDistance(userLocation, restaurantLocation) / 1000; // Calculate distance in kilometers

    const additionalFee = distance * 20; // 20 Kz per km
    return additionalFee < 20 ? 100 : 100 + additionalFee; // Ensure minimum fee is 100 Kz
  };


  const completeOrder = async () => {
    setLoading(true);
    setError(null);
    const formattedCartItems = allCartItems.map((item) => ({
      meal_id: item.id,
      quantity: item.quantity,
    }));
    const resId = allCartItems.map(({ restaurant }) => restaurant);
    const restaurantId = resId[0].toString();
    const orderDetails = formattedCartItems;

    const orderData = {
      access_token: user.token,
      restaurant_id: restaurantId,
      address: useCurrentLocation ? `${location.latitude},${location.longitude}` : userAddress,
      order_details: orderDetails,
      payment_method: paymentMethod,
      delivery_notes: deliveryNotes,
      delivery_fee: deliveryFee,
      use_current_location: useCurrentLocation,
      location: location
    };

    try {
      const startTime = performance.now();
      const responseData = await completeOrderRequest(orderData);
      const endTime = performance.now();
      console.log(`completeOrderRequest took ${(endTime - startTime) / 1000} seconds`);

      if (responseData.status === "success") {
        dispatch(clearCart(parseInt(restaurantId)));
        Alert.alert("Pedido Realizado com Sucesso!");
        navigation.navigate("SuccessScreen");
      } else {
        Alert.alert("Erro", responseData.error || responseData.status);
      }
    } catch (error) {
      console.error('Error completing order:', error);
      setError("An error occurred while completing the order.");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = allCartItems.reduce((total, item) => total + item.price * item.quantity, 0);

 
  const deliveryFee = calculateDeliveryFee(); // Calculate delivery fee
  const finalPrice = totalPrice + deliveryFee; // Calculate final price

  return (
    <>
    <LinearGradient
      colors={['#FCD34D', '#3B82F6']}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={tw`flex-grow p-6`}>
        {restaurant && (
          <>
            <Text style={tw`text-3xl font-semibold mb-6 text-gray-800`}>{restaurant.name}</Text>
            <View style={tw`flex justify-center mb-6`}>
              <Image source={{ uri: restaurant.logo }} style={tw`w-50 h-50 rounded-lg`} />
            </View>
          </>
        )}

        <AddressInput useCurrentLocation={useCurrentLocation} setUseCurrentLocation={setUseCurrentLocation} userAddress={userAddress} setUserAddress={setUserAddress} />
        <PaymentDetails paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />

        <TextInput
          style={tw`w-full p-2 border border-gray-300 rounded mt-4`}
          placeholder="Notas de entrega para o motorista"
          value={deliveryNotes}
          onChangeText={(text) => setDeliveryNotes(text)}
        />

   

        <View style={tw`flex justify-between items-center my-4`}>
          <Text style={tw`text-lg font-semibold text-gray-800`}>Total: {totalPrice.toFixed(2)} Kz</Text>
          <Text style={tw`text-lg font-semibold text-gray-800`}>Taxa de Entrega: {deliveryFee.toFixed(2)} Kz</Text>
          <Text style={tw`text-lg font-semibold text-gray-800`}>Preço Final: {finalPrice.toFixed(2)} Kz</Text>
        </View>

        {loading && (
          <View style={tw`absolute top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50`}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        )}

        {error && <Text style={tw`text-red-500 text-center mb-4`}>{error}</Text>}

        <TouchableOpacity
          style={tw`flex items-center justify-center w-full h-10 my-4 bg-blue-600 text-white font-semibold rounded-full ${loading ? 'opacity-50' : 'hover:bg-blue-700'}`}
          onPress={completeOrder}
          disabled={loading}
        >
          <Text style={tw`text-center text-white`}>FAÇA SEU PEDIDO</Text>
        </TouchableOpacity>
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userDetails={userDetails}
          onUpdate={(updatedDetails: any) => setUserDetails(updatedDetails)}
        />
      </ScrollView>
    </LinearGradient>
    <Toast />
  </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContainer: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  restaurantLogoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  restaurantLogo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 16,
  },
  orderButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  orderButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CheckoutPage;