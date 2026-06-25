/**
 * @format
 */
import 'react-native-url-polyfill/auto';
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Notificaciones FCM con la app cerrada o en background (las de tipo
// "notification" se muestran solas; este handler procesa la data adjunta).
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Notificación recibida en background:', remoteMessage?.messageId);
});

AppRegistry.registerComponent(appName, () => App);
