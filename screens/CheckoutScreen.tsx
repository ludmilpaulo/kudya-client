import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectBasketItems, clearBasket } from '../redux/slices/basketSlice';
import { RootState } from '../redux/types';
import { selectUser } from '../redux/slices/authSlice';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import { View, TouchableOpacity, Platform, Text  } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import tailwind from 'tailwind-react-native-classnames';
import { userLocation } from '../configs/variable';

type OrderDetail = {
  meal_id: number;
  quantity: number;
};

// Define the type for the navigation prop
type NavigationProps = {
  navigation: any; // You can adjust the type parameters as needed
};

const CheckoutScreen = ({ navigation }: NavigationProps) => {
  const dispatch = useDispatch();
  const mapRef = useRef();

  const [userAddress, setUserAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const [showPaymentButton, setShowPaymentButton] = useState(false);

  const user = useSelector(selectUser);
  const allCartItems = useSelector((state: RootState) => selectBasketItems(state));

  // Define a function to fetch the user location
  const fetchUserLocation = async () => {
    if (Platform.OS === 'android' && !Device.isDevice) {
      alert(
        'Oops, this will not work on Snack in an Android Emulator. Try it on your device!'
      );
      return;
    }
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    return location.coords;
  };

  const [initialRegion, setInitialRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  // Fetch the user location and set the initialRegion
  useEffect(() => {
    fetchUserLocation().then((location) => {
      setInitialRegion({
        latitude: location ? location.latitude : 0,
        longitude: location ? location.longitude : 0,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    });
  }, []);

  // Extract resId values into an array
  const restaurantIds: number[] = allCartItems.map((item) => item.resId);

  console.log(initialRegion);

  // Define the structure for order_details
  // Initialize groupedItems as an empty object with a specific type
  const groupedItems: Record<number, { resId: number; order_details: OrderDetail[] }> = {};

  // Group items by restaurant (resId)
  allCartItems.forEach((item) => {
    if (!groupedItems[item.resId]) {
      groupedItems[item.resId] = {
        resId: item.resId,
        order_details: [],
      };
    }
    groupedItems[item.resId].order_details.push({
      meal_id: item.id,
      quantity: item.quantity,
    });
  });

  // Get an array of grouped items
  const transformedOrderDetails = Object.values(groupedItems);

  console.log(transformedOrderDetails);

  const completeOrder = async () => {
    if (!userAddress) {
      alert('Por favor Preencha o Endereço de Entrega');
    } else {
      try {
        const uniqueRestaurantId = allCartItems.length > 0 ? allCartItems[0].resId : null;
  
        if (!uniqueRestaurantId) {
          alert('No items in the cart or unable to determine the restaurant.');
          return;
        }
  
        let response = await fetch("https://www.sunshinedeliver.com/api/customer/order/add/", {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: user?.token,
            restaurant_id: uniqueRestaurantId.toString(),
            address: userAddress,
            order_details: transformedOrderDetails[0].order_details,
          }),
        });
  
        if (response.ok) {
          let responseJson = await response.json();
          console.log('Response', responseJson);
  
          if (responseJson.status === 'success') {
            // If status is 'success', dispatch clearBasket() and navigate to SuccessScreen
            setTimeout(() => {
              setLoadingOrder(false);
              dispatch(clearBasket());
              navigation.navigate('SuccessScreen');
            }, 2000);
          } else {
            // If status is not 'success', redirect to HomeScreen
            alert('Selecione Comida apenas de um restaurante');
            navigation.navigate('HomeScreen');
          }
        } else {
          // Handle non-successful response (e.g., redirect to HomeScreen)
          alert('Selecione Comida apenas de um restaurante');
          navigation.navigate('HomeScreen');
        }
      } catch (error) {
        // Handle network errors or other exceptions
        console.error(error);
        alert('An error occurred. Please try again.');
      }
    }
  };
  

  const useCurrentLocation = () => {
    fetchUserLocation()
      .then((location) => {
        if (location) {
          const formattedAddress = `Latitude: ${location.latitude}, Longitude: ${location.longitude}`;
          setUserAddress(formattedAddress);
          setShowPaymentButton(true);
        } else {
          alert('Failed to get current location');
        }
      })
      .catch((error) => {
        alert('Error getting current location');
      });
  };
  

  return (
    <>
      <View style={[tailwind`bg-blue-300 relative`, { height: 250 }]}>
        <MapView
          provider={PROVIDER_GOOGLE}
          region={initialRegion}
          style={tailwind`h-full z-10`}
        >
          <Marker
            coordinate={initialRegion}
            identifier="shop"
            anchor={{ x: 0.5, y: 0.5 }}
            title="Shop"
            icon={require('../assets/shop.png')}
          />
        </MapView>
      </View>

      <View>
        {/* GooglePlacesAutocomplete component 
        <GooglePlacesAutocomplete
          placeholder="Adicione seu endereço"
          onPress={(data, details = null) => {
            console.log('endereco done', data?.description);
            setUserAddress(data?.description);
            setShowPaymentButton(true);
          }}
          query={{
            key: 'YOUR_GOOGLE_MAPS_API_KEY',
            language: 'en',
            types: ['(cities)'],
          }}
          styles={{
            container: tailwind`flex-1`,
            textInput: tailwind`h-10 border border-gray-300 rounded p-2 mt-2 mx-2`,
            listView: tailwind`bg-white border border-gray-300 border-t-0 mt-1 mx-2 rounded-md shadow-md`,
          }}
        />
*/}
        {/* Button to use the current location */}
        <TouchableOpacity
          style={tailwind`h-10 w-full bg-blue-500 my-6 rounded-full mt-24 items-center justify-center border border-blue-500`}
          onPress={useCurrentLocation}
        >
          <Text>Usar localização atual</Text>
        </TouchableOpacity>

        {/* Button to complete the order (conditionally rendered) */}
        {showPaymentButton && (
          <TouchableOpacity
            style={tailwind`h-10 w-full bg-blue-500 my-6 rounded-full items-center justify-center border border-blue-500`}
            onPress={completeOrder}
          >
            <Text style={tailwind`text-white`}>Pagar na entrega</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

export default CheckoutScreen;