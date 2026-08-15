import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import tw from 'twrnc';

type PaymentDetailsProps = {
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
};

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ paymentMethod, setPaymentMethod }) => {
  return (
    <View style={tw`mb-6`}>
      <Text style={tw`text-gray-700 mb-2`}>Método de pagamento:</Text>

      <View style={tw`w-full border border-gray-300 rounded`}>
        <Picker
          selectedValue={paymentMethod}
          onValueChange={(itemValue) => setPaymentMethod(itemValue)}
          style={tw`text-base`}
        >
          <Picker.Item label="Pagar na entrega" value="Entrega" />
          <Picker.Item label="Pagar na entrega com TPA" value="TPA" />
        </Picker>
      </View>

      {paymentMethod === "Entrega" && (
        <View style={tw`mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500`}>
          <Text style={tw`text-yellow-700`}>
            Certifique-se de ter troco suficiente ou cartão para usar o TPA.
          </Text>
        </View>
      )}

      {paymentMethod === "TPA" && (
        <View style={tw`mb-6 p-4 bg-blue-100 border-l-4 border-blue-500`}>
          <Text style={tw`text-blue-700`}>
            O entregador levará um terminal TPA. Pague no momento da entrega.
          </Text>
        </View>
      )}
    </View>
  );
};

export default PaymentDetails;
