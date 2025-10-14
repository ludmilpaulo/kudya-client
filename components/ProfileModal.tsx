import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, Image, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logoutUser, selectUser } from '../redux/slices/authSlice';
import { baseAPI } from '../services/types';
import * as ImagePicker from 'expo-image-picker';

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userDetails: any;
  onUpdate: (updatedDetails: any) => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, userDetails, onUpdate }) => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [address, setAddress] = useState<string>(userDetails?.address || '');
  const [firstName, setFirstName] = useState<string>(userDetails?.first_name || '');
  const [lastName, setLastName] = useState<string>(userDetails?.last_name || '');
  const [phone, setPhone] = useState<string>(userDetails?.phone || '');
  const userToken = null;
  const navigation = useNavigation<any>();

  useEffect(() => {
    const userLocation = async () => {
      if (!navigator.geolocation) {
        Alert.alert("Geolocation is not supported by your browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

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

  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const userUpdate = async () => {
    const formData = new FormData();

    if (imageUri) {
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('avatar', {
        uri: imageUri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

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
          'Content-Type': 'multipart/form-data',
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
          avatar: imageUri
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <View style={styles.modalContent}>
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={styles.avatar}
              />
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
                <Text style={styles.buttonText}>Escolher da Galeria</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageButton} onPress={handleTakePhoto}>
                <Text style={styles.buttonText}>Tirar Foto</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Primeiro Nome"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Ultimo Nome"
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              style={styles.input}
              placeholder="Número de Telefone"
              value={phone}
              onChangeText={setPhone}
            />
            <TextInput
              style={styles.input}
              placeholder="Endereço"
              value={address}
              onChangeText={setAddress}
            />
            <TouchableOpacity onPress={userUpdate} style={styles.updateButton}>
              <Text style={styles.updateButtonText}>Atualize seu Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: 'gray',
  },
  modalContent: {
    alignItems: 'center',
  },
  avatar: {
    width: 192,
    height: 192,
    borderRadius: 96,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  updateButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  updateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProfileModal;
