/* eslint-env jest */
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import React from 'react';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Componente vacío reutilizable para mockear módulos nativos de UI.
const MockComponent = (props) => React.createElement('View', props, props.children);

// Variables de entorno (react-native-dotenv / @env).
jest.mock(
  '@env',
  () => ({
    GOOGLE_WEB_CLIENT_ID: 'mock-google-web-client-id',
    SUPABASE_URL: 'https://mock.supabase.co',
    SUPABASE_ANON_KEY: 'mock-anon-key',
  }),
  { virtual: true },
);

// Firebase: en Jest no existen los módulos nativos.
jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: () => ({}),
  firebase: { app: () => ({}) },
}));

jest.mock('@react-native-firebase/messaging', () => {
  const messaging = () => ({
    setBackgroundMessageHandler: jest.fn(),
    requestPermission: jest.fn(() => Promise.resolve(1)),
    getToken: jest.fn(() => Promise.resolve('mock-fcm-token')),
    onTokenRefresh: jest.fn(() => jest.fn()),
    onMessage: jest.fn(() => jest.fn()),
    onNotificationOpenedApp: jest.fn(() => jest.fn()),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
  });
  messaging.AuthorizationStatus = { AUTHORIZED: 1, PROVISIONAL: 2, DENIED: 0 };
  return { __esModule: true, default: messaging };
});

// Autenticación social.
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() => Promise.resolve({})),
    signOut: jest.fn(() => Promise.resolve()),
    isSignedIn: jest.fn(() => Promise.resolve(false)),
  },
  GoogleSigninButton: MockComponent,
  statusCodes: {},
}));

jest.mock('@invertase/react-native-apple-authentication', () => ({
  appleAuth: {
    isSupported: false,
    performRequest: jest.fn(() => Promise.resolve({})),
    Operation: { LOGIN: 1 },
    Scope: { FULL_NAME: 0, EMAIL: 1 },
  },
  AppleButton: MockComponent,
}));

// Componentes nativos de UI.
jest.mock('react-native-maps', () => {
  const RN = require('react-native');
  const Map = (props) => RN.View(props);
  return {
    __esModule: true,
    default: Map,
    Marker: MockComponent,
    Polyline: MockComponent,
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('react-native-webview', () => ({ WebView: MockComponent }));

jest.mock('react-native-date-picker', () => ({ __esModule: true, default: MockComponent }));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(() => Promise.resolve({ assets: [] })),
  launchCamera: jest.fn(() => Promise.resolve({ assets: [] })),
}));

jest.mock('react-native-geolocation-service', () => ({
  __esModule: true,
  default: {
    requestAuthorization: jest.fn(() => Promise.resolve('granted')),
    getCurrentPosition: jest.fn(),
  },
}));
