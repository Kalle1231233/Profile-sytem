import 'dotenv/config';

/** @type {import('@expo/config').ExpoConfig} */
export default ({ config }) => ({
  ...config,
  name: 'Location Permission Map',
  slug: 'location-permission-map',
  version: '1.0.0',
  orientation: 'portrait',
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Die App benötigt Ihren Standort, um Ihre Position auf der Karte anzeigen zu können.'
    }
  },
  android: {
    permissions: ['ACCESS_FINE_LOCATION'],
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY || ''
      }
    }
  },
  web: {
    bundler: 'metro'
  },
  plugins: ['expo-location'],
  extra: {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || null
  }
});
