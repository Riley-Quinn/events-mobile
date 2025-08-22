import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/Authentication/Login';
import DashboardScreen from './src/Dashboard/Dashboard';
import AddEvents from './src/Events/AddEvents';
import CalendarScreen from './src/Calendar/Calendar';
import DayView from './src/Calendar/DayView';
import WeekView from './src/Calendar/WeekView';
import MonthView from './src/Calendar/MonthView';
import AddTasks from './src/Tasks/AddTasks';
import TaskList from './src/Tasks/TaskList';
import PressReleaseList from './src/PressRelease/PressReleaseList';
import AddPressRelease from './src/PressRelease/AddPressRelease';
import Profile from './src/Dashboard/Profile';
import EventList from './src/Events/EventList';
import ViewEvent from './src/Events/ViewEvent';
import EditEvent from './src/Events/EditEvent';
import ViewTask from './src/Tasks/ViewTask';
import Gallery from './src/Gallery/Gallery';
import ViewPressRelease from './src/PressRelease/ViewPressRelease';
import EditPressRelease from './src/PressRelease/EditPressRelease';
import EditTask from './src/Tasks/EditTask';
import PushNotification from 'react-native-push-notification';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import messaging from '@react-native-firebase/messaging';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

const Stack = createNativeStackNavigator();

// 🔴 Background FCM handler (outside component)
messaging().setBackgroundMessageHandler(async remoteMessage => {});

export default function App() {
  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }
      await messaging().requestPermission();
    };

    requestPermission();

    // 👇 Create channel only once
    PushNotification.createChannel(
      {
        channelId: 'default-channel-id',
        channelName: 'Default Channel',
        importance: 4,
        vibrate: true,
      },
      created =>
        console.log(`🛠️ Channel '${created ? 'created' : 'already exists'}'`),
    );

    // ✅ Foreground FCM messages → trigger local notification
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('🔔 Foreground FCM:', remoteMessage);
      PushNotification.localNotification({
        channelId: 'default-channel-id',
        title: remoteMessage.notification?.title || 'Notification',
        message: remoteMessage.notification?.body || 'You have a new message',
      });
    });

    const unsubscribeOpened = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log('➡️ Opened from background:', remoteMessage);
      },
    );

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('🚀 Opened from quit state:', remoteMessage);
        }
      });

    return () => {
      unsubscribe();
      unsubscribeOpened();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
            <Stack.Screen name="AddEvents" component={AddEvents} />
            <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
            <Stack.Screen name="DayView" component={DayView} />
            <Stack.Screen name="WeekView" component={WeekView} />
            <Stack.Screen name="MonthView" component={MonthView} />
            <Stack.Screen name="AddTasks" component={AddTasks} />
            <Stack.Screen name="TaskList" component={TaskList} />
            <Stack.Screen
              name="PressReleaseList"
              component={PressReleaseList}
            />
            <Stack.Screen name="AddPressRelease" component={AddPressRelease} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="AddEvent" component={AddEvents} />
            <Stack.Screen name="EventsList" component={EventList} />
            <Stack.Screen name="ViewEvent" component={ViewEvent} />
            <Stack.Screen name="EditEvent" component={EditEvent} />
            <Stack.Screen name="ViewTask" component={ViewTask} />
            <Stack.Screen name="Gallery" component={Gallery} />
            <Stack.Screen
              name="ViewPressRelease"
              component={ViewPressRelease}
            />
            <Stack.Screen
              name="EditPressRelease"
              component={EditPressRelease}
            />
            <Stack.Screen name="EditTask" component={EditTask} />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
