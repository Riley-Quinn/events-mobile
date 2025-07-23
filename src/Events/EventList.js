/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '@env';

const EventList = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchEvents();
    }, []),
  );

  const fetchEvents = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/events/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data);
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>My Events</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddEvent')}
        >
          <Icon name="add-circle" size={30} color="#ff883a" />
        </TouchableOpacity>
      </View>

      {/* Event List */}
      <ScrollView contentContainerStyle={styles.taskList}>
        {events.map(event => (
          <View key={event.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.taskTitle}>{event.title}</Text>
              <View style={styles.actionIcons}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditEvent', { event })}
                >
                  <Icon name="create-outline" size={22} color="#1976d2" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert('Delete Event', 'Are you sure?', [
                      { text: 'Cancel' },
                      {
                        text: 'Delete',
                        onPress: () => handleDelete(event.id),
                        style: 'destructive',
                      },
                    ])
                  }
                  style={{ marginLeft: 12 }}
                >
                  <Icon name="trash-outline" size={22} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <MaterialIcons name="event" size={18} color="#ff883a" />
              <Text style={styles.label}> {event.date}</Text>
            </View>

            <View style={styles.row}>
              <Icon name="time-outline" size={18} color="#ff883a" />
              <Text style={styles.label}>
                {event.time === '00:00:00' ? 'All Day' : event.time}
              </Text>
            </View>

            <View style={styles.row}>
              <Icon name="location-outline" size={18} color="#ff883a" />
              <Text style={styles.label}> {event.location}</Text>
            </View>

            <View style={styles.row}>
              <MaterialIcons name="description" size={18} color="#ff883a" />
              <Text style={styles.label}> {event.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default EventList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff883a',
    paddingTop: 50,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
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

  taskList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#ffeee6',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
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
});
