/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import moment from 'moment';
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging'; // make sure this is imported

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [todayEvents, setTodayEvents] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [birthdayNames, setBirthdayNames] = useState([]);
  const [taskStatusCounts, setTaskStatusCounts] = useState({});
  const [pressReleaseCounts, setPressReleaseCounts] = useState({});
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('🔔 Foreground FCM:', remoteMessage);

      PushNotification.localNotification({
        channelId: 'default-channel-id', // Make sure this matches your created channel
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

        // ✅ Fetch tasks
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

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image
              source={require('../../assets/Profile.png')}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.roleBadge}>{roleName}</Text>
            <Text style={styles.name}>{userName}</Text>
          </View>
        </View>
      </View>

      {/* BIRTHDAY CARD */}
      <TouchableOpacity onPress={() => navigation.navigate('DayView')}>
        <View style={styles.birthdayWrapper}>
          <View style={styles.birthdayCard}>
            <Image
              source={require('../../assets/confetti.png')} // ✅ your birthday image
              style={{ width: 35, height: 35 }} // ✅ same size as icon
              resizeMode="contain"
            />

            <View style={{ marginLeft: 10 }}>
              <Text style={styles.birthdayTitle}>Happy Birthday</Text>
              <Text style={[styles.birthdayText, { marginTop: 6 }]}>
                {birthdayNames.length > 0
                  ? birthdayNames.join(', ')
                  : 'No Birthdays Today'}
              </Text>
            </View>
          </View>
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
        {/* Task Status Header with ^ icon */}
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
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
              }}
            >
              <Image
                source={require('../../assets/top-right.png')}
                style={{ width: 10, height: 10 }}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Press Release Status Header with ^ icon */}
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
              <Image
                source={require('../../assets/top-right.png')}
                style={{ width: 10, height: 10 }}
                resizeMode="contain"
              />
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
            borderRadius: 15,
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
                borderBottomWidth: i !== 5 ? 1 : 0, // Add divider except last item (index 5)
                borderBottomColor: '#ccc',
              }}
            >
              <View
                style={{
                  backgroundColor: item.bg,
                  padding: 6,
                  borderRadius: 20,
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
            marginRight: 10,
            backgroundColor: '#fff',
            padding: 8,

            borderRadius: 15,
          }}
        >
          {[
            {
              image: require('../../assets/draft.png'),
              label: 'Draft',
              bg: '#FF9AA8',
              text: '#080808',
            },
            {
              image: require('../../assets/open-book.png'),
              label: 'Open for Review',
              bg: '#FBD2A8',
              text: '#080808',
            },
            {
              image: require('../../assets/book.png'),
              label: 'Ready to Publish',
              bg: '#8BE9AA',
              text: '#080808',
            },
            {
              image: require('../../assets/paper-plane.png'),
              label: 'Feedback Pending',
              bg: '#FBD2A8',
              text: '#080808',
            },
            {
              image: require('../../assets/book.png'),
              label: 'Published',
              bg: '#8BE9AA',
              text: '#080808',
            },
            {
              image: require('../../assets/paper-plane.png'),
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
                borderBottomWidth: i !== 5 ? 1 : 0, // Add divider except last item (index 5)
                borderBottomColor: '#ccc',
              }}
            >
              <View
                style={{
                  backgroundColor: item.bg,
                  padding: 6,
                  borderRadius: 20,
                }}
              >
                <Image
                  source={item.image}
                  style={{ width: 20, height: 20 }}
                  resizeMode="contain"
                />
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
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: '#000',
                }}
              >
                {pressReleaseCounts[item.label] || 0}
              </Text>
            </View>
          ))}
        </View>
      </View>
      {/* Today Tasks Section */}
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
          <Text style={styles.sectionTitle}>Today Tasks</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TaskList')}>
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
        <View
          style={{
            backgroundColor: '#FFF5E6',
            borderRadius: 12,
            marginHorizontal: 20,
            paddingVertical: 12,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          {todayTasks.length === 0 ? (
            <Text
              style={{
                fontStyle: 'italic',
                color: '#777',
                textAlign: 'center',
                paddingVertical: 15,
              }}
            >
              No Tasks
            </Text>
          ) : (
            todayTasks.slice(0, 3).map((task, i) => {
              const time = moment(task.created_at).format('hh:mm A');
              const [hourMin, ampm] = time.split(' ');

              return (
                <View
                  key={i}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderBottomWidth: i < todayTasks.length - 1 ? 1 : 0,
                    borderColor: '#DDD',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={{ fontWeight: '600', color: '#000', fontSize: 14 }}
                    >
                      {hourMin}
                    </Text>
                    <Text
                      style={{
                        fontWeight: '600',
                        color: '#000',
                        fontSize: 14,
                        marginLeft: 20,
                      }}
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
                        color: '#888',
                        fontSize: 13,
                      }}
                    >
                      {ampm}
                    </Text>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: '#888',
                        fontSize: 13,
                        marginLeft: 20,
                      }}
                    >
                      {task.location}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      {/* Today Events Section */}
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
          <Text style={styles.sectionTitle}>Today Events</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EventsList')}>
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

        <View
          style={{
            backgroundColor: '#E6F2FF',
            borderRadius: 12,
            marginHorizontal: 20,
            paddingVertical: 12,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          {todayEvents.length === 0 ? (
            <Text
              style={{
                fontStyle: 'italic',
                color: '#777',
                textAlign: 'center',
                paddingVertical: 15,
              }}
            >
              No Events
            </Text>
          ) : (
            todayEvents.slice(0, 3).map((event, i) => {
              const time = moment(event.date).format('hh:mm A');
              const [hourMin, ampm] = time.split(' ');

              return (
                <View
                  key={i}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderBottomWidth: i < todayEvents.length - 1 ? 1 : 0,
                    borderColor: '#DDD',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={{ fontWeight: '600', fontSize: 14, color: '#000' }}
                    >
                      {hourMin}
                    </Text>
                    <Text
                      style={{
                        fontWeight: '600',
                        fontSize: 14,
                        color: '#000',
                        marginLeft: 20,
                      }}
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
                        fontSize: 13,
                        color: '#888',
                      }}
                    >
                      {ampm}
                    </Text>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 13,
                        color: '#888',
                        marginLeft: 20,
                      }}
                    >
                      {event.location || 'No Location'}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
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
  menuButton: { position: 'absolute', top: 20, left: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
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
    marginHorizontal: 10,
    marginTop: -20,
    paddingHorizontal: 20,
  },
  birthdayCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF7F2A',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  birthdayTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  birthdayText: { fontSize: 14, color: '#555', fontWeight: 'bold' },
  statusCard: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 20,
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
