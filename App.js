import React from 'react';
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

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
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
          <Stack.Screen name="PressReleaseList" component={PressReleaseList} />
          <Stack.Screen name="AddPressRelease" component={AddPressRelease} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="AddEvent" component={AddEvents} />
          <Stack.Screen name="EventsList" component={EventList} />
          <Stack.Screen name="ViewEvent" component={ViewEvent} />
          <Stack.Screen name="EditEvent" component={EditEvent} />
          <Stack.Screen name="ViewTask" component={ViewTask} />
          <Stack.Screen name="Gallery" component={Gallery} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
