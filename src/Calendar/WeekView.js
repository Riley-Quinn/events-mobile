/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable radix */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const SCREEN_WIDTH = Dimensions.get('window').width;

const HOURS = Array.from(
  { length: 24 },
  (_, i) => `${i % 12 === 0 ? 12 : i % 12} ${i < 12 ? 'AM' : 'PM'}`,
);

const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const COLORS = {
  birthdays: '#FF6B81',
  events: '#1ABC9C',
  importantDays: '#F8C471',
};

const WeekView = () => {
  const [baseDate] = useState(moment().startOf('week'));
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');
  const navigation = useNavigation();

  const daysOfWeek = Array.from({ length: 7 }, (_, i) =>
    moment(baseDate).add(i, 'days'),
  );

  useEffect(() => {
    fetchWeekData();
  }, [baseDate]);

  const fetchWeekData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');

      const [birthdaysRes, eventsRes, specialDaysRes] = await Promise.all([
        axios.get('http://10.0.2.2:4000/api/birthdays/all', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://10.0.2.2:4000/api/events/all', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://10.0.2.2:4000/api/specialdays/all', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const mapData = (items, key, category) =>
        items
          .filter(item =>
            moment(item[key]).isBetween(
              baseDate.clone().startOf('day'),
              baseDate.clone().add(6, 'days').endOf('day'),
              undefined,
              '[]',
            ),
          )
          .map(item => ({
            id: `${category}-${item.id}`,
            title:
              category === 'birthdays'
                ? `${item.name}'s Birthday`
                : item.name || item.title,
            time: parseInt(item.time || '0'),
            date: moment(item[key]).format('YYYY-MM-DD'),
            category,
          }));

      const birthdays = mapData(birthdaysRes.data, 'birth_date', 'birthdays');
      const events = mapData(eventsRes.data, 'date', 'events');
      const importantDays = mapData(
        specialDaysRes.data,
        'importantDay_date',
        'importantDays',
      );

      setAllItems([...birthdays, ...events, ...importantDays]);
    } catch (err) {
      console.error('Error fetching week data', err);
    } finally {
      setLoading(false);
    }
  };

  const renderEvents = () => {
    const grouped = {};

    allItems.forEach(item => {
      const dayIndex = daysOfWeek.findIndex(
        d => d.format('YYYY-MM-DD') === item.date,
      );
      if (dayIndex === -1) return;

      const key = `${dayIndex}-${item.time}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    const renderedItems = [];

    Object.entries(grouped).forEach(([key, itemsAtSlot]) => {
      const [dayIndexStr, timeStr] = key.split('-');
      const dayIndex = parseInt(dayIndexStr);
      const time = parseInt(timeStr);

      const top = time * 60;
      const left = (SCREEN_WIDTH / 7) * dayIndex + 60;

      const firstItem = itemsAtSlot[0];
      const extraCount = itemsAtSlot.length - 1;

      // Render first event
      renderedItems.push(
        <TouchableOpacity
          key={firstItem.id}
          onPress={() => {
            setSelectedTitle(firstItem.title);
            setModalVisible(true);
          }}
          style={{
            position: 'absolute',
            top,
            left,
            zIndex: 10,
            backgroundColor: COLORS[firstItem.category] || '#888',
            borderRadius: 4,
            paddingHorizontal: 6,
            paddingVertical: 4,
            maxWidth: SCREEN_WIDTH / 7 - 20,
            overflow: 'hidden',
          }}
        >
          <Text
            style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: 12,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {firstItem.title}
          </Text>
        </TouchableOpacity>,
      );

      // Render "+N more" if needed
      if (extraCount > 0) {
        renderedItems.push(
          <TouchableOpacity
            key={`more-${key}`}
            onPress={() => {
              const titles = itemsAtSlot.map(i => i.title).join('\n');
              setSelectedTitle(titles);
              setModalVisible(true);
            }}
            style={{
              position: 'absolute',
              top: top + 22, // space below first event
              left,
              zIndex: 10,
              backgroundColor: '#555',
              borderRadius: 4,
              paddingHorizontal: 6,
              paddingVertical: 4,
              maxWidth: SCREEN_WIDTH / 7 - 20,
              overflow: 'hidden',
            }}
          >
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
              +{extraCount} more
            </Text>
          </TouchableOpacity>,
        );
      }
    });

    return renderedItems;
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: 40, backgroundColor: '#ffeee6' }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={{ position: 'absolute', left: 10, top: 30, zIndex: 999 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: 40 }} />
        <View style={[styles.weekHeader, { width: SCREEN_WIDTH }]}>
          {WEEK_DAYS.map((day, index) => {
            const isToday =
              daysOfWeek[index].format('YYYY-MM-DD') ===
              moment().format('YYYY-MM-DD');
            return (
              <View key={index} style={styles.dayContainer}>
                <Text style={[styles.dayText, isToday && { color: '#ff883a' }]}>
                  {day}
                </Text>
                <Text
                  style={[
                    styles.dateText,
                    isToday && {
                      color: '#ff883a',
                      borderBottomWidth: 2,
                      borderBottomColor: '#ff883a',
                    },
                  ]}
                >
                  {daysOfWeek[index].format('D')}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1ABC9C"
          style={{ marginTop: 50 }}
        />
      ) : (
        <View style={styles.grid}>
          {HOURS.map((hour, i) => (
            <View key={i} style={styles.timeRow}>
              <Text style={styles.timeLabel}>{hour}</Text>
              <View style={styles.gridLine} />
            </View>
          ))}

          <View style={StyleSheet.absoluteFill}>
            <View style={{ flexDirection: 'row', height: '100%' }}>
              {WEEK_DAYS.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: SCREEN_WIDTH / 7,
                    borderRightWidth: index !== WEEK_DAYS.length - 1 ? 1 : 0,
                    borderRightColor: '#bbb',
                  }}
                />
              ))}
            </View>
          </View>

          {renderEvents()}
        </View>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              padding: 10,
              borderRadius: 10,
              width: '60%',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: 'black',
                fontWeight: 'bold',
                marginBottom: 10,
              }}
            >
              Event
            </Text>
            <Text
              style={{
                fontSize: 14,
                textAlign: 'center',
                color: 'black',
                fontWeight: 'bold',
                marginBottom: 10,
              }}
            >
              {selectedTitle}
            </Text>
            <Pressable
              style={{
                backgroundColor: '#1ABC9C',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 6,
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  dayContainer: {
    width: SCREEN_WIDTH / 7,
  },
  dayText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
  },
  dateText: {
    fontSize: 16,
    color: 'black',
    marginTop: 20,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'column',
    position: 'relative',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
  },
  timeLabel: {
    width: 60,
    textAlign: 'center',
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
  },
  gridLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#bbb',
  },
});

export default WeekView;
