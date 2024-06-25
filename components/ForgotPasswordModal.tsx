import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { baseAPI } from '../services/types';

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
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {emailSent ? (
            <View>
              <Text style={styles.modalTextHeader}>Email Enviado</Text>
              <Text style={styles.modalText}>Por favor, verifique seu email para redefinir sua senha.</Text>
              <TouchableOpacity onPress={onClose} style={styles.buttonClose}>
                <Text style={styles.textStyle}>Fechar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.modalTextHeader}>Redefinir Senha</Text>
              <Text style={styles.label}>Email</Text>
              <TextInput
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="Digite seu email"
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={onClose} style={styles.buttonCancel}>
                  <Text style={styles.textStyle}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleResetPassword}
                  style={styles.buttonSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.textStyle}>Enviar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Enhanced overlay background for better visibility
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTextHeader: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonCancel: {
    backgroundColor: '#888',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginRight: 10,
  },
  buttonSubmit: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ForgotPasswordModal;
