import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, ScrollView, TextInput } from 'react-native';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useAppNavigation } from '../navigation/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/authSlice';
import { selectCartItems, clearCart } from '../redux/slices/basketSlice';
import { fetchstoreDetails, fetchUserDetails, completeOrderRequest } from '../services/checkoutService';
import { fetchCheckoutQuote } from '../features/marketplace/api/checkoutApi';
import ProfileModal, { ProfileFormDetails } from '../components/ProfileModal';
import AddressInput from '../components/AddressInput';
import PaymentDetails from '../components/PaymentDetails';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/navigation';
import * as Location from 'expo-location';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';
import { initializePayment, uploadPaymentProof } from '../services/paymentService';

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
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [proofName, setProofName] = useState<string | null>(null);
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
          const details = await fetchUserDetails(user.user_id, user.token || '');
          setUserDetails(details);
          if (!details?.avatar) setIsProfileModalOpen(true);
        } catch {
          // The profile prefill is optional for checkout. A failure here must
          // not end the session — doing so would clear the token and block
          // order placement.
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

  const pickProof = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setProofUri(asset.uri);
    setProofName(asset.name);
  };

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
        const orderId =
          typeof responseData.order_id === 'number'
            ? responseData.order_id
            : Array.isArray(responseData.created_orders)
              ? Number(responseData.created_orders[0])
              : undefined;
        if (paymentMethod && paymentMethod !== 'cash' && user.token) {
          try {
            const pay = await initializePayment(user.token, {
              amount: finalPrice,
              method: paymentMethod,
              phone: paymentPhone || undefined,
              service_type: 'order',
              object_id: orderId,
            });
            if (proofUri && pay.requires_action === 'upload_proof' && pay.payment_id) {
              await uploadPaymentProof(user.token, pay.payment_id, {
                uri: proofUri,
                name: proofName || 'proof.jpg',
                type: 'image/jpeg',
              });
            }
            if (pay.customer_message) {
              Alert.alert('Pagamento', pay.customer_message);
            }
          } catch {
            Alert.alert(
              'Pedido criado',
              'Complete o pagamento a partir dos seus pedidos se for pedido.',
            );
          }
        }
        dispatch(clearCart(parseInt(orderStoreId, 10)));
        // Toast works on web too (Alert.alert is a no-op on React Native Web),
        // so the customer always gets confirmation feedback.
        Toast.show({ type: 'success', text1: 'Pedido Realizado com Sucesso!' });
        Alert.alert('Pedido Realizado com Sucesso!');
        navigation.navigate('SuccessScreen');
      } else {
        const errorMessage = responseData.error || responseData.status || 'Erro ao criar o pedido.';
        setError(errorMessage);
        Toast.show({ type: 'error', text1: 'Erro', text2: errorMessage });
        Alert.alert('Erro', errorMessage);
      }
    } catch {
      const message = 'An error occurred while completing the order.';
      setError(message);
      Toast.show({ type: 'error', text1: 'Erro', text2: message });
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
          <PaymentDetails
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            phone={paymentPhone}
            setPhone={setPaymentPhone}
            proofName={proofName}
            onPickProof={() => void pickProof()}
          />

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
