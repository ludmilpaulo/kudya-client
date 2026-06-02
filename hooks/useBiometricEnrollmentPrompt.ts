import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from '../hooks/useTranslation';
import {
  getBiometricLabel,
  isBiometricHardwareAvailable,
  offerBiometricEnrollment,
  sessionFromAuthPayload,
} from '../services/biometricAuth';
import { AuthSessionPayload } from '../services/authTypes';

export function useBiometricEnrollmentPrompt() {
  const { t } = useTranslation();

  const maybeOfferBiometricEnrollment = useCallback(
    async (payload: AuthSessionPayload) => {
      const session = sessionFromAuthPayload(payload);
      if (!session) return;

      const available = await isBiometricHardwareAvailable();
      if (!available) return;

      const label = await getBiometricLabel();
      Alert.alert(
        (t('enableBiometricsTitle' as never) as string) || `Enable ${label}?`,
        (t('enableBiometricsMessage' as never) as string) ||
          `Use ${label} for faster and secure sign-in on this device.`,
        [
          { text: (t('cancel' as never) as string) || 'Not now', style: 'cancel' },
          {
            text: (t('enable' as never) as string) || 'Enable',
            onPress: async () => {
              const enabled = await offerBiometricEnrollment(
                session,
                (t('confirmBiometricsPrompt' as never) as string) ||
                  `Confirm ${label} to enable quick sign-in`,
              );
              if (enabled) {
                Alert.alert(
                  (t('success' as never) as string) || 'Success',
                  (t('biometricsEnabled' as never) as string) ||
                    `${label} sign-in is now enabled for this device.`,
                );
              }
            },
          },
        ],
      );
    },
    [t],
  );

  return { maybeOfferBiometricEnrollment };
}
