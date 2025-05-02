import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { baseAPI } from '../services/types';
import tw from 'twrnc';

interface ForgotPasswordModalProps {
  show: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ show, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseAPI}/conta/reset-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setEmailSent(true);
        Alert.alert('Sucesso', 'Email enviado. Por favor, verifique seu email para redefinir sua senha.');
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
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-40`}>
        <View style={tw`bg-white rounded-2xl p-6 mx-5 w-11/12 shadow-lg`}>
          {emailSent ? (
            <>
              <Text style={tw`text-center text-lg font-bold mb-4`}>Email Enviado</Text>
              <Text style={tw`text-center text-base mb-6`}>
                Por favor, verifique seu email para redefinir sua senha.
              </Text>
              <TouchableOpacity onPress={onClose} style={tw`bg-blue-600 rounded-full px-5 py-3`}>
                <Text style={tw`text-white font-bold text-center`}>Fechar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={tw`text-center text-lg font-bold mb-4`}>Redefinir Senha</Text>
              <Text style={tw`text-base mb-1 self-start`}>Email</Text>
              <TextInput
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholder="Digite seu email"
                style={tw`w-full border border-gray-300 rounded px-4 py-2 mb-4`}
              />
              <View style={tw`flex-row justify-between`}>
                <TouchableOpacity
                  onPress={onClose}
                  style={tw`bg-gray-500 rounded-full px-5 py-3 mr-2 flex-1`}
                >
                  <Text style={tw`text-white font-bold text-center`}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleResetPassword}
                  style={tw`bg-blue-600 rounded-full px-5 py-3 flex-1`}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={tw`text-white font-bold text-center`}>Enviar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ForgotPasswordModal;
