import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';
import moment from 'moment';
import { BASE_URL } from '@env';

const EditEvent = ({ route, navigation }) => {
  const { eventId } = route.params;

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    date: new Date(),
    time: new Date(),
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        const response = await axios.get(`${BASE_URL}/api/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const event = response.data;

        if (event) {
          setFormData({
            title: event.title || '',
            location: event.location || '',
            description: event.description || '',
            date: event.date ? new Date(event.date) : new Date(),
            time: event.time
              ? moment(event.time, 'HH:mm').toDate()
              : new Date(),
          });
        } else {
          Alert.alert('Error', 'Event not found.');
        }
      } catch (error) {
        console.error('Fetch error:', error?.response?.data || error.message);
        Alert.alert('Error', 'Could not fetch event details.');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    } else {
      setLoading(false);
      Alert.alert('Error', 'Missing event ID.');
    }
  }, [eventId]);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('token');

      const updatedData = {
        ...formData,
        date: moment(formData.date).format('YYYY-MM-DD'),
        time: moment(formData.time).format('HH:mm'),
      };

      await axios.put(`${BASE_URL}/api/events/${eventId}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Success', 'Event updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Update error:', error?.response?.data || error.message);
      Alert.alert('Error', 'Could not update event.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff883a" />
        <Text style={{ marginTop: 10 }}>Loading event...</Text>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: '#ffeee6', flex: 1 }}>
      <View style={styles.header}>
        <View style={styles.details}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back-sharp" color="#000" size={30} />
          </TouchableOpacity>
          <Text style={styles.heading}>Edit Event</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Title */}
        <Text style={styles.label}>Title</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor="#000"
            value={formData.title}
            onChangeText={text => setFormData({ ...formData, title: text })}
          />
        </View>

        {/* Location */}
        <Text style={styles.label}>Location</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Location"
            placeholderTextColor="#000"
            value={formData.location}
            onChangeText={text => setFormData({ ...formData, location: text })}
          />
        </View>

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <View style={[styles.inputContainer, { height: 80 }]}>
          <TextInput
            style={[styles.input, { height: '100%' }]}
            placeholder="Description"
            placeholderTextColor="#000"
            multiline
            numberOfLines={5}
            value={formData.description}
            onChangeText={text =>
              setFormData({ ...formData, description: text })
            }
            textAlignVertical="top"
          />
        </View>

        {/* Date */}
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.input}>
            {moment(formData.date).format('YYYY-MM-DD')}
          </Text>
        </TouchableOpacity>

        {/* Time */}
        <Text style={styles.label}>Time</Text>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.input}>
            {moment(formData.time).format('hh:mm A')}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={formData.date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setFormData({ ...formData, date: selectedDate });
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={formData.time}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                setFormData({ ...formData, time: selectedTime });
              }
            }}
          />
        )}

        {/* Buttons */}
        <TouchableOpacity
          style={styles.addButtonFilled}
          onPress={handleUpdate}
          disabled={saving}
        >
          <Text style={styles.addButtonText}>
            {saving ? 'Saving...' : 'Update Event'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButtonFilled}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.addButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default EditEvent;

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: '#ff883a',
    paddingVertical: 60,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
    marginHorizontal: 50,
    marginTop: 12,
    alignSelf: 'flex-start',
  },

  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 5,
    marginLeft: 20,
    color: '#000',
  },
  backButton: {
    marginTop: 10,
  },
  formContainer: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 100,
  },
  inputContainer: {
    borderColor: '#FF8008',
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 15,
    marginBottom: 20,
    width: '90%',
    height: 60,
    marginTop: 16,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#000',
    marginLeft: 20,
  },
  addButtonFilled: {
    backgroundColor: '#ff883a',
    paddingVertical: 20,
    borderRadius: 30,
    marginTop: 60,
    marginBottom: 8,
    width: '90%',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
  },
});
