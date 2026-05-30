import { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  slug: 'kudya',
  name: 'kudya',
  scheme: 'kudya',
  plugins: [
    'expo-localization',
    'expo-font',
    'expo-web-browser',
    [
      'expo-build-properties',
      {
        android: {
          newArchEnabled: false,
        },
        ios: {
          newArchEnabled: false,
        },
      },
    ],
  ],
  extra: {
    ...config.extra,
    eas: config.extra?.eas,
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? config.extra?.googleMapsApiKey,
  },
})
