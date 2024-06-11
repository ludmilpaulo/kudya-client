import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logoutUser, selectUser } from '../redux/slices/authSlice';
import { baseAPI } from '../services/types';

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userDetails: any;
  onUpdate: (updatedDetails: any) => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, userDetails, onUpdate }) => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const [imageInfo, setImageInfo] = useState<File | null>(null);
  const [address, setAddress] = useState<string>(userDetails?.address || '');
  const [firstName, setFirstName] = useState<string>(userDetails?.first_name || '');
  const [lastName, setLastName] = useState<string>(userDetails?.last_name || '');
  const [phone, setPhone] = useState<string>(userDetails?.phone || '');
  const userToken = user.token;
  const navigation = useNavigation();

  useEffect(() => {
    const userLocation = async () => {
      if (!navigator.geolocation) {
        Alert.alert("Geolocation is not supported by your browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log(latitude, longitude);

          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_API_KEY`
            );
            const data = await response.json();
            const formattedAddress = data.results[0].formatted_address;
            setAddress(formattedAddress);
          } catch (error) {
            console.log(error);
          }
        },
        (error) => {
          Alert.alert("Permission to access location was denied");
        }
      );
    };

    userLocation();
  }, []);

  const handleTakePhotoOrSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageInfo(event.target.files[0]);
    }
  };

  const userUpdate = async () => {
    if (!imageInfo) {
      Alert.alert("Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append('avatar', imageInfo);
    formData.append('access_token', userToken);
    formData.append('address', address);
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('phone', phone);

    try {
      const response = await fetch(`${baseAPI}/customer/customer/profile/update/`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert(data.status);
        navigation.navigate('HomeScreen');
        onUpdate({
          ...userDetails,
          address,
          first_name: firstName,
          last_name: lastName,
          phone,
          avatar: URL.createObjectURL(imageInfo)
        });
        onClose();
      } else {
        const resp = await response.json();
        Alert.alert(resp.non_field_errors);
        console.error(resp);
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("An error occurred. Please try again.");
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ width: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20 }}>
          <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 10, right: 10 }}>
            <Text style={{ fontSize: 18, color: 'gray' }}>X</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            {imageInfo && (
              <Image
                source={{ uri: URL.createObjectURL(imageInfo) }}
                style={{ width: 192, height: 192, borderRadius: 96, marginBottom: 20 }}
              />
            )}
            <TextInput
              style={{ width: '100%', borderColor: 'gray', borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 10 }}
              placeholder="Primeiro Nome"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={{ width: '100%', borderColor: 'gray', borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 10 }}
              placeholder="Ultimo Nome"
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              style={{ width: '100%', borderColor: 'gray', borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 10 }}
              placeholder="Número de Telefone"
              value={phone}
              onChangeText={setPhone}
            />
            <TextInput
              style={{ width: '100%', borderColor: 'gray', borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 10 }}
              placeholder="Endereço"
              value={address}
              onChangeText={setAddress}
            />
            <TouchableOpacity onPress={userUpdate} style={{ backgroundColor: 'blue', padding: 15, borderRadius: 5, marginTop: 10 }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Atualize seu Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ProfileModal;
