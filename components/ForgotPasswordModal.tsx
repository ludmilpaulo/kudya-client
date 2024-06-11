import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import tailwind from 'tailwind-react-native-classnames';
import { baseAPI } from '../services/types';

interface ForgotPasswordModalProps {
  show: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ show, onClose }) => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseAPI}/conta/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
      } else {
        Alert.alert('Erro', data.message || 'Erro ao enviar o email de redefinição de senha.');
      }
    } catch (error) {
      console.error('Erro ao redefinir a senha:', error);
      Alert.alert('Erro', 'Erro ao enviar o email de redefinição de senha.');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <Modal transparent={true} visible={show} animationType="slide">
      <View style={tailwind`flex-1 justify-center items-center bg-black bg-opacity-50`}>
        <View style={tailwind`bg-white p-6 rounded shadow-lg w-80`}>
          {emailSent ? (
            <View>
              <Text style={tailwind`text-2xl mb-4`}>Email Enviado</Text>
              <Text style={tailwind`mb-4`}>Por favor, verifique seu email para redefinir sua senha.</Text>
              <TouchableOpacity
                onPress={onClose}
                style={tailwind`px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-600`}
              >
                <Text>Fechar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={tailwind`text-2xl mb-4`}>Redefinir Senha</Text>
              <Text style={tailwind`block text-sm font-medium text-gray-700`}>Email</Text>
              <TextInput
                keyboardType="email-address"
                value={email}
                onChangeText={(text) => setEmail(text)}
                style={tailwind`w-full p-2 mt-2 mb-4 border border-gray-300 rounded`}
                placeholder="Digite seu email"
              />
              <View style={tailwind`flex-row justify-end space-x-4`}>
                <TouchableOpacity
                  onPress={onClose}
                  style={tailwind`px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600`}
                >
                  <Text>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleResetPassword}
                  style={tailwind`px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-600`}
                  disabled={loading}
                >
                  <Text>{loading ? 'Enviando...' : 'Enviar'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ForgotPasswordModal;
