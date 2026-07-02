import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, Image, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as Location from 'expo-location';
import Geocoder from 'react-native-geocoding';
import { selectUser } from '../redux/slices/authSlice';
import { useAppSelector } from '../redux/store';
import { baseAPI, RootStackParamList } from '../services/types';
import { googleAPi } from '../configs/variable';
import * as ImagePicker from 'expo-image-picker';

/** Fields this modal reads/writes on the customer profile. */
export type ProfileFormDetails = {
  address?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar?: string | null;
};

/** React Native's FormData accepts this file-part shape at runtime; the
 * standard DOM `FormData` typings don't model it, so RN augments the append
 * overloads to also accept an object shaped like this. */
type RNFormDataFilePart = {
  uri: string;
  name: string;
  type: string;
};

type ProfileUpdateSuccess = {
  status?: string;
};

type ProfileUpdateError = {
  non_field_errors?: string | string[];
};

function formatApiError(payload: ProfileUpdateError): string {
  const errors = payload.non_field_errors;
  if (Array.isArray(errors)) {
    return errors.join('\n');
  }
  if (typeof errors === 'string') {
    return errors;
  }
  return 'Could not update profile.';
}

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userDetails: ProfileFormDetails | null;
  onUpdate: (updatedDetails: ProfileFormDetails) => void;
};

if (googleAPi) {
  Geocoder.init(googleAPi);
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, userDetails, onUpdate }) => {
  const user = useAppSelector(selectUser);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [address, setAddress] = useState<string>(userDetails?.address ?? '');
  const [firstName, setFirstName] = useState<string>(userDetails?.first_name ?? '');
  const [lastName, setLastName] = useState<string>(userDetails?.last_name ?? '');
  const [phone, setPhone] = useState<string>(userDetails?.phone ?? '');
  const userToken = user?.token ?? null;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fillAddressFromCurrentLocation = async () => {
      if (!googleAPi) {
        // No Google Maps key configured — skip silently rather than call the
        // geocoding API with an invalid key.
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        const response = await Geocoder.from(location.coords);
        const formattedAddress = response.results[0]?.formatted_address;
        if (formattedAddress) {
          setAddress(formattedAddress);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fillAddressFromCurrentLocation();
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
    if (!userToken) {
      Alert.alert('Sessão expirada', 'Por favor, inicie sessão novamente.');
      return;
    }

    const formData = new FormData();

    if (imageUri) {
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const filePart: RNFormDataFilePart = {
        uri: imageUri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      };
      // RN's FormData accepts this file-part object at runtime; the DOM
      // `FormData` typings only model string/Blob, so a Blob assertion is
      // the accepted way to bridge the two without using `any`.
      formData.append('avatar', filePart as unknown as Blob);
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
        const data = (await response.json()) as ProfileUpdateSuccess;
        Alert.alert(data.status ?? 'Profile updated');
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
        const resp = (await response.json()) as ProfileUpdateError;
        Alert.alert(formatApiError(resp));
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
