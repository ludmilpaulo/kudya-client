import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import tw from 'twrnc';
import {
  useGoogleAuth,
  useFacebookAuth,
  completeGoogleAuth,
  completeFacebookAuth,
  signInWithTikTok,
  isSocialLoginConfigured,
  getSocialLoginSetupHint,
  SocialAuthResult,
  SocialProvider,
} from '../services/socialAuth';
import { useTranslation } from '../hooks/useTranslation';

type Props = {
  onSuccess: (result: SocialAuthResult) => void;
  disabled?: boolean;
};

const PROVIDERS: {
  id: SocialProvider;
  labelKey: string;
  fallback: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'google',
    labelKey: 'continueGoogle',
    fallback: 'Continue with Google',
    icon: <AntDesign name="google" size={18} color="#DB4437" />,
  },
  {
    id: 'facebook',
    labelKey: 'continueFacebook',
    fallback: 'Continue with Facebook',
    icon: <FontAwesome5 name="facebook" size={18} color="#1877F2" />,
  },
  {
    id: 'tiktok',
    labelKey: 'continueTiktok',
    fallback: 'Continue with TikTok',
    icon: <FontAwesome5 name="tiktok" size={18} color="#000" />,
  },
];

export default function SocialLoginButtons({ onSuccess, disabled }: Props) {
  const { t } = useTranslation();
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [googleRequest, googleResponse, promptGoogle] = useGoogleAuth();
  const [fbRequest, fbResponse, promptFacebook] = useFacebookAuth();

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      (async () => {
        try {
          setLoadingProvider('google');
          const result = await completeGoogleAuth(googleResponse.authentication);
          onSuccess(result);
        } catch (e: unknown) {
          Alert.alert(t('error'), e instanceof Error ? e.message : t('loginFailed'));
        } finally {
          setLoadingProvider(null);
        }
      })();
    } else if (googleResponse?.type === 'error') {
      setLoadingProvider(null);
      Alert.alert(t('error'), googleResponse.error?.message || t('loginFailed'));
    } else if (googleResponse?.type === 'dismiss' || googleResponse?.type === 'cancel') {
      setLoadingProvider(null);
    }
  }, [googleResponse, onSuccess, t]);

  useEffect(() => {
    if (fbResponse?.type === 'success') {
      (async () => {
        try {
          setLoadingProvider('facebook');
          const result = await completeFacebookAuth(fbResponse.authentication);
          onSuccess(result);
        } catch (e: unknown) {
          Alert.alert(t('error'), e instanceof Error ? e.message : t('loginFailed'));
        } finally {
          setLoadingProvider(null);
        }
      })();
    } else if (fbResponse?.type === 'error') {
      setLoadingProvider(null);
      Alert.alert(t('error'), fbResponse.error?.message || t('loginFailed'));
    } else if (fbResponse?.type === 'dismiss' || fbResponse?.type === 'cancel') {
      setLoadingProvider(null);
    }
  }, [fbResponse, onSuccess, t]);

  const handlePress = async (provider: SocialProvider) => {
    if (!isSocialLoginConfigured(provider)) {
      Alert.alert(t('error'), getSocialLoginSetupHint(provider));
      return;
    }
    try {
      setLoadingProvider(provider);
      if (provider === 'google') {
        const result = await promptGoogle();
        if (!result || result.type !== 'success') {
          setLoadingProvider(null);
        }
        return;
      }
      if (provider === 'facebook') {
        const result = await promptFacebook();
        if (!result || result.type !== 'success') {
          setLoadingProvider(null);
        }
        return;
      }
      if (provider === 'tiktok') {
        onSuccess(await signInWithTikTok());
        setLoadingProvider(null);
      }
    } catch (e: unknown) {
      setLoadingProvider(null);
      Alert.alert(t('error'), e instanceof Error ? e.message : t('loginFailed'));
    }
  };

  const configuredProviders = PROVIDERS.filter((p) => isSocialLoginConfigured(p.id));

  return (
    <View style={tw`mt-4`}>
      <Text style={tw`text-center text-gray-500 mb-3`}>{t('orContinueWith') || 'Or continue with'}</Text>
      {configuredProviders.length === 0 ? (
        <Text style={tw`text-center text-xs text-gray-400 mb-2`}>
          {t('socialLoginSetupHint') || 'Add OAuth keys to .env — see SOCIAL_LOGIN_SETUP.md'}
        </Text>
      ) : null}
      {PROVIDERS.map((p) => {
        const configured = isSocialLoginConfigured(p.id);
        const busy = loadingProvider === p.id || disabled;
        const ready =
          p.id === 'google' ? !!googleRequest : p.id === 'facebook' ? !!fbRequest : configured;
        return (
          <TouchableOpacity
            key={p.id}
            onPress={() => handlePress(p.id)}
            disabled={busy || !ready || !configured}
            style={tw`flex-row items-center justify-center border border-gray-200 rounded-full py-3 mb-2 ${
              configured ? 'bg-white' : 'bg-gray-50 opacity-60'
            }`}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <>
                <View style={tw`mr-2`}>{p.icon}</View>
                <Text style={tw`font-semibold text-gray-800`}>{t(p.labelKey as never) || p.fallback}</Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
