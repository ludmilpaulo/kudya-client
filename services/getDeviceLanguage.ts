import * as Localization from 'expo-localization'

export const getDeviceLanguage = (): string => {
  return Localization.locale.split('-')[0] // "en", "pt", etc.
}
