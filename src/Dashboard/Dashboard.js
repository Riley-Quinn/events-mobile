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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ability, updateAbility } from '../casl/ability';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [roleName, setRoleName] = useState('');

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

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (token) {
        await axios.post(
          'http://10.0.2.2:4000/api/auth/logout',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      // Clear all data
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
          <Icon name="menu" size={30} color="#000" />

          {/* Profile Icon */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')} // change 'Profile' to your profile screen name
            style={{ marginRight: 20 }}
          >
            <Icon name="account-circle" size={30} color="#000" />
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
          <Text style={styles.reminderSubText}>You have 3 events today</Text>
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
            onPress={() => navigation.navigate('GalleryScreen')}
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
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 20, // or use margin in icons for spacing
  },
  menuIcon: {
    alignSelf: 'flex-start',
    marginBottom: 15,
  },

  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  info: {
    marginLeft: 10,
  },

  role: {
    fontSize: 14,
    color: '#000',
    backgroundColor: '#ffeee6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },

  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },

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

  reminderIcon: {
    marginRight: 15,
  },

  reminderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },

  reminderSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },

  card: {
    backgroundColor: '#ffeee6',
    flex: 1,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginTop: -20,
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
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

  icons: {
    marginBottom: 10,
  },

  iconLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },

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

  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  addOutlinedText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
