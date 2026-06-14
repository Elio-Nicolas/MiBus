import 'dotenv/config';

export default {
  expo: {
    name: "mobile-app",
    slug: "mobile-app",

    android: {
      usesCleartextTraffic: true,
      package: "com.eliob.mobileapp",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    },

    ios: {
      supportsTablet: true
    },

    version: "1.0.0"
  }
};