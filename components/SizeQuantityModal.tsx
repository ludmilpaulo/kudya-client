import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";

type Props = {
  visible: boolean;
  sizes: string[];
  maxQuantity: number;
  onSelect: (size: string, quantity: number) => void;
  onClose: () => void;
};

export const SizeQuantityModal: React.FC<Props> = ({
  visible, sizes, maxQuantity, onSelect, onClose
}) => {
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [quantity, setQuantity] = useState(1);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
        <View style={tw`bg-white rounded-2xl p-6 w-80`}>
          <Text style={tw`text-xl font-bold mb-4`}>Select Size & Quantity</Text>
          <Text style={tw`mb-2 font-semibold`}>Size</Text>
          <View style={tw`flex-row flex-wrap mb-4`}>
            {sizes.map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => setSelectedSize(size)}
                style={tw`px-4 py-2 border rounded-full mr-2 mb-2 ${
                  selectedSize === size ? "bg-blue-600 border-blue-600" : "border-gray-300"
                }`}
              >
                <Text style={tw`${selectedSize === size ? "text-white" : "text-gray-800"}`}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={tw`mb-2 font-semibold`}>Quantity</Text>
          <View style={tw`flex-row items-center mb-6`}>
            <TouchableOpacity
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              style={tw`px-3 py-1 bg-gray-200 rounded-l`}
            >
              <Text style={tw`text-xl`}>-</Text>
            </TouchableOpacity>
            <Text style={tw`px-4 py-2 border-t border-b border-gray-300`}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              style={tw`px-3 py-1 bg-gray-200 rounded-r`}
            >
              <Text style={tw`text-xl`}>+</Text>
            </TouchableOpacity>
            <Text style={tw`ml-2 text-xs text-gray-400`}>{`(max ${maxQuantity})`}</Text>
          </View>
          <TouchableOpacity
            style={tw`bg-blue-600 py-3 rounded-xl`}
            onPress={() => {
              onSelect(selectedSize, quantity);
              onClose();
            }}
          >
            <Text style={tw`text-white text-center font-bold`}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity style={tw`mt-2`} onPress={onClose}>
            <Text style={tw`text-center text-gray-500`}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
