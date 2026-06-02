import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { useLanguage } from '../contexts/LanguageContext';
import { SupportedLocale, localeLabels } from '../configs/i18n';
import { useTranslation } from '../hooks/useTranslation';

export default function LanguagePicker({ compact = false }: { compact?: boolean }) {
  const { languageCode, setLanguage, supportedLocales: locales } = useLanguage();
  const { t } = useTranslation();

  return (
    <View style={tw`${compact ? 'mb-2' : 'mb-4'}`}>
      <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
        {t('preferredLanguage', 'Language')}
      </Text>
      <View style={tw`flex-row flex-wrap gap-2`}>
        {locales.map((code: SupportedLocale) => {
          const selected = languageCode === code;
          return (
            <TouchableOpacity
              key={code}
              onPress={() => setLanguage(code)}
              style={tw`px-4 py-2 rounded-full border ${
                selected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
              }`}
            >
              <Text style={tw`${selected ? 'text-white' : 'text-gray-800'} font-medium text-sm`}>
                {localeLabels[code]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
