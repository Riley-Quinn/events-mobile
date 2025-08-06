import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import PushNotification from 'react-native-push-notification';

// Create notification channel (required for Android)
PushNotification.createChannel(
  {
    channelId: 'default-channel-id',
    channelName: 'Default Channel',
    channelDescription: 'Used for general notifications',
    importance: 4,
    vibrate: true,
  },
  created => console.log(`✅ Notification channel created: ${created}`),
);

// Background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📥 FCM Background Message:', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
