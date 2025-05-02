import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import QRCode from 'react-native-qrcode-svg';
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
          style={tw`text-base`} // ensures readable font
        >
          <Picker.Item label="Pagar na entrega" value="Entrega" />
          <Picker.Item label="Pagar na entrega com TPA" value="TPA" />
          <Picker.Item label="Transferência pelo IBAN" value="IBAN" />
          <Picker.Item label="Pagar pelo PayPal" value="PayPal" />
        </Picker>
      </View>

      {paymentMethod === "Entrega" && (
        <View style={tw`mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500`}>
          <Text style={tw`text-yellow-700`}>
            Certifique-se de ter troco suficiente ou cartão para usar o TPA.
          </Text>
        </View>
      )}

      {paymentMethod === "IBAN" && (
        <View style={tw`mb-6 p-4 bg-blue-100 border-l-4 border-blue-500`}>
          <Text style={tw`text-blue-700 font-semibold`}>Detalhes do banco:</Text>
          <Text style={tw`text-blue-700`}>Banco: Banco XYZ</Text>
          <Text style={tw`text-blue-700`}>IBAN: AO06 0006 0000 0000 0000 0011 2233</Text>
        </View>
      )}

      {paymentMethod === "PayPal" && (
        <View style={tw`mb-6 p-4 bg-green-100 border-l-4 border-green-500 items-center`}>
          <Text style={tw`text-green-700 mb-3 text-center`}>
            Escaneie o código QR abaixo para pagar com PayPal:
          </Text>
          <QRCode value="https://www.paypal.com" size={128} />
        </View>
      )}
    </View>
  );
};

export default PaymentDetails;
