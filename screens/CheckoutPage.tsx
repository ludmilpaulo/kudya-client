import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, ScrollView, TextInput } from 'react-native';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useAppNavigation } from '../navigation/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, logoutUser } from '../redux/slices/authSlice';
import { selectCartItems, clearCart } from '../redux/slices/basketSlice';
import { fetchstoreDetails, fetchUserDetails, completeOrderRequest } from '../services/checkoutService';
import { fetchCheckoutQuote } from '../features/marketplace/api/checkoutApi';
import ProfileModal, { ProfileFormDetails } from '../components/ProfileModal';
import AddressInput from '../components/AddressInput';
import PaymentDetails from '../components/PaymentDetails';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/navigation';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';

type CheckoutPageRouteProp = RouteProp<RootStackParamList, 'Checkout'>;

type CheckoutStore = {
  name: string;
  logo: string;
  location: string;
};

const CheckoutPage: React.FC = () => {
  const [store, setstore] = useState<CheckoutStore | null>(null);
  const [userAddress, setUserAddress] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({ latitude: 0, longitude: 0 });
  const [userDetails, setUserDetails] = useState<ProfileFormDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Entrega');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const navigation = useAppNavigation();
  const route = useRoute<CheckoutPageRouteProp>();
  const { storeId } = route.params;
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const allCartItems = useSelector(selectCartItems);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        Alert.alert(
          'Login Required',
          'You need to log in to access your cart and complete your purchase.',
          [
            { text: 'Login', onPress: () => navigation.navigate('UserLogin') },
            { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
          ],
        );
      }
    }, [user, navigation]),
  );

  useEffect(() => {
    const fetchData = async () => {
      if (storeId) {
        try {
          const storeDetails = await fetchstoreDetails(storeId);
          setstore(storeDetails);
          const quote = await fetchCheckoutQuote(storeId);
          setDeliveryFee(Number(quote.delivery_fee) || 0);
        } catch {
          setError('Unable to load checkout.');
        }
      }
      if (user?.user_id) {
        try {
          const details = await fetchUserDetails(user.user_id, '');
          setUserDetails(details);
          if (!details.avatar) setIsProfileModalOpen(true);
        } catch {
          dispatch(logoutUser());
        }
      }
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        }
      } catch {
        // location optional
      }
    };
    void fetchData();
  }, [storeId, user?.user_id, dispatch]);

  const completeOrder = async () => {
    if (!user?.token) {
      Alert.alert('Login Required', 'You need to log in to complete your purchase.');
      return;
    }
    setLoading(true);
    setError(null);
    const formattedCartItems = allCartItems.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
    }));
    const resId = allCartItems.map(({ store: cartStore }) => cartStore);
    const orderStoreId = resId[0].toString();
    try {
      const responseData = await completeOrderRequest({
        access_token: user.token,
        store_id: orderStoreId,
        address: useCurrentLocation ? `${location.latitude},${location.longitude}` : userAddress,
        order_details: formattedCartItems,
        payment_method: paymentMethod,
        delivery_notes: deliveryNotes,
        delivery_fee: String(deliveryFee),
        use_current_location: useCurrentLocation,
        location,
      });
      if (responseData.status === 'success') {
        dispatch(clearCart(parseInt(orderStoreId, 10)));
        Alert.alert('Pedido Realizado com Sucesso!');
        navigation.navigate('SuccessScreen');
      } else {
        Alert.alert('Erro', responseData.error || responseData.status);
      }
    } catch {
      setError('An error occurred while completing the order.');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = allCartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const finalPrice = totalPrice + deliveryFee;

  return (
    <>
      <LinearGradient colors={['#FCD34D', '#3B82F6']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={tw`flex-grow p-6`}>
          {store ? (
            <>
              <Text style={tw`text-3xl font-semibold mb-6 text-gray-800`}>{store.name}</Text>
              <View style={tw`flex justify-center mb-6`}>
                <Image source={{ uri: store.logo }} style={tw`w-50 h-50 rounded-lg`} />
              </View>
            </>
          ) : null}

          <AddressInput
            useCurrentLocation={useCurrentLocation}
            setUseCurrentLocation={setUseCurrentLocation}
            userAddress={userAddress}
            setUserAddress={setUserAddress}
          />
          <PaymentDetails paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />

          <TextInput
            style={tw`w-full p-2 border border-gray-300 rounded mt-4`}
            placeholder="Notas de entrega para o motorista"
            value={deliveryNotes}
            onChangeText={setDeliveryNotes}
          />

          <View style={tw`flex justify-between items-center my-4`}>
            <Text style={tw`text-lg font-semibold text-gray-800`}>Total: {totalPrice.toFixed(2)}</Text>
            <Text style={tw`text-lg font-semibold text-gray-800`}>Taxa de Entrega: {deliveryFee.toFixed(2)}</Text>
            <Text style={tw`text-lg font-semibold text-gray-800`}>Preço Final: {finalPrice.toFixed(2)}</Text>
          </View>

          {loading ? (
            <View style={tw`absolute top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50`}>
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : null}

          {error ? <Text style={tw`text-red-500 text-center mb-4`}>{error}</Text> : null}

          <TouchableOpacity
            style={tw`flex items-center justify-center w-full h-10 my-4 bg-blue-600 rounded-full ${loading ? 'opacity-50' : ''}`}
            onPress={completeOrder}
            disabled={loading}
          >
            <Text style={tw`text-center text-white`}>FAÇA SEU PEDIDO</Text>
          </TouchableOpacity>
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            userDetails={userDetails}
            onUpdate={(updatedDetails: ProfileFormDetails) => setUserDetails(updatedDetails)}
          />
        </ScrollView>
      </LinearGradient>
      <Toast />
    </>
  );
};

export default CheckoutPage;
