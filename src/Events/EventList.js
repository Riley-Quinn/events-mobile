/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '@env';
import moment from 'moment';
import { ability } from '../casl/ability';
import { DraxProvider, DraxList } from 'react-native-drax';
import { PERMISSIONS } from '../Dashboard/contextPage';

const EventList = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchEvents(showAll);
    }, [showAll]),
  );

  const fetchEvents = async showAllFlag => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/events/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allEvents = res.data || [];
      if (showAllFlag) {
        setEvents(allEvents);
      } else {
        const today = moment().format('YYYY-MM-DD');
        const filteredEvents = allEvents.filter(
          event => moment(event.date).format('YYYY-MM-DD') === today,
        );
        setEvents(filteredEvents);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch events');
    }
  };

  const handleDelete = async eventId => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEvents();
      Alert.alert('Deleted', 'Event deleted successfully');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to delete event');
    }
  };

  // Drag and drop reorder function
  const onItemReorder = async ({ fromIndex, toIndex }) => {
    const updatedEvents = [...events];
    const movedItem = updatedEvents.splice(fromIndex, 1)[0];
    updatedEvents.splice(toIndex, 0, movedItem);
    setEvents(updatedEvents);

    try {
      const reorderedPayload = updatedEvents.map((item, index) => ({
        id: item.id,
        priority: index + 1,
      }));

      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${BASE_URL}/api/events/update-priority`,
        { events: reorderedPayload },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Alert.alert('Success', 'Event order updated successfully');
    } catch (err) {
      console.error('Failed to update event order', err);
      Alert.alert('Error', 'Failed to update event order');
      fetchEvents(showAll);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBackground}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>My Events</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={{ marginRight: 12 }}
              onPress={() => setShowAll(prev => !prev)}
            >
              <Icon
                name={showAll ? 'toggle' : 'toggle-outline'}
                size={30}
                color={showAll ? 'red' : '#888'}
              />
            </TouchableOpacity>
            {PERMISSIONS.addEvent() && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddEvent')}
              >
                <Icon name="add-circle" size={30} color="#ff883a" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <DraxProvider>
        {events.length === 0 ? (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>No events Today</Text>
          </View>
        ) : (
          <DraxList
            data={events}
            renderItemContent={({ item }) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('ViewEvent', { id: item.id })
                }
              >
                <View style={styles.cardHeader}>
                  <Text
                    style={[styles.taskTitle, { maxWidth: '75%' }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.title}
                  </Text>
                  <View style={styles.actionIcons}>
                    {PERMISSIONS.addEvent() && (
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('EditEvent', { eventId: item.id })
                        }
                      >
                        <Icon name="create-outline" size={22} color="#1976d2" />
                      </TouchableOpacity>
                    )}
                    {PERMISSIONS.addEvent() && (
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert('Delete Event', 'Are you sure?', [
                            { text: 'Cancel' },
                            {
                              text: 'Delete',
                              onPress: () => handleDelete(item.id),
                              style: 'destructive',
                            },
                          ])
                        }
                        style={{ marginLeft: 12 }}
                      >
                        <Icon name="trash-outline" size={22} color="#ff3b30" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <View style={styles.row}>
                  <MaterialIcons name="event" size={18} color="#ff883a" />
                  <Text
                    style={[styles.label, { marginLeft: 8, marginBottom: 8 }]}
                  >
                    {moment(item.date, 'YYYY-MM-DD').format('MMMM D, YYYY')}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Icon name="time-outline" size={18} color="#ff883a" />
                  <Text
                    style={[styles.label, { marginLeft: 8, marginBottom: 8 }]}
                  >
                    {item.time === '00:00:00'
                      ? 'All Day'
                      : moment(item.time, 'HH:mm:ss').format('h:mm A')}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Icon name="location-outline" size={18} color="#ff883a" />
                  <Text
                    style={[styles.label, { marginLeft: 8, marginBottom: 8 }]}
                  >
                    {item.location}
                  </Text>
                </View>
                <View style={styles.row}>
                  <MaterialIcons name="description" size={18} color="#ff883a" />
                  <Text
                    style={[styles.label, { marginLeft: 8, marginBottom: 8 }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            onItemReorder={onItemReorder}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={true}
            draggingStyle={{ opacity: 0.2 }}
            dragReleasedStyle={{ opacity: 1 }}
          />
        )}
      </DraxProvider>
    </View>
  );
};

export default EventList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffeee6',
    paddingTop: 130,
  },

  headerBackground: {
    backgroundColor: '#ff883a',
    height: 120,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
  },

  addButton: {
    backgroundColor: '#ffeee6',
    padding: 10,
    borderRadius: 50,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },

  taskList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 10,
    marginHorizontal: 20,
    elevation: 3,
    marginTop: 20,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 13,
  },
  actionIcons: {
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  label: {
    fontSize: 14,
    color: '#555',
  },
  noEventsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 300,
  },
  noEventsText: {
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
