import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Platform,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Icons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import moment from 'moment';
import PushNotification from 'react-native-push-notification';
import { Linking, Alert } from 'react-native';

import messaging from '@react-native-firebase/messaging';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [todayEvents, setTodayEvents] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [birthdayNames, setBirthdayNames] = useState([]);
  const [taskStatusCounts, setTaskStatusCounts] = useState({});
  const [pressReleaseCounts, setPressReleaseCounts] = useState({});

  const scrollRef = useRef(null);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('🔔 Foreground FCM:', remoteMessage);

      PushNotification.localNotification({
        channelId: 'default-channel-id',
        title: remoteMessage.notification?.title || 'Notification',
        message: remoteMessage.notification?.body || 'You have a message',
        bigText: remoteMessage.notification?.body || '',
        playSound: true,
        soundName: 'default',
        importance: 'high',
        vibrate: true,
      });
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      const name = await AsyncStorage.getItem('userName');
      const roleId = await AsyncStorage.getItem('roleId');
      setUserName(name || 'User');
      setRoleName(getRoleLabel(roleId));
    };

    loadUserData();
    fetchTodayEvents();
    fetchTodayTasks();
    fetchTodayBirthdays();

    const fetchStatusCounts = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        const resTasks = await axios.get(`${BASE_URL}/api/tasks?all=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const tasks = Array.isArray(resTasks.data.list)
          ? resTasks.data.list
          : [];

        const taskCounts = tasks.reduce(
          (acc, task) => {
            const s = task.status_name ?? task.status;
            if (acc[s] !== undefined) acc[s] += 1;
            return acc;
          },
          {
            Open: 0,
            Pending: 0,
            'In Progress': 0,
            'On-Hold': 0,
            Done: 0,
            Closed: 0,
          },
        );

        setTaskStatusCounts(taskCounts);

        const resPR = await axios.get(`${BASE_URL}/api/press-release/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const prs = Array.isArray(resPR.data) ? resPR.data : [];

        const pressCounts = prs.reduce(
          (acc, pr) => {
            const s = pr.status_name ?? pr.status;
            if (acc[s] !== undefined) acc[s] += 1;
            return acc;
          },
          {
            Draft: 0,
            'Open for Review': 0,
            'Ready to Publish': 0,
            'Feedback Pending': 0,
            Unpublish: 0,
            Published: 0,
          },
        );

        setPressReleaseCounts(pressCounts);
      } catch (err) {
        console.error('Error fetching status counts:', err);
      }
    };

    fetchStatusCounts();
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
      setTodayEvents(
        res.data.filter(e => moment(e.date).format('YYYY-MM-DD') === today),
      );
    } catch (err) {
      console.error('Events error', err);
    }
  };

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (token) {
        await axios.post(
          `${BASE_URL}/api/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
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
  const fetchTodayTasks = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const today = moment().format('YYYY-MM-DD');
      const allTasks = res.data.list || [];

      const filteredTasks = allTasks.filter(
        t => moment(t.created_at).format('YYYY-MM-DD') === today,
      );
      setTodayTasks(filteredTasks);
    } catch (err) {
      console.error('Tasks error', err);
    }
  };

  const shareBirthdayWishes = names => {
    if (names.length === 0) {
      Alert.alert('No birthdays to share!');
      return;
    }

    const message = `Happy Birthday ${names.join(', ')}! 🎉🎂`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    const storeLink =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/app/whatsapp-messenger/id310633997'
        : 'https://play.google.com/store/apps/details?id=com.whatsapp';

    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          Alert.alert(
            'WhatsApp not installed',
            'You need WhatsApp to send birthday wishes. Install it from here?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Install',
                onPress: () => Linking.openURL(storeLink),
              },
            ],
          );
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => console.error('Error opening WhatsApp', err));
  };

  const fetchTodayBirthdays = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/birthdays/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const today = moment().format('YYYY-MM-DD');
      const todayBirthdays = res.data.filter(
        b => moment(b.birth_date).format('YYYY-MM-DD') === today,
      );

      setBirthdayNames(todayBirthdays.map(b => b.name));
    } catch (err) {
      console.error('Birthdays error', err);
    }
  };

  useEffect(() => {
    if (birthdayNames.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => {
          const nextIndex = (prev + 1) % birthdayNames.length;
          scrollRef.current?.scrollTo({
            x: nextIndex * width,
            animated: true,
          });
          return nextIndex;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [birthdayNames]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Image
                source={require('../../assets/Profile.png')}
                style={styles.avatar}
              />
            </TouchableOpacity>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.roleBadge}>{roleName}</Text>
              <Text style={styles.name}>{userName}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.navigate('DayView')}>
              <Icon
                name="calendar-outline"
                size={28}
                color="#000"
                style={{ marginRight: 15 }}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Icons name="log-out-outline" size={28} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('DayView')}>
        <View style={styles.birthdayWrapper}>
          {birthdayNames.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              ref={scrollRef}
            >
              {birthdayNames.map((name, index) => (
                <View
                  key={index}
                  style={[styles.birthdayCard, { width: width - 32 }]}
                >
                  <TouchableOpacity
                    onPress={() => shareBirthdayWishes([name])}
                    style={styles.shareButton}
                  >
                    <Icon name="share-outline" size={24} color="#FF6B81" />
                  </TouchableOpacity>

                  <View style={styles.birthdayContent}>
                    <FontAwesome5
                      name="birthday-cake"
                      size={40}
                      color="#FF6B81"
                      style={{ marginRight: 16 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.birthdayTitle}>Happy Birthday</Text>
                      <View style={{ alignItems: 'flex-start' }}>
                        <Text style={styles.birthdayName}>{name}</Text>
                        <Text style={styles.birthdayRole}>{roleName}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.birthdayCard}>
              <Text style={[styles.birthdayText, { textAlign: 'center' }]}>
                No Birthdays Today
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          marginTop: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#000',
              marginRight: 15,
            }}
          >
            Task Status
          </Text>

          <TouchableOpacity onPress={() => navigation.navigate('TaskList')}>
            <View
              style={{
                backgroundColor: '#fff',
                padding: 4,
                borderRadius: 4,
              }}
            >
              <Feather name="arrow-up-right" size={18} color="#000" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#000',
              marginRight: 15,
            }}
          >
            Press Release Status
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PressReleaseList')}
          >
            <View
              style={{
                backgroundColor: '#fff',
                padding: 4,
                borderRadius: 4,
              }}
            >
              <Feather name="arrow-up-right" size={18} color="#000" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.rowContainer}>
        <View
          style={{
            flex: 1,
            marginRight: 10,
            backgroundColor: '#fff',
            padding: 8,
            borderRadius: 12,
          }}
        >
          {[
            {
              icon: 'playlist-check',
              label: 'Open',
              bg: '#FF9AA8',
              text: '#974D58',
            },
            {
              icon: 'clock-outline',
              label: 'Pending',
              bg: '#FFE0A2',
              text: '#987121',
            },
            {
              icon: 'progress-clock',
              label: 'In Progress',
              bg: '#AED0FE',
              text: '#2D5996',
            },
            {
              icon: 'pause-circle-outline',
              label: 'On-Hold',
              bg: '#FBD2A8',
              text: '#2E1B1B',
            },
            {
              icon: 'check-circle-outline',
              label: 'Done',
              bg: '#8BE9AA',
              text: '#29613C',
            },
            {
              icon: 'close-circle-outline',
              label: 'Closed',
              bg: '#EBEBEB',
              text: '#29613C',
            },
          ].map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 3,
                borderBottomWidth: i !== 5 ? 1 : 0,
                borderBottomColor: '#ccc',
              }}
            >
              <View
                style={{
                  backgroundColor: item.bg,
                  padding: 3,

                  borderRadius: 16,
                }}
              >
                <Icon name={item.icon} size={20} color={item.text} />
              </View>
              <Text
                style={{
                  flex: 1,
                  marginLeft: 13,
                  fontSize: 13,
                  fontWeight: '600',
                  color: item.text,
                }}
              >
                {item.label}
              </Text>
              <Text
                style={{
                  marginRight: 30,
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: '#000',
                }}
              >
                {taskStatusCounts[item.label] || 0}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={{
            flex: 1,
            marginLeft: 15,
            backgroundColor: '#fff',
            padding: 8,
            borderRadius: 12,
          }}
        >
          {[
            {
              icon: 'drafts',
              lib: 'Material',
              label: 'Draft',
              bg: '#FF9AA8',
              text: '#080808',
            },
            {
              icon: 'book-outline',
              lib: 'Community',
              label: 'Open for Review',
              bg: '#FBD2A8',
              text: '#080808',
            },
            {
              icon: 'check-circle',
              lib: 'Material',
              label: 'Ready to Publish',
              bg: '#8BE9AA',
              text: '#080808',
            },
            {
              icon: 'feedback',
              lib: 'Material',
              label: 'Feedback Pending',
              bg: '#FBD2A8',
              text: '#080808',
            },
            {
              icon: 'book-outline',
              lib: 'Community',
              label: 'Published',
              bg: '#8BE9AA',
              text: '#080808',
            },
            {
              icon: 'unpublished',
              lib: 'Material',
              label: 'Unpublished',
              bg: '#AED0FE',
              text: '#080808',
            },
          ].map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 3,
                borderBottomWidth: i !== 5 ? 1 : 0,
                borderBottomColor: '#ccc',
              }}
            >
              <View
                style={{
                  backgroundColor: item.bg,
                  padding: 3,
                  borderRadius: 16,
                }}
              >
                {item.lib === 'Material' ? (
                  <MaterialIcons name={item.icon} size={20} color={item.text} />
                ) : (
                  <Icon name={item.icon} size={20} color={item.text} />
                )}
              </View>

              <Text
                style={{
                  flex: 1,
                  marginLeft: 13,
                  fontSize: 13,
                  fontWeight: '600',
                  color: item.text,
                }}
              >
                {item.label}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#000' }}>
                {pressReleaseCounts[item.label] || 0}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginBottom: 8,
          }}
        >
          <Text style={styles.sectionTitle}>Today Schedules</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DayView')}>
            <Text
              style={{
                color: '#888',
                fontWeight: '600',
                backgroundColor: '#fff',
                padding: 10,
                borderRadius: 10,
              }}
            >
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {todayTasks.length === 0 && todayEvents.length === 0 ? (
          <Text
            style={{
              fontStyle: 'italic',
              color: '#777',
              textAlign: 'center',
              paddingVertical: 15,
              marginHorizontal: 20,
            }}
          >
            No activities scheduled for Today
          </Text>
        ) : (
          <>
            {todayTasks.map((task, i) => {
              const time = moment(task.created_at).format('hh:mm');
              const ampm = moment(task.created_at).format('A');

              return (
                <TouchableOpacity
                  key={`task-${i}`}
                  onPress={() => navigation.navigate('TaskList')}
                  style={{
                    backgroundColor: '#4A90E2',
                    borderRadius: 12,
                    marginHorizontal: 20,
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    position: 'relative',
                  }}
                >
                  <View
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: '#fff',
                      paddingHorizontal: 8,
                      borderRadius: 12,
                      height: 18,
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: '600',
                        fontSize: 12,
                        color: '#4A90E2',
                      }}
                    >
                      Task
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 16,
                        color: '#fff',
                        width: 80,
                      }}
                    >
                      {time}
                    </Text>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 16,
                        color: '#fff',
                        flex: 1,
                      }}
                      numberOfLines={1}
                    >
                      {task.title}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 14,
                        color: '#f5f5f5',
                        width: 80,
                      }}
                    >
                      {ampm}
                    </Text>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 14,
                        color: '#f5f5f5',
                        flex: 1,
                      }}
                      numberOfLines={1}
                    >
                      {task.location}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {todayEvents.map((event, i) => {
              const time = moment(event.created_at).format('hh:mm');
              const ampm = moment(event.created_at).format('A');

              return (
                <TouchableOpacity
                  key={`event-${i}`}
                  onPress={() => navigation.navigate('EventsList')}
                  style={{
                    backgroundColor: '#1ABC9C',
                    borderRadius: 12,
                    marginHorizontal: 20,
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    position: 'relative',
                  }}
                >
                  <View
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: '#fff',
                      paddingHorizontal: 8,
                      borderRadius: 12,
                      height: 18,
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: '600',
                        fontSize: 12,
                        color: '#1ABC9C',
                      }}
                    >
                      Event
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 16,
                        color: '#fff',
                        width: 80,
                      }}
                    >
                      {time}
                    </Text>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 16,
                        color: '#fff',
                        flex: 1,
                      }}
                      numberOfLines={1}
                    >
                      {event.title}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 14,
                        color: '#f5f5f5',
                        width: 80,
                      }}
                    >
                      {ampm}
                    </Text>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 14,
                        color: '#f5f5f5',
                        flex: 1,
                      }}
                      numberOfLines={1}
                    >
                      {event.location}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffeee6' },
  header: {
    backgroundColor: '#FF7F2A',
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  menuButton: { position: 'absolute', top: 20, left: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 10 },
  roleBadge: {
    backgroundColor: '#FF9F70',
    color: '#000',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginRight: 55,
    borderRadius: 8,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  name: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  birthdayWrapper: {
    marginTop: -20,
    marginVertical: 12,
    paddingHorizontal: 16,
  },

  birthdayCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginRight: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  shareButton: {
    position: 'absolute',
    top: 30,
    right: 20,
    backgroundColor: '#FFEDEE',
    padding: 8,
    borderRadius: 30,
    elevation: 3,
  },

  birthdayContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  birthdayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 10,
    marginHorizontal: 5,
  },

  birthdayRole: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#ffeee6',
  },

  birthdayTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  birthdayText: { fontSize: 14, color: '#555', fontWeight: 'bold' },
  statusCard: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: -10,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF7F2A',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },

  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  statusTitle: { fontSize: 14, fontWeight: 'bold', color: '#000' },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },

  statusLabel: {
    flex: 1,
    marginLeft: 13,
    fontSize: 13,
    fontWeight: '600',
  },
  statusCount: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 20,
    color: '#000',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 20,
    color: '#FF7F2A',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  viewAllButton: {
    backgroundColor: '#fffaf3',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#888',
  },

  viewAllButtonText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 13,
  },

  listRow: {
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 20,
  },
  timeText: { width: 80, fontWeight: 'bold', color: '#000' },
  itemText: { flex: 1, color: '#555', fontSize: 14, marginLeft: 20 },
});

export default DashboardScreen;
