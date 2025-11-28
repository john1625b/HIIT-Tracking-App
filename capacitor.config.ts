import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.velovibe.app',
  appName: 'VeloVibe',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // Keyboard plugin configuration helps prevent UI jumping on Android
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  }
};

export default config;