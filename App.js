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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
