/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ability, updateAbility } from '../casl/ability';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [todayEvents, setTodayEvents] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      const name = await AsyncStorage.getItem('userName');
      const roleId = await AsyncStorage.getItem('roleId');
      const permissions = JSON.parse(await AsyncStorage.getItem('permissions'));

      setUserName(name || 'User');
      setRoleName(getRoleLabel(roleId));

      updateAbility(permissions);
    };

    loadUserData();
    fetchTodayEvents();
    fetchTodayTasks();
  }, []);

  const getRoleLabel = roleId => {
    switch (roleId) {
      case '1':
        return 'Super Admin';
      case '2':
        return 'Org Admin';
      case '3':
        return 'Event Manager';
      case '4':
        return 'Booth President';
      case '5':
        return 'Karyakarta';
      case '6':
        return 'Supporter';
      default:
        return 'User';
    }
  };

  const fetchTodayEvents = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/events/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const today = moment().format('YYYY-MM-DD');
      const todaysEvents = res.data.filter(
        event => moment(event.date).format('YYYY-MM-DD') === today,
      );

      setTodayEvents(todaysEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchTodayTasks = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const res = await axios.get(`${BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allTasks = res.data.list || [];

      const today = moment().format('YYYY-MM-DD');

      const todaysTasks = allTasks.filter(
        task => moment(task.created_at).format('YYYY-MM-DD') === today,
      );

      setTodayTasks(todaysTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (token) {
        await axios.post(
          `${BASE_URL}/api/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      await AsyncStorage.multiRemove([
        'token',
        'userName',
        'roleId',
        'userId',
        'permissions',
      ]);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error', error);
      Alert.alert(
        'Logout Failed',
        error.response?.data?.message || error.message,
      );
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/bgg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image
              source={require('../../assets/Profile.png')}
              style={{ width: 40, height: 40, borderRadius: 18 }}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout}>
            <Icon name="logout" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.details}>
          <View style={styles.info}>
            <Text style={styles.role}>{roleName}</Text>
            <Text style={styles.name}>{userName}</Text>
          </View>
        </View>
      </View>
      <View style={styles.reminder}>
        <Icon
          name="calendar-month-outline"
          size={70}
          color="#FF7F2A"
          style={styles.reminderIcon}
        />

        <View>
          <Text style={styles.reminderText}>Reminder</Text>

          <View
            style={{
              flexDirection: 'row',
              width: '100%',
            }}
          >
            <Text
              style={[styles.reminderSubText]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {todayEvents.length > 0
                ? `You have ${todayEvents.length} event${
                    todayEvents.length > 1 ? 's' : ''
                  }, `
                : 'No events,'}
            </Text>

            <Text
              style={[styles.reminderSubText]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {todayTasks.length > 0
                ? ` ${todayTasks.length} task${
                    todayTasks.length > 1 ? 's' : ''
                  } today`
                : ' tasks today'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.iconRow}>
          <TouchableOpacity
            style={styles.iconBox}
            onPress={() => navigation.navigate('DayView')}
          >
            <Icon
              name="calendar-month-outline"
              size={70}
              color="#000"
              style={styles.icons}
            />
            <Text style={styles.iconLabel}>Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBox}
            onPress={() => navigation.navigate('Gallery')}
          >
            <Icon
              name="image-multiple-outline"
              size={70}
              color="#000"
              style={styles.icons}
            />
            <Text style={styles.iconLabel}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {ability.can('add', 'Event') && (
          <TouchableOpacity
            style={styles.addButtonFilled}
            onPress={() => navigation.navigate('TaskList')}
          >
            <Text style={styles.addButtonText}>Tasks</Text>
          </TouchableOpacity>
        )}

        {ability.can('add', 'Media') && (
          <TouchableOpacity
            style={styles.addButtonOutlined}
            onPress={() => navigation.navigate('PressReleaseList')}
          >
            <Text style={styles.addOutlinedText}>Press Release</Text>
          </TouchableOpacity>
        )}

        {ability.can('add', 'Media') && (
          <View style={{ marginTop: 15, width: '100%' }}>
            <TouchableOpacity
              style={styles.addButtonFilled}
              onPress={() => navigation.navigate('EventsList')}
            >
              <Text style={styles.addButtonText}> Events</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    width: '100%',
    backgroundColor: '#FF7F2A',
    paddingVertical: height * 0.05,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  details: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  info: { marginLeft: 10 },
  role: {
    fontSize: 14,
    color: '#000',
    backgroundColor: '#ffeee6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  name: { fontSize: 22, fontWeight: 'bold', color: '#000', marginBottom: 15 },
  reminder: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: -height * 0.05,
    padding: 15,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 99,
  },
  reminderIcon: { marginRight: 15 },
  reminderText: { fontSize: 18, fontWeight: '600', color: '#000' },
  reminderSubText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
    flexShrink: 1,
    flexWrap: 'wrap',
  },

  card: {
    backgroundColor: '#ffeee6',
    flex: 1,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginTop: -50,
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
    marginTop: 30,
  },
  iconBox: {
    width: width * 0.42,
    aspectRatio: 1,
    backgroundColor: '#FFF0E6',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF7F2A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  icons: { marginBottom: 10 },
  iconLabel: { fontSize: 16, fontWeight: '500', color: '#000' },
  addButtonFilled: {
    backgroundColor: '#FF7F2A',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonOutlined: {
    borderWidth: 2,
    borderColor: '#FF7F2A',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  addOutlinedText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});

export default DashboardScreen;
