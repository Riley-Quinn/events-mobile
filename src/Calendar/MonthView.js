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

const COLORS = {
  birthdays: '#FF6B81',
  events: '#1ABC9C',
  importantDays: '#F8C471',
};

const MonthView = () => {
  const [currentDate, setCurrentDate] = useState(moment().format('YYYY-MM-DD'));
  const [visibleMonth, setVisibleMonth] = useState(moment().format('YYYY-MM'));
  const [allData, setAllData] = useState({
    birthdays: [],
    events: [],
    importantDays: [],
  });
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

      const [birthdaysRes, eventsRes, specialDaysRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/birthdays/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/events/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/specialdays/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setAllData({
        birthdays: birthdaysRes.data,
        events: eventsRes.data,
        importantDays: specialDaysRes.data,
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
        title: item.name || item.title,
        category: 'events',
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

    setFilteredEvents([...birthdays, ...events, ...importantDays]);
  };

  const markedDates = useMemo(() => {
    const marks = {};

    const markDay = (date, category) => {
      if (!marks[date]) {
        marks[date] = { marked: true, dots: [] };
      }
      marks[date].dots.push({
        color: COLORS[category],
        selectedDotColor: '#fff',
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
      <View style={{ position: 'absolute', left: 10, top: 30, zIndex: 999 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
      </View>

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
        }}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1ABC9C"
          style={{ marginTop: 20 }}
        />
      ) : (
        <View style={styles.eventList}>
          <Text style={styles.heading}>Events on {currentDate}</Text>
          <FlatList
            data={filteredEvents}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={<Text style={styles.noEvent}>No events</Text>}
            renderItem={({ item }) => (
              <TouchableOpacity
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
                  <Text style={styles.eventText}>{item.title}</Text>
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
  container: { flex: 1, backgroundColor: '#ffeee6', padding: 30 },
  eventList: { marginTop: 20, paddingHorizontal: 20, flex: 1 },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  noEvent: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 20 },
  eventCard: { padding: 12, borderRadius: 8, marginBottom: 10 },
  eventText: { fontSize: 14, color: '#fff', fontWeight: 'bold' },
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
});
