import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import tw from 'twrnc';
import { useGetPaymentMethodsQuery } from '../redux/slices/paymentsApi';
import type { BankAccount } from '../types/payments';

type PaymentDetailsProps = {
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  proofName: string | null;
  onPickProof: () => void;
};

const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  paymentMethod,
  setPaymentMethod,
  phone,
  setPhone,
  proofName,
  onPickProof,
}) => {
  const { data, isLoading, error } = useGetPaymentMethodsQuery();
  const methods = (data?.methods ?? []).filter((method) => method.available);

  useEffect(() => {
    if (!methods.length) return;
    if (!methods.some((method) => method.code === paymentMethod)) {
      setPaymentMethod(data?.default_method || methods[0].code);
    }
  }, [methods, paymentMethod, setPaymentMethod, data?.default_method]);

  const selected = methods.find((method) => method.code === paymentMethod);
  const banks: BankAccount[] = selected?.bank_accounts ?? [];

  return (
    <View style={tw`mb-6`}>
      <Text style={tw`text-gray-700 mb-2`}>Método de pagamento:</Text>
      {isLoading ? <ActivityIndicator /> : null}
      {error ? <Text style={tw`text-red-600 mb-2`}>Could not load payment methods.</Text> : null}
      <View style={tw`w-full border border-gray-300 rounded`}>
        <Picker selectedValue={paymentMethod} onValueChange={(itemValue) => setPaymentMethod(String(itemValue))}>
          {methods.map((method) => (
            <Picker.Item key={method.code} label={method.label} value={method.code} />
          ))}
        </Picker>
      </View>
      {selected?.requires_phone ? (
        <View style={tw`mt-3 p-4 bg-blue-100 border-l-4 border-blue-500`}>
          <Text style={tw`text-blue-800 mb-2`}>Confirm on your EcoCash phone. Kudya never asks for your PIN.</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="2637…"
            style={tw`bg-white rounded p-2 text-gray-900`}
          />
        </View>
      ) : null}
      {selected?.requires_proof ? (
        <View>
          {banks.map((bank) => (
            <View key={bank.id} style={tw`mt-3 p-4 bg-yellow-100 border-l-4 border-yellow-500`}>
              <Text style={tw`font-semibold`}>{bank.bank_name}</Text>
              <Text>{bank.account_name}</Text>
              <Text>{bank.account_number}</Text>
              {bank.payment_reference_instructions ? <Text>{bank.payment_reference_instructions}</Text> : null}
            </View>
          ))}
          <TouchableOpacity onPress={onPickProof} style={tw`mt-3 rounded bg-amber-600 p-3`}>
            <Text style={tw`text-white text-center font-semibold`}>
              {proofName ? `Proof: ${proofName}` : 'Select proof of payment'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export default PaymentDetails;
