import { ExpoConfig, ConfigContext } from 'expo/config'

function googleIosUrlScheme(iosClientId: string | undefined): string | null {
  if (!iosClientId) return null
  const prefix = '.apps.googleusercontent.com'
  if (!iosClientId.endsWith(prefix)) return null
  const id = iosClientId.slice(0, -prefix.length)
  return `com.googleusercontent.apps.${id}`
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const facebookAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID
  const googleIosScheme = googleIosUrlScheme(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID)

  const urlSchemes: string[] = ['kudya']
  if (facebookAppId) urlSchemes.push(`fb${facebookAppId}`)
  if (googleIosScheme) urlSchemes.push(googleIosScheme)

  const existingUrlTypes = config.ios?.infoPlist?.CFBundleURLTypes ?? []
  const mergedUrlTypes = [
    ...(Array.isArray(existingUrlTypes) ? existingUrlTypes : []),
    {
      CFBundleURLSchemes: urlSchemes,
    },
  ]

  return {
    ...config,
    slug: 'kudya',
    name: 'kudya',
    scheme: 'kudya',
    plugins: [
      'expo-localization',
      'expo-font',
      'expo-web-browser',
      'expo-secure-store',
      'expo-apple-authentication',
      [
        'expo-local-authentication',
        {
          faceIDPermission: 'Allow Kudya to use Face ID for secure sign-in.',
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            minSdkVersion: 24,
          },
        },
      ],
    ],
    ios: {
      ...config.ios,
      infoPlist: {
        ...config.ios?.infoPlist,
        ...(facebookAppId
          ? {
              FacebookAppID: facebookAppId,
              FacebookDisplayName: config.name ?? 'Kudya',
            }
          : {}),
        CFBundleURLTypes: mergedUrlTypes,
        LSApplicationQueriesSchemes: [
          'fbapi',
          'fb-messenger-share-api',
          'fbauth2',
          'fbshareextension',
        ],
      },
    },
    android: {
      ...config.android,
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: false,
          data: [{ scheme: 'kudya', pathPrefix: '/oauth' }],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    extra: {
      ...config.extra,
      eas: config.extra?.eas,
      facebookAppId,
      googleMapsApiKey:
        process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? config.extra?.googleMapsApiKey,
    },
  }
}
