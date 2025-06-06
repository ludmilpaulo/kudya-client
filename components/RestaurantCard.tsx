import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { store } from '../services/types';

type Location = {
  latitude: number;
  longitude: number;
};

type storeProps = {
  store: store;
  location: Location;
};

const storeCard: React.FC<storeProps> = ({ store, location }) => {
  const navigation = useNavigation<any>();

  if (!store) {
    return null;
  }

  const isOpen = () => {
    const today = new Date();
    const currentDay = today.toLocaleString('pt-BR', { weekday: 'long' }).toLowerCase();
    const currentTime = today.getHours() * 60 + today.getMinutes();

    const openingHour = store.opening_hours.find(
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
    const closingTime = parseTime(openingHour.to_hour) - 20;

    return currentTime >= openingTime && currentTime <= closingTime;
  };

  const handleClick = () => {
    if (!isOpen()) {
      Alert.alert(`O storee ${store.name} está fechado de momento, tente mais tarde`);
    } else {
      navigation.navigate('storeMenu' as never, {
        store_id: store.id,
        store_logo: store.logo,
      } as never);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      0.5 -
      Math.cos(dLat) / 2 +
      (Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        (1 - Math.cos(dLon))) /
        2;
    return R * 2 * Math.asin(Math.sqrt(a));
  };

  const calculateTime = (distance: number) => {
    const speed = 40; // Assuming speed in km/h
    const time = distance / speed;
    return `${Math.round(time * 60)} mins`;
  };

  const { latitude: storeLat, longitude: storeLon } = store.location;
  const distance = location ? getDistance(location.latitude, location.longitude, storeLat, storeLon) : null;
  const travelTime = distance ? calculateTime(distance) : null;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        !isOpen() && styles.closedCard
      ]}
      onPress={handleClick}
    >
      {store.logo && (
        <Image
          source={{ uri: store.logo }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.nameText}>{store.name}</Text>
        {travelTime && (
          <Text style={styles.distanceText}>Aprox. {travelTime} de distância</Text>
        )}
        {store.category && (
          <Text style={styles.categoryText}>
            {store.category.name}
          </Text>
        )}
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, isOpen() ? styles.openStatus : styles.closedStatus]}>
            {isOpen() ? 'Aberto' : 'Fechado'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
    margin: 8,
  },
  closedCard: {
    opacity: 0.5,
  },
  image: {
    width: '100%',
    height: 192,
  },
  infoContainer: {
    padding: 16,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  distanceText: {
    color: '#4B5563',
  },
  categoryText: {
    backgroundColor: '#BFDBFE',
    color: '#1D4ED8',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
    borderRadius: 9999,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  openStatus: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  closedStatus: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
});

export default storeCard;
