import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import tailwind from 'tailwind-react-native-classnames';
import { selectUser, logoutUser } from '../redux/slices/authSlice';
import { selectCartItems, clearCart } from '../redux/slices/basketSlice';
import { fetchRestaurantDetails, fetchUserDetails, completeOrderRequest } from '../services/checkoutService';
import ProfileModal from '../components/ProfileModal';
import AddressInput from '../components/AddressInput';
import PaymentDetails from '../components/PaymentDetails';

const CheckoutPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({ latitude: 0, longitude: 0 });
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("Entrega");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { restaurant_id: restaurantId } = route.params;
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const allCartItems = useSelector(selectCartItems);

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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          Alert.alert("Não foi possível obter sua localização");
        },
      );
    } else {
      Alert.alert("Geolocalização não é suportada pelo seu navegador.");
    }
  };

  const completeOrder = async () => {
    console.log("order");
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
    };
    console.log("order data=>", orderData);

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
        Alert.alert(responseData.status);
      }
    } catch (error) {
      console.error('Error completing order:', error);
      setError("An error occurred while completing the order.");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <ScrollView contentContainerStyle={tailwind`p-6 bg-white rounded-lg shadow-md`}>
      {restaurant && (
        <>
          <Text style={tailwind`text-3xl font-semibold mb-6 text-gray-800`}>Checkout - {restaurant.name}</Text>
          <View style={tailwind`flex justify-center mb-6`}>
            <Image source={{ uri: restaurant.logo }} style={tailwind`w-48 h-48 rounded-lg`} />
          </View>
        </>
      )}

      <AddressInput
        useCurrentLocation={useCurrentLocation}
        setUseCurrentLocation={setUseCurrentLocation}
        userAddress={userAddress}
        setUserAddress={setUserAddress}
      />
      <PaymentDetails paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />

      <View style={tailwind`flex justify-between items-center my-4`}>
        <Text style={tailwind`text-lg font-semibold text-gray-800`}>Total: {totalPrice} Kz</Text>
      </View>

      {loading && (
        <View style={tailwind`absolute top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50`}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      {error && <Text style={tailwind`text-red-500 text-center mb-4`}>{error}</Text>}

      <TouchableOpacity
        style={tailwind`flex items-center justify-center w-full h-10 my-4 bg-blue-600 text-white font-semibold rounded-full ${loading ? 'opacity-50' : 'hover:bg-blue-700'}`}
        onPress={completeOrder}
        disabled={loading}
      >
        <Text>FAÇA SEU PEDIDO</Text>
      </TouchableOpacity>
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userDetails={userDetails}
        onUpdate={(updatedDetails: any) => setUserDetails(updatedDetails)}
      />
    </ScrollView>
  );
};

export default CheckoutPage;
