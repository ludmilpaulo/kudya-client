// src/components/AddressInput.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import tailwind from 'tailwind-react-native-classnames';

type AddressInputProps = {
  useCurrentLocation: boolean;
  setUseCurrentLocation: (value: boolean) => void;
  userAddress: string;
  setUserAddress: (value: string) => void;
};

const AddressInput: React.FC<AddressInputProps> = ({ useCurrentLocation, setUseCurrentLocation, userAddress, setUserAddress }) => {
  return (
    <View style={tailwind`mb-6`}>
      <Text style={tailwind`text-gray-700 mb-2`}>Escolher o endereço de entrega:</Text>
      <View style={tailwind`flex-row items-center mb-4`}>
        <TouchableOpacity
          onPress={() => setUseCurrentLocation(true)}
          style={tailwind`mr-2`}
        >
          <View style={useCurrentLocation ? tailwind`bg-blue-500 w-4 h-4 rounded-full` : tailwind`bg-white w-4 h-4 rounded-full border border-gray-400`} />
        </TouchableOpacity>
        <Text onPress={() => setUseCurrentLocation(true)} style={tailwind`text-gray-700`}>Usar localização atual</Text>
      </View>
      <View style={tailwind`flex-row items-center mb-4`}>
        <TouchableOpacity
          onPress={() => setUseCurrentLocation(false)}
          style={tailwind`mr-2`}
        >
          <View style={!useCurrentLocation ? tailwind`bg-blue-500 w-4 h-4 rounded-full` : tailwind`bg-white w-4 h-4 rounded-full border border-gray-400`} />
        </TouchableOpacity>
        <Text onPress={() => setUseCurrentLocation(false)} style={tailwind`text-gray-700`}>Escrever o endereço de entrega</Text>
      </View>
      {!useCurrentLocation && (
        <TextInput
          style={tailwind`w-full p-2 border border-gray-300 rounded`}
          placeholder="Adicione seu endereço"
          onChangeText={setUserAddress}
          value={userAddress}
        />
      )}
    </View>
  );
};

export default AddressInput;
