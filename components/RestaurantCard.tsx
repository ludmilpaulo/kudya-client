import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import tailwind from 'tailwind-react-native-classnames';

type OpeningHour = {
  day: string;
  from_hour: string;
  to_hour: string;
  is_closed: boolean;
};

type Category = {
  id: number;
  name: string;
  image: string | null;
};

type RestaurantProps = {
  restaurant: {
    id: number;
    name: string;
    phone: string;
    address: string;
    logo: string;
    category?: Category; // Mark category as optional
    barnner: boolean;
    is_approved: boolean;
    opening_hours: OpeningHour[];
    location: string; // Change type to string to match the API response
  };
  location: {
    latitude: number;
    longitude: number;
  };
};

const RestaurantCard: React.FC<RestaurantProps> = ({ restaurant, location }) => {
  const navigation = useNavigation();

  if (!restaurant) {
    return null; // Render nothing if the restaurant is undefined
  }

  const isOpen = () => {
    const today = new Date();
    const currentDay = today.toLocaleString('pt-BR', { weekday: 'long' }).toLowerCase();
    const currentTime = today.getHours() * 60 + today.getMinutes();

    const openingHour = restaurant.opening_hours.find(
      (hour) => hour.day.toLowerCase() === currentDay
    );

    if (!openingHour || openingHour.is_closed) {
      return false;
    }

    const parseTime = (time: string) => {
      const [timePart, modifier] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);

      if (modifier === 'PM' && hours !== 12) {
        hours += 12;
      } else if (modifier === 'AM' && hours === 12) {
        hours = 0;
      }

      return hours * 60 + minutes;
    };

    const openingTime = parseTime(openingHour.from_hour);
    const closingTime = parseTime(openingHour.to_hour) - 20; // 20 minutes before closing

    return currentTime >= openingTime && currentTime <= closingTime;
  };

  const handleClick = () => {
    if (!isOpen()) {
      Alert.alert(`O restaurante ${restaurant.name} está fechado de momento, tente mais tarde`);
    } else {
      navigation.navigate('RestaurantMenu', {
        restaurant_id: restaurant.id,
        restaurant_logo: restaurant.logo,
      });
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      0.5 - Math.cos(dLat) / 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
  };

  const calculateTime = (distance) => {
    const speed = 40; // average speed in km/h
    const time = distance / speed;
    return `${Math.round(time * 60)} mins`;
  };

  const [restaurantLat, restaurantLon] = restaurant.location.split(',').map(Number);
  const distance = location ? getDistance(location.latitude, location.longitude, restaurantLat, restaurantLon) : null;
  const travelTime = distance ? calculateTime(distance) : null;

  return (
    <TouchableOpacity
      style={[
        tailwind`bg-white rounded-lg shadow-lg overflow-hidden m-2`,
        !isOpen() && tailwind`opacity-50`
      ]}
      onPress={handleClick}
    >
      {restaurant.logo && (
        <Image
          source={{ uri: restaurant.logo }}
          style={tailwind`w-full h-48`}
          resizeMode="cover"
        />
      )}
      <View style={tailwind`p-4`}>
        <Text style={tailwind`text-2xl font-semibold text-gray-800`}>{restaurant.name}</Text>
        {travelTime && (
          <Text style={tailwind`text-gray-600`}>Aprox. {travelTime} de distância</Text>
        )}
        {restaurant.category && (
          <Text style={tailwind`bg-blue-100 text-blue-800 text-xs px-2 py-1 mt-2 rounded-full`}>
            {restaurant.category.name}
          </Text>
        )}
        <View style={tailwind`mt-2`}>
          <Text style={tailwind`inline-block px-2 py-1 rounded-full text-xs font-semibold ${isOpen() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isOpen() ? 'Aberto' : 'Fechado'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RestaurantCard;
