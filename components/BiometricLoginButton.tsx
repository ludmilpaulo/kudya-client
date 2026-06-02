import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import { useTranslation } from '../hooks/useTranslation';
import {
  getBiometricLabel,
  hasBiometricSession,
  isBiometricHardwareAvailable,
  loginWithBiometrics,
} from '../services/biometricAuth';
import { AuthSessionPayload } from '../services/authTypes';

type Props = {
  onSuccess: (result: AuthSessionPayload) => void;
  disabled?: boolean;
};

export default function BiometricLoginButton({ onSuccess, disabled }: Props) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState('Biometrics');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [hardware, saved, biometricLabel] = await Promise.all([
        isBiometricHardwareAvailable(),
        hasBiometricSession(),
        getBiometricLabel(),
      ]);
      setVisible(hardware && saved);
      setLabel(biometricLabel);
    })();
  }, []);

  if (!visible) return null;

  const handlePress = async () => {
    try {
      setLoading(true);
      const result = await loginWithBiometrics();
      onSuccess(result);
    } catch (e: unknown) {
      Alert.alert(t('error'), e instanceof Error ? e.message : t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const iconName = label === 'Face ID' ? 'smile' : 'shield';

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      style={tw`flex-row items-center justify-center border border-blue-200 rounded-full py-3 mb-2 bg-blue-50`}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#2563EB" />
      ) : (
        <>
          <Feather name={iconName} size={18} color="#2563EB" style={tw`mr-2`} />
          <Text style={tw`font-semibold text-blue-700`}>
            {(t('signInWithBiometrics' as never) as string) || `Sign in with ${label}`}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
