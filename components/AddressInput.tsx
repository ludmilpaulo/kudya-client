import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import tw from 'twrnc';

type AddressInputProps = {
  useCurrentLocation: boolean;
  setUseCurrentLocation: (value: boolean) => void;
  userAddress: string;
  setUserAddress: (value: string) => void;
};

const AddressInput: React.FC<AddressInputProps> = ({
  useCurrentLocation,
  setUseCurrentLocation,
  userAddress,
  setUserAddress,
}) => {
  return (
    <View style={tw`mb-6`}>
      <Text style={tw`text-gray-700 mb-2`}>Escolher o endereço de entrega:</Text>

      <View style={tw`flex-row items-center mb-4`}>
        <TouchableOpacity
          onPress={() => setUseCurrentLocation(true)}
          style={tw`mr-2`}
        >
          <View
            style={
              useCurrentLocation
                ? tw`w-4 h-4 rounded-full bg-blue-500`
                : tw`w-4 h-4 rounded-full bg-white border border-gray-400`
            }
          />
        </TouchableOpacity>
        <Text onPress={() => setUseCurrentLocation(true)} style={tw`text-gray-700`}>
          Usar localização atual
        </Text>
      </View>

      <View style={tw`flex-row items-center mb-4`}>
        <TouchableOpacity
          onPress={() => setUseCurrentLocation(false)}
          style={tw`mr-2`}
        >
          <View
            style={
              !useCurrentLocation
                ? tw`w-4 h-4 rounded-full bg-blue-500`
                : tw`w-4 h-4 rounded-full bg-white border border-gray-400`
            }
          />
        </TouchableOpacity>
        <Text onPress={() => setUseCurrentLocation(false)} style={tw`text-gray-700`}>
          Escrever o endereço de entrega
        </Text>
      </View>

      {!useCurrentLocation && (
        <TextInput
          style={tw`w-full p-3 border border-gray-300 rounded`}
          placeholder="Adicione seu endereço"
          onChangeText={setUserAddress}
          value={userAddress}
        />
      )}
    </View>
  );
};

export default AddressInput;
