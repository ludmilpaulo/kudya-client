import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import tw from 'twrnc';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageWelcomeScreen from './LanguageWelcomeScreen';

export default function AppLanguageGate({ children }: { children: React.ReactNode }) {
  const { isReady, hasChosenLanguage } = useLanguage();

  if (!isReady) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-slate-950`}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!hasChosenLanguage) {
    return <LanguageWelcomeScreen />;
  }

  return <>{children}</>;
}
