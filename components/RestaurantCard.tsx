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
  };
};

const RestaurantCard: React.FC<RestaurantProps> = ({ restaurant }) => {
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
      navigation.navigate('RestaurantMenu', { restaurant_id: restaurant.id });
    }
  };

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
        <Text style={tailwind`text-gray-600`}>{restaurant.address}</Text>
        <Text style={tailwind`text-gray-600`}>{restaurant.phone}</Text>
        {restaurant.category && (
          <Text style={tailwind`bg-blue-100 text-blue-800 text-xs px-2 py-1 mt-2 rounded-full`}>
            {restaurant.category.name}
          </Text>
        )}
        {restaurant.barnner && (
          <View style={tailwind`mt-4 bg-gradient-to-r from-yellow-400 to-blue-600 p-2 rounded text-white text-center`}>
            <Text>Ver o Menu</Text>
          </View>
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
