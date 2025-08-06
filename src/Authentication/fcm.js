// fcm.js
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import { BASE_URL } from '@env';
import { Platform, PermissionsAndroid } from 'react-native';

const FCM_STORE_TOKEN_URL = `${BASE_URL}/api/fcm/store-token`;

export const requestNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('✅ Android 13+ Notification permission granted');
        return true;
      } else {
        console.warn('❌ Android 13+ Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Permission request error:', error);
      return false;
    }
  }

  // iOS or Android < 13
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  console.log('🔔 Notification permission status:', authStatus);
  return enabled;
};

export const getFcmToken = async () => {
  const token = await messaging().getToken();
  console.log('Received FCM token:', token);
  return token;
};

export const handleFcmToken = async (
  userId,
  getTokenFunction,
  isListenerAttached,
  setIsListenerAttached,
) => {
  try {
    const token = await getTokenFunction();
    console.log('FCM Token:', token);
    console.log('User ID:', userId);
    console.log('API URL:', FCM_STORE_TOKEN_URL);

    await axios.post(FCM_STORE_TOKEN_URL, {
      user_id: userId,
      fcm_token: token,
    });

    if (!isListenerAttached) {
      messaging().onTokenRefresh(async newToken => {
        console.log('FCM Token refreshed:', newToken);
        await axios.post(FCM_STORE_TOKEN_URL, {
          user_id: userId,
          fcm_token: newToken,
        });
      });

      setIsListenerAttached(true);
    }
  } catch (err) {
    if (err.response) {
      console.error('❌ Axios Error Response:', err.response.data);
      console.error('❌ Status Code:', err.response.status);
    } else if (err.request) {
      console.error('❌ No response received:', err.request);
    } else {
      console.error('❌ Error setting up request:', err.message);
    }
  }
};
