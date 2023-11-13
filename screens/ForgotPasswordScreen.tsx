// ForgotPasswordScreen.tsx

import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { requestPasswordReset } from '../configs/variable';
import tailwind from "tailwind-react-native-classnames";


const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);

const handleForgotPassword = async () => {
  try {
    setLoading(true);
    // Make API request to Django backend to initiate password reset
    await requestPasswordReset({ email });
    Alert.alert('Success', 'E-mail de redefinição de senha enviado.');
  } catch (error) {
    console.error(error);
    Alert.alert('Error', error?.message || 'An unknown error occurred');
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={tailwind`flex-1 justify-center items-center`}>
    <View style={tailwind`w-4/5`}>
      <TextInput
        style={tailwind`border-b-2 p-2 mb-4`}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Reset Password" onPress={handleForgotPassword} />
    </View>
  </View>
  );
};

export default ForgotPasswordScreen;
