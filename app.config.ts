import { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  slug: 'kudya',
  name: 'kudya',
  plugins: [
    'expo-localization',
  ],
})
