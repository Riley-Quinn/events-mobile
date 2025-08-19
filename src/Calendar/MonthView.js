/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import moment from 'moment';
import { BASE_URL } from '@env';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import { Alert } from 'react-native';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';

const COLORS = {
  birthdays: '#FF6B81',
  events: '#1ABC9C',
  importantDays: '#F8C471',
  tasks: '#4A90E2',
};

const MonthView = () => {
  const [currentDate, setCurrentDate] = useState(moment().format('YYYY-MM-DD'));
  const [visibleMonth, setVisibleMonth] = useState(moment().format('YYYY-MM'));
  const [allData, setAllData] = useState({
    birthdays: [],
    events: [],
    importantDays: [],
    tasks: [],
  });
  const formattedDisplayDate = moment(currentDate).format('D,MMMM YYYY');

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Birthday Edit
  const [editBirthday, setEditBirthday] = useState(null);
  // Important Day Edit
  const [editImportantDay, setEditImportantDay] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    filterEventsForDate(currentDate);
  }, [allData, currentDate]);

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

      setAllData({
        birthdays: birthdaysRes.data,
        events: eventsRes.data,
        importantDays: specialDaysRes.data,
        tasks: tasksRes.data.list,
      });
    } catch (err) {
      console.error('Error fetching month data', err);
    } finally {
      setLoading(false);
    }
  };

  const filterEventsForDate = date => {
    const formatDate = d => moment(d).format('YYYY-MM-DD');
    const birthdays = allData.birthdays
      .filter(
        item =>
          moment(item.birth_date).format('MM-DD') ===
          moment(date).format('MM-DD'),
      )
      .map(item => ({
        id: `b-${item.id}`,
        bid: item.id,
        title: `${item.name}'s Birthday`,
        name: item.name,
        birth_date: formatDate(item.birth_date),
        category: 'birthdays',
      }));

    const events = allData.events
      .filter(item => formatDate(item.date) === date)
      .map(item => ({
        id: `e-${item.id}`,
        eid: item.id,
        title: item.title,
        category: 'events',
      }));
    const tasks = allData.tasks
      .filter(item => formatDate(item.start_date) === date)
      .map(item => ({
        id: `e-${item.task_id}`,
        eid: item.task_id,
        title: item.title,
        category: 'tasks',
      }));
    const importantDays = allData.importantDays
      .filter(item => formatDate(item.importantDay_date) === date)
      .map(item => ({
        id: `i-${item.id}`,
        iid: item.id,
        title: item.name,
        name: item.name,
        importantDay_date: formatDate(item.importantDay_date),
        category: 'importantDays',
      }));

    setFilteredEvents([...birthdays, ...events, ...tasks, ...importantDays]);
  };

  const markedDates = useMemo(() => {
    const marks = {};

    const markDay = (date, category) => {
      if (!marks[date]) {
        marks[date] = { marked: true, dots: [] };
      }
      marks[date].dots.push({
        color: '#000',
        selectedDotColor: 'blue',
      });
    };

    const daysInMonth = moment(visibleMonth, 'YYYY-MM').daysInMonth();

    // Birthdays (recurring)
    allData.birthdays.forEach(item => {
      const birthdayMMDD = moment(item.birth_date).format('MM-DD');
      for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = `${visibleMonth}-${String(d).padStart(2, '0')}`;
        if (moment(dayStr).format('MM-DD') === birthdayMMDD) {
          markDay(dayStr, 'birthdays');
        }
      }
    });

    // Events
    allData.events.forEach(item => {
      const date = moment(item.date).format('YYYY-MM-DD');
      if (date.startsWith(visibleMonth)) markDay(date, 'events');
    });
    //tasks
    allData.tasks.forEach(item => {
      const date = moment(item.start_date).format('YYYY-MM-DD');
      if (date.startsWith(visibleMonth)) markDay(date, 'events');
    });
    // Important Days
    allData.importantDays.forEach(item => {
      const date = moment(item.importantDay_date).format('YYYY-MM-DD');
      if (date.startsWith(visibleMonth)) markDay(date, 'importantDays');
    });

    // Selected date
    if (currentDate) {
      marks[currentDate] = {
        ...(marks[currentDate] || {}),
        selected: true,
        selectedColor: '#ff883a',
        selectedTextColor: '#fff',
      };
    }

    return marks;
  }, [allData, visibleMonth, currentDate]);

  // Handle Birthday Update/Delete
  const updateBirthday = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/api/birthdays/${editBirthday.id}`,
        {
          name: editBirthday.name,
          birth_date: editBirthday.birth_date,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setEditBirthday(null);
      fetchAllData();
    } catch (err) {
      console.error('Error updating birthday', err);
    }
  };

  const deleteBirthday = async () => {
    Alert.alert('Confirm Delete', 'Delete this birthday?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(`${BASE_URL}/api/birthdays/${editBirthday.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setEditBirthday(null);
            fetchAllData();
          } catch (err) {
            console.error('Error deleting birthday', err);
          }
        },
      },
    ]);
  };

  // Handle Important Day Update/Delete
  const updateImportantDay = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/api/specialdays/${editImportantDay.id}`,
        {
          name: editImportantDay.name,
          importantDay_date: editImportantDay.importantDay_date,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setEditImportantDay(null);
      fetchAllData();
    } catch (err) {
      console.error('Error updating important day', err);
    }
  };

  const deleteImportantDay = async () => {
    Alert.alert('Confirm Delete', 'Delete this important day?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(
              `${BASE_URL}/api/specialdays/${editImportantDay.id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            setEditImportantDay(null);
            fetchAllData();
          } catch (err) {
            console.error('Error deleting important day', err);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.details}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back-sharp" color="#000" size={30} />
          </TouchableOpacity>
          <Text style={styles.heading1}>Events Calendar</Text>
        </View>
      </View>
      <View style={styles.calbg}>
        <Calendar
          current={currentDate}
          onDayPress={day => setCurrentDate(day.dateString)}
          onMonthChange={month =>
            setVisibleMonth(
              `${month.year}-${String(month.month).padStart(2, '0')}`,
            )
          }
          markedDates={markedDates}
          markingType={'multi-dot'}
          theme={{
            calendarBackground: '#ffeee6',
            selectedDayBackgroundColor: '#ff883a',
            selectedDayTextColor: '#fff',
            todayTextColor: '#ff883a',
            dayTextColor: '#000',
            monthTextColor: '#000',
            arrowColor: '#ff883a',
            textMonthFontWeight: 'bold',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textSectionTitleColor: '#000',
            textSectionTitleFontWeight: 'bold',
            textSectionTitleDisabledColor: '#000',
          }}
        />
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1ABC9C"
          style={{ marginTop: 20 }}
        />
      ) : (
        <View style={styles.eventList}>
          <Text style={styles.heading}>
            All schedules {formattedDisplayDate}
          </Text>
          <FlatList
            data={filteredEvents}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={<Text style={styles.noEvent}>No events</Text>}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  if (item.category === 'events') {
                    navigation.navigate('ViewEvent', { id: item.eid });
                  }
                  if (item.category === 'tasks') {
                    navigation.navigate('ViewTask', { id: item.eid });
                  }
                }}
                onLongPress={() => {
                  if (item.category === 'birthdays') {
                    setEditBirthday({
                      id: item.bid,
                      name: item.name,
                      birth_date: item.birth_date,
                    });
                  } else if (item.category === 'importantDays') {
                    setEditImportantDay({
                      id: item.iid,
                      name: item.name,
                      importantDay_date: item.importantDay_date,
                    });
                  }
                }}
              >
                <View
                  style={[
                    styles.eventCard,
                    { backgroundColor: COLORS[item.category] },
                  ]}
                >
                  <View
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor:
                        item.category === 'birthdays'
                          ? '#fff'
                          : item.category === 'tasks'
                          ? '#fff'
                          : item.category === 'importantDays'
                          ? '#fff'
                          : '#fff',
                      borderRadius: 12,
                      paddingHorizontal: 10,
                      paddingVertical: 2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: 'bold',
                        color:
                          item.category === 'birthdays'
                            ? '#FF6B6B'
                            : item.category === 'tasks'
                            ? '#4A90E2'
                            : item.category === 'importantDays'
                            ? '#F8C471'
                            : '#1ABC9C',
                      }}
                    >
                      {item.category === 'birthdays'
                        ? 'Birthday'
                        : item.category === 'tasks'
                        ? 'Task'
                        : item.category === 'importantDays'
                        ? 'ImportantDay'
                        : 'Event'}
                    </Text>
                  </View>

                  <View style={styles.eventRow}>
                    <Text style={styles.eventText}>
                      {item.category === 'birthdays'
                        ? `${item.name}'s Birthday`
                        : item.category === 'importantDays'
                        ? item.title
                        : item.title}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {editBirthday && (
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.modalTitle}>Edit Birthday</Text>
            <TextInput
              style={styles.input}
              value={editBirthday.name}
              onChangeText={text =>
                setEditBirthday({ ...editBirthday, name: text })
              }
            />
            <DatePicker
              date={new Date(editBirthday.birth_date)}
              mode="date"
              onDateChange={date =>
                setEditBirthday({
                  ...editBirthday,
                  birth_date: moment(date).format('YYYY-MM-DD'),
                })
              }
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => setEditBirthday(null)}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteBirthday}>
                <Text style={styles.delete}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={updateBirthday}>
                <Text style={styles.save}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {editImportantDay && (
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.modalTitle}>Edit Important Day</Text>
            <TextInput
              style={styles.input}
              value={editImportantDay.name}
              onChangeText={text =>
                setEditImportantDay({ ...editImportantDay, name: text })
              }
            />
            <DatePicker
              date={new Date(editImportantDay.importantDay_date)}
              mode="date"
              onDateChange={date =>
                setEditImportantDay({
                  ...editImportantDay,
                  importantDay_date: moment(date).format('YYYY-MM-DD'),
                })
              }
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => setEditImportantDay(null)}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteImportantDay}>
                <Text style={styles.delete}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={updateImportantDay}>
                <Text style={styles.save}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default MonthView;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffeee6' },
  eventList: {
    paddingTop: 20,
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: '#ffeee6',
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
  },
  calbg: {
    backgroundColor: '#ffeee6',
    paddingTop: 10,
    paddingBottom: 10,
  },
  noEvent: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 20 },
  eventCard: {
    minHeight: 50,
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  eventText: { fontSize: 14, color: '#000', fontWeight: 'bold' },
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
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancel: { color: '#999', fontWeight: 'bold' },
  delete: { color: '#ff4d4d', fontWeight: 'bold' },
  save: { color: '#1abc9c', fontWeight: 'bold' },
  header: {
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: '#ff883a',
    paddingVertical: 40,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heading1: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 5,
    marginLeft: 20,
    color: '#000',
  },
  backButton: {
    marginTop: 10,
  },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  emoji: {
    fontSize: 14,
    backgroundColor: 'red',
    borderRadius: 15,
    paddingHorizontal: 8,
    // paddingVertical: 2,
    fontcolor: '#000',
    fontWeight: 'bold',
  },

  arrow: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000',
  },
});
