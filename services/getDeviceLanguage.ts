import * as Localization from 'expo-localization'

export const getDeviceLanguage = (): string => {
  return Localization.getLocales()[0]?.languageCode ?? 'en'
}
