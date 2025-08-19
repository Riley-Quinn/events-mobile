/* eslint-disable no-shadow */
/* eslint-disable radix */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Pressable,
  Animated,
} from 'react-native';
import axios from 'axios';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BASE_URL } from '@env';
import { ability, updateAbility } from '../casl/ability';
import { PERMISSIONS } from '../Dashboard/contextPage';

const timeSlots = Array.from(
  { length: 24 },
  (_, i) => `${i % 12 || 12} ${i < 12 ? 'AM' : 'PM'}`,
);

const COLORS = {
  birthdays: '#FF6B81',
  events: '#1ABC9C',
  importantDays: '#F8C471',
  tasks: '#4A90E2',
};

const DayView = () => {
  const [selectedTab, setSelectedTab] = useState(null);
  const [tabTouched, setTabTouched] = useState(false);
  const [selectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Today');

  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [birthdayForm, setBirthdayForm] = useState({
    name: '',
    date: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showImportantDayModal, setShowImportantDayModal] = useState(false);
  const [importantDayForm, setImportantDayForm] = useState({
    name: '',
    importantDay_date: new Date(),
  });
  const [showImpDatePicker, setShowImpDatePicker] = useState(false);
  const [tempImportantDate, setTempImportantDate] = useState(new Date());
  const [data, setData] = useState({
    birthdays: [],
    events: [],
    tasks: [],
    importantDays: [],
  });
  const [loading, setLoading] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editBirthday, setEditBirthday] = useState({
    id: '',
    name: '',
    birth_date: '',
  });

  const [editImportantModalVisible, setEditImportantModalVisible] =
    useState(false);
  const [editImportantDay, setEditImportantDay] = useState({
    id: '',
    name: '',
    importantDay_date: '',
  });

  const navigation = useNavigation();

  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [blinkAnim]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');

      const [birthdaysRes, eventsRes, specialDaysRes, tasksRes] =
        await Promise.all([
          axios.get(`${BASE_URL}/api/birthdays/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/events/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/specialdays/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      setData({
        birthdays: birthdaysRes.data,
        events: eventsRes.data,
        importantDays: specialDaysRes.data,
        tasks: tasksRes.data.list,
      });
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBirthday = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const birthDateOnly = moment(editBirthday.birth_date).format(
        'YYYY-MM-DD',
      );

      await axios.put(
        `${BASE_URL}/api/birthdays/${editBirthday.id}`,
        {
          name: editBirthday.name,
          birth_date: birthDateOnly,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEditModalVisible(false);
      fetchAllData();
    } catch (err) {
      console.error('Error updating birthday', err);
    }
  };

  const handleDeleteBirthday = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this birthday?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(
                `${BASE_URL}/api/birthdays/${editBirthday.id}`,
                { headers: { Authorization: `Bearer ${token}` } },
              );
              setEditModalVisible(false);
              fetchAllData();
            } catch (err) {
              console.error('Error deleting birthday', err);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleUpdateImportantDay = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const importantDayDateOnly = moment(
        editImportantDay.importantDay_date,
      ).format('YYYY-MM-DD');

      await axios.put(
        `${BASE_URL}/api/specialdays/${editImportantDay.id}`,
        {
          name: editImportantDay.name,
          importantDay_date: importantDayDateOnly,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEditImportantModalVisible(false);
      fetchAllData();
    } catch (err) {
      console.error('Error updating important day', err);
    }
  };

  const handleDeleteImportantDay = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this important day?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(
                `${BASE_URL}/api/specialdays/${editImportantDay.id}`,
                { headers: { Authorization: `Bearer ${token}` } },
              );
              setEditImportantModalVisible(false);
              fetchAllData();
            } catch (err) {
              console.error('Error deleting important day', err);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const getFilteredItems = () => {
    const filterByDate = (items, key) =>
      items
        .filter(item => {
          if (key === 'birth_date') {
            return (
              moment(item[key]).format('MM-DD') ===
              moment(selectedDate).format('MM-DD')
            );
          } else {
            return moment(item[key]).format('YYYY-MM-DD') === selectedDate;
          }
        })
        .map(item => ({
          ...item,
          category:
            key === 'birth_date'
              ? 'birthdays'
              : key === 'date'
              ? 'events'
              : key === 'start_date'
              ? 'tasks'
              : 'importantDays',
        }));

    const birthdays = filterByDate(data.birthdays, 'birth_date');
    const events = filterByDate(data.events, 'date');
    const tasks = data.tasks
      .filter(task => moment(task.date).format('YYYY-MM-DD') === selectedDate)
      .map(task => ({
        ...task,
        category: 'tasks',
      }));
    const importantDays = filterByDate(data.importantDays, 'importantDay_date');

    const allItems = [...birthdays, ...events, ...importantDays, ...tasks];

    if (selectedTab) {
      return {
        allItems: allItems.filter(item => item.category === selectedTab),
        birthdays,
        events,
        tasks,
        importantDays,
      };
    }
    return { allItems, birthdays, events, tasks, importantDays };
  };

  const renderTabs = () => {
    const { birthdays, events, tasks, importantDays } = getFilteredItems();

    const tabs = tabTouched
      ? [
          'all',
          'birthdays',
          ...(PERMISSIONS.viewEvent ? ['events'] : []),
          'importantDays',
        ]
      : [
          'all',
          'birthdays',
          ...(PERMISSIONS.viewEvent ? ['events'] : []),
          'importantDays',
        ];

    return (
      <View style={styles.tabContainer}>
        {tabs.map(tab => {
          const isActive =
            (selectedTab === null && tab === 'all') || selectedTab === tab;

          let count = 0;
          let color = '#000';
          if (tab === 'birthdays') {
            count = birthdays.length;
            color = COLORS.birthdays;
          } else if (tab === 'events') {
            count = events.length;
            color = COLORS.events;
          } else if (tab === 'tasks') {
            count = tasks.length;
            color = COLORS.tasks;
          } else if (tab === 'importantDays') {
            count = importantDays.length;
            color = COLORS.importantDays;
          }

          return (
            <TouchableOpacity
              key={tab}
              onPress={() => {
                setTabTouched(true);
                setSelectedTab(tab === 'all' ? null : tab);
              }}
              style={[styles.tab, isActive && styles.activeTab]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={[styles.tabText, isActive && styles.activeTabText]}
                >
                  {tab.toUpperCase()}
                </Text>
                {count > 0 && (
                  <View
                    style={{
                      backgroundColor: color,
                      borderRadius: 10,
                      minWidth: 20,
                      paddingHorizontal: 6,
                      height: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: 5,
                    }}
                  >
                    <Text
                      style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </View>
              {isActive && <View style={styles.underline} />}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderDayTimeline = () => {
    const { allItems } = getFilteredItems();

    return timeSlots.map((slot, index) => {
      const hour = index;
      const slotItems = allItems.filter(i => parseInt(i.time || '9') === hour);
      return (
        <View key={index}>
          <View style={styles.slotRow}>
            <Text style={styles.timeLabel}>{slot}</Text>
            <View style={styles.verticalLine} />
            <View style={styles.slotContent}>
              {slotItems.map(item => (
                <TouchableOpacity
                  key={`${item.category}-${item.id}`}
                  onPress={() => {
                    if (item.category === 'events') {
                      navigation.navigate('ViewEvent', { id: item.id });
                    }
                    if (item.category === 'tasks') {
                      navigation.navigate('ViewTask', { id: item.task_id });
                    }
                  }}
                  onLongPress={() => {
                    if (item.category === 'birthdays') {
                      setEditBirthday({
                        id: item.id,
                        name: item.name,
                        birth_date: item.birth_date,
                      });
                      setEditModalVisible(true);
                    }

                    if (item.category === 'importantDays') {
                      setEditImportantDay({
                        id: item.id,
                        name: item.name,
                        importantDay_date: item.importantDay_date,
                      });
                      setEditImportantModalVisible(true);
                    }
                  }}
                >
                  <View
                    style={[
                      styles.eventBox,
                      {
                        backgroundColor: COLORS[item.category],
                        flexDirection: 'row',
                        alignItems: 'center',
                      },
                    ]}
                  >
                    {item.is_important === 1 && (
                      <Animated.View
                        style={{ opacity: blinkAnim, marginRight: 5 }}
                      >
                        <Icon name="star" size={18} color="red" />
                      </Animated.View>
                    )}
                    <Text style={styles.eventText}>
                      {item.category === 'birthdays'
                        ? `${item.name}'s Birthday`
                        : item.name || item.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.horizontalLine} />
        </View>
      );
    });
  };

  const { birthdays, events, tasks, importantDays } = getFilteredItems();

  return (
    <View style={styles.container}>
      <View style={{ position: 'absolute', left: 10, top: 45, zIndex: 999 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={() => {
            setActiveTab('Month');
            navigation.navigate('MonthView', { selectedDate });
          }}
        >
          <Text
            style={[
              styles.navTabText,
              activeTab === 'Month' && { fontWeight: '700', color: '#000' },
            ]}
          >
            Month
          </Text>
          {activeTab === 'Month' && <View style={styles.line} />}
        </TouchableOpacity>

        <Text style={styles.divider}>|</Text>

        <TouchableOpacity
          onPress={() => {
            setActiveTab('Week');
            navigation.navigate('WeekView', { selectedDate });
          }}
        >
          <Text
            style={[
              styles.navTabText,
              activeTab === 'Week' && { fontWeight: '700', color: '#000' },
            ]}
          >
            Week
          </Text>
          {activeTab === 'Week' && <View style={styles.line} />}
        </TouchableOpacity>

        <Text style={styles.divider}>|</Text>

        <TouchableOpacity
          onPress={() => {
            setActiveTab('Today');
            navigation.navigate('DayView');
          }}
        >
          <Text
            style={[
              styles.navTabText,
              activeTab === 'Today' && { fontWeight: '700', color: '#000' },
            ]}
          >
            Today
          </Text>
          {activeTab === 'Today' && <View style={styles.line} />}
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.dateText}>
          {moment(selectedDate).format('dddd, MMMM D')}
        </Text>

        {renderTabs()}
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1ABC9C"
          style={{ marginTop: 30 }}
        />
      ) : (
        <ScrollView style={styles.timelineContainer}>
          {renderDayTimeline()}
        </ScrollView>
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowOptionsModal(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
      {/*Options Modal */}
      <Modal
        visible={showOptionsModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={styles.bottomSheet}>
            {PERMISSIONS.addBirthday && (
              <TouchableOpacity
                style={styles.optionBtn}
                onPress={() => {
                  setShowOptionsModal(false);
                  setShowBirthdayModal(true);
                }}
              >
                <Text style={styles.optionText}>Add Birthday</Text>
              </TouchableOpacity>
            )}

            {PERMISSIONS.addImportantDay && (
              <TouchableOpacity
                style={styles.optionBtn}
                onPress={() => {
                  setShowOptionsModal(false);
                  setShowImportantDayModal(true);
                }}
              >
                <Text style={styles.optionText}>Add Important Day</Text>
              </TouchableOpacity>
            )}

            {PERMISSIONS.addEvent && (
              <TouchableOpacity
                style={styles.optionBtn}
                onPress={() => {
                  setShowOptionsModal(false);
                  navigation.navigate('AddEvent');
                }}
              >
                <Text style={styles.optionText}>Add Event</Text>
              </TouchableOpacity>
            )}

            {PERMISSIONS.addTask && (
              <TouchableOpacity
                style={styles.optionBtn}
                onPress={() => {
                  setShowOptionsModal(false);
                  navigation.navigate('AddTasks');
                }}
              >
                <Text style={styles.optionText}>Add Task</Text>
              </TouchableOpacity>
            )}

            {PERMISSIONS.addPressRelease && (
              <TouchableOpacity
                style={styles.optionBtn}
                onPress={() => {
                  setShowOptionsModal(false);
                  navigation.navigate('AddPressRelease');
                }}
              >
                <Text style={styles.optionText}>Add PressNote</Text>
              </TouchableOpacity>
            )}

            {/* {[
              'Add Birthday',
              'Add Important Day',
              'Add Event',
              'Add Task',
              'Add PressNote',
            ].map(text => (
              <TouchableOpacity
                key={text}
                style={styles.optionBtn}
                onPress={() => {
                  setShowOptionsModal(false);
                  if (text === 'Add Event') {
                    navigation.navigate('AddEvent');
                  } else if (text === 'Add Birthday') {
                    setShowBirthdayModal(true);
                  } else if (text === 'Add Important Day') {
                    setShowImportantDayModal(true);
                  } else if (text === 'Add Task') {
                    navigation.navigate('AddTasks');
                  } else if (text === 'Add PressNote') {
                    navigation.navigate('AddPressRelease');
                  } else {
                    console.error('error');
                  }
                }}
              >
                <Text style={styles.optionText}>{text}</Text>
              </TouchableOpacity>
            ))} */}
          </View>
        </Pressable>
      </Modal>
      {/*Add Birthday Day Modal */}
      <Modal
        visible={showBirthdayModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowBirthdayModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#00000055',
          }}
        >
          <View
            style={{
              width: '85%',
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 16,
                color: '#000',
              }}
            >
              Add Birthday
            </Text>
            <TextInput
              placeholder="Name"
              placeholderTextColor="#888"
              value={birthdayForm.name}
              onChangeText={text =>
                setBirthdayForm({ ...birthdayForm, name: text })
              }
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 16,
                color: '#000',
              }}
            />
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 14,
                marginBottom: 16,
              }}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 14 }}>
                {birthdayForm.date
                  ? moment(birthdayForm.date).format('D MMMM YYYY')
                  : 'Select Date'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={birthdayForm.date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setBirthdayForm({ ...birthdayForm, date: selectedDate });
                  }
                }}
              />
            )}
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <TouchableOpacity
                onPress={() => setShowBirthdayModal(false)}
                style={{
                  backgroundColor: '#6598d5',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const token = await AsyncStorage.getItem('token');
                    const newBirthday = {
                      name: birthdayForm.name,
                      birth_date: moment(birthdayForm.date).format(
                        'YYYY-MM-DD',
                      ),
                    };

                    await axios.post(
                      `${BASE_URL}/api/birthdays/create`,
                      newBirthday,
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      },
                    );

                    setShowBirthdayModal(false);
                    setBirthdayForm({ name: '', date: new Date() });
                    fetchAllData();
                  } catch (err) {
                    console.error('Failed to add birthday', err);
                    Alert.alert('Error', 'Could not add birthday.');
                  }
                }}
                style={{
                  backgroundColor: '#ff883a',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/*Add Important Day Modal */}

      {showImportantDayModal && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showImportantDayModal}
          onRequestClose={() => setShowImportantDayModal(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
            <View
              style={{
                width: '90%',
                backgroundColor: '#fff',
                padding: 20,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  marginBottom: 15,
                  color: '#333',
                  textAlign: 'center',
                }}
              >
                Add Important Day
              </Text>

              <TextInput
                placeholder="Name"
                value={importantDayForm.name}
                onChangeText={text =>
                  setImportantDayForm({ ...importantDayForm, name: text })
                }
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 16,
                  fontSize: 16,
                  color: '#000',
                }}
              />

              <TouchableOpacity
                onPress={() => setShowImpDatePicker(true)}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 14,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{ color: '#000', fontWeight: 'bold', fontSize: 14 }}
                >
                  {tempImportantDate
                    ? moment(tempImportantDate).format('D MMMM YYYY')
                    : 'Select Date'}
                </Text>
              </TouchableOpacity>

              {showImpDatePicker && (
                <DateTimePicker
                  value={tempImportantDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowImpDatePicker(false);
                    if (selectedDate) {
                      setTempImportantDate(selectedDate);
                    }
                  }}
                />
              )}

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 20,
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowImportantDayModal(false)}
                  style={{
                    backgroundColor: '#6598d5',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={async () => {
                    try {
                      const token = await AsyncStorage.getItem('token');

                      const newImportantDate = {
                        name: importantDayForm.name,
                        importantDay_date:
                          moment(tempImportantDate).format('YYYY-MM-DD'),
                      };

                      await axios.post(
                        `${BASE_URL}/api/specialdays/create`,
                        newImportantDate,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        },
                      );

                      setImportantDayForm({ name: '' });
                      setTempImportantDate(new Date());
                      setShowImportantDayModal(false);
                      fetchAllData();
                    } catch (err) {
                      console.error('Add important day error:', err);
                      Alert.alert('Error', 'Could not add important day');
                    }
                  }}
                  style={{
                    backgroundColor: '#ff883a',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Birthday Edit Modal */}
      {editModalVisible && (
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.modalTitle}>Edit Birthday</Text>
            <Text>Name</Text>
            <TextInput
              value={editBirthday.name}
              onChangeText={text =>
                setEditBirthday({ ...editBirthday, name: text })
              }
              placeholder="Enter name"
              placeholderTextColor="#888"
              style={styles.inputBox}
            />

            <Text>Date</Text>
            <DatePicker
              date={new Date(editBirthday.birth_date)}
              mode="date"
              onDateChange={date => {
                setEditBirthday({
                  ...editBirthday,
                  birth_date: moment(date).format('YYYY-MM-DD'),
                });
              }}
              // androidVariant="iosClone"
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteBirthday}>
                <Text style={styles.delete}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdateBirthday}>
                <Text style={styles.save}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {/* Important Day Edit Modal */}
      {editImportantModalVisible && (
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.modalTitle}>Edit Important Day</Text>
            <Text>Name</Text>
            <TextInput
              value={editImportantDay.name}
              onChangeText={text =>
                setEditImportantDay({ ...editImportantDay, name: text })
              }
              placeholder="Enter name"
              placeholderTextColor="#888"
              style={styles.inputBox}
            />
            <Text>Date</Text>
            <DatePicker
              date={new Date(editImportantDay.importantDay_date)}
              mode="date"
              onDateChange={date => {
                setEditImportantDay({
                  ...editImportantDay,
                  importantDay_date: moment(date).format('YYYY-MM-DD'),
                });
              }}
              // androidVariant="iosClone"
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => setEditImportantModalVisible(false)}
              >
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteImportantDay}>
                <Text style={styles.delete}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdateImportantDay}>
                <Text style={styles.save}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    paddingTop: 10,
    alignItems: 'center',
    backgroundColor: '#ffeee6',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  divider: {
    marginHorizontal: 8,
    color: '#888',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 30,
    lineHeight: 20,
    textAlignVertical: 'center',
  },

  topNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginVertical: 5,
  },

  navTabText: {
    fontSize: 14,
    color: '#888',
    marginTop: 30,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 2,
  },

  dateText: {
    fontSize: 20,
    color: '#222',
    fontWeight: 'bold',
    marginTop: 2,
  },

  timelineContainer: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#ffeee6',
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    minHeight: 60,
  },
  timeLabel: { width: 50, color: '#444', fontSize: 13 },
  slotContent: { flex: 1, paddingVertical: 8, paddingHorizontal: 8 },
  eventBox: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 6,
  },
  eventText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffeee6',
    paddingVertical: 8,
    justifyContent: 'center',
    marginTop: 4,
  },
  tab: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginHorizontal: 2,
  },
  tabText: { color: '#888', fontWeight: 'bold', fontSize: 13 },
  activeTabText: { color: '#000', fontWeight: 'bold' },
  verticalLine: {
    width: 1,
    backgroundColor: '#ddd',
    height: '100%',
    marginHorizontal: 8,
  },
  line: {
    marginTop: 4,
    height: 2,
    width: '100%',
    backgroundColor: 'black',
    borderRadius: 1,
  },
  countContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  countBox: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  countText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  cancel: { color: '#999', fontWeight: 'bold' },
  delete: { color: '#ff4d4d', fontWeight: 'bold' },
  save: { color: '#1abc9c', fontWeight: 'bold' },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#ff883a',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#ffeee6',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  optionBtn: {
    paddingVertical: 20,
    borderBottomColor: '#000',
    borderBottomWidth: 0.5,
    ntWeight: 'bold',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  horizontalLine: {
    height: 1,
    backgroundColor: '#bbb',
    marginVertical: 4,
    marginLeft: 60,
  },
});

export default DayView;
