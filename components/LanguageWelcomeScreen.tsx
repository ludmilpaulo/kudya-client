import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import { SupportedLocale, detectDeviceLanguage, localeLabels } from '../configs/i18n';
import { useLanguage } from '../contexts/LanguageContext';

const WELCOME_TITLES: Record<SupportedLocale, string> = {
  en: 'Choose your language',
  pt: 'Escolha o idioma',
  fr: 'Choisissez votre langue',
  es: 'Elija su idioma',
};

const WELCOME_SUBTITLES: Record<SupportedLocale, string> = {
  en: 'Pick the language you prefer for Kudya',
  pt: 'Escolha o idioma que prefere para o Kudya',
  fr: 'Choisissez la langue que vous préférez pour Kudya',
  es: 'Elija el idioma que prefiere para Kudya',
};

const CONTINUE_LABELS: Record<SupportedLocale, string> = {
  en: 'Continue',
  pt: 'Continuar',
  fr: 'Continuer',
  es: 'Continuar',
};

export default function LanguageWelcomeScreen() {
  const { supportedLocales, chooseLanguage } = useLanguage();
  const suggested = useMemo(() => detectDeviceLanguage(), []);
  const [selected, setSelected] = useState<SupportedLocale>(suggested);
  const [submitting, setSubmitting] = useState(false);

  const onContinue = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await chooseLanguage(selected);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E3A8A', '#2563EB']} style={tw`flex-1`}>
      <SafeAreaView style={tw`flex-1 px-6`}>
        <View style={tw`flex-1 justify-center`}>
          <View style={tw`items-center mb-10`}>
            <View style={tw`w-16 h-16 rounded-2xl bg-white/15 items-center justify-center mb-4`}>
              <Feather name="globe" size={32} color="#fff" />
            </View>
            <Text style={tw`text-white text-3xl font-bold text-center`}>Kudya</Text>
            <Text style={tw`text-blue-100 text-sm mt-1 tracking-widest uppercase`}>
              Your life, one app
            </Text>
          </View>

          <View style={tw`mb-8`}>
            {supportedLocales.map((code) => (
              <Text key={`title-${code}`} style={tw`text-white/90 text-center text-lg font-semibold`}>
                {WELCOME_TITLES[code]}
              </Text>
            ))}
            <Text style={tw`text-blue-100/80 text-center text-sm mt-3`}>
              {WELCOME_SUBTITLES[selected]}
            </Text>
          </View>

          <View style={tw`gap-3`}>
            {supportedLocales.map((code) => {
              const isSelected = selected === code;
              return (
                <TouchableOpacity
                  key={code}
                  activeOpacity={0.85}
                  onPress={() => setSelected(code)}
                  style={tw`flex-row items-center px-5 py-4 rounded-2xl border-2 ${
                    isSelected ? 'bg-white border-white' : 'bg-white/10 border-white/20'
                  }`}
                >
                  <View
                    style={tw`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                      isSelected ? 'bg-blue-600' : 'bg-white/15'
                    }`}
                  >
                    <Text style={tw`text-white font-bold text-sm uppercase`}>{code}</Text>
                  </View>
                  <Text style={tw`flex-1 text-lg font-semibold ${isSelected ? 'text-slate-900' : 'text-white'}`}>
                    {localeLabels[code]}
                  </Text>
                  {isSelected && <Feather name="check-circle" size={22} color="#2563EB" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          disabled={submitting}
          onPress={onContinue}
          style={tw`mb-4 py-4 rounded-2xl bg-white items-center justify-center flex-row ${
            submitting ? 'opacity-70' : ''
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="#2563EB" />
          ) : (
            <>
              <Text style={tw`text-blue-700 font-bold text-lg mr-2`}>{CONTINUE_LABELS[selected]}</Text>
              <Feather name="arrow-right" size={20} color="#1D4ED8" />
            </>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}
