import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, logoutUser } from '../redux/slices/authSlice';
import { selectCartItems, clearCart } from '../redux/slices/basketSlice';
import { fetchRestaurantDetails, fetchUserDetails, completeOrderRequest } from '../services/checkoutService';
import ProfileModal from '../components/ProfileModal';
import AddressInput from '../components/AddressInput';
import PaymentDetails from '../components/PaymentDetails';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../services/types'; // Ensure the correct path

type CheckoutPageRouteProp = RouteProp<RootStackParamList, 'CheckoutPage'>;

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
  const navigation = useNavigation<any>();
  const route = useRoute<CheckoutPageRouteProp>(); // Use the typed useRoute hook
  const { restaurantId } = route.params;
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
    <LinearGradient colors={['#FCD34D', '#3B82F6']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {restaurant && (
          <>
            <Text style={styles.headerText}>Checkout - {restaurant.name}</Text>
            <View style={styles.restaurantLogoContainer}>
              <Image source={{ uri: restaurant.logo }} style={styles.restaurantLogo} />
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
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total: {totalPrice} Kz</Text>
        </View>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TouchableOpacity
          style={[styles.orderButton, loading && styles.disabledButton]}
          onPress={completeOrder}
          disabled={loading}
        >
          <Text style={styles.orderButtonText}>FAÇA SEU PEDIDO</Text>
        </TouchableOpacity>
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userDetails={userDetails}
          onUpdate={(updatedDetails: any) => setUserDetails(updatedDetails)}
        />
      </ScrollView>
    </LinearGradient>
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
