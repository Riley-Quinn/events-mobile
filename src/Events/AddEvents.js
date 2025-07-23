/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddEventScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    date: new Date(),
    time: new Date(),
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    Alert.alert('Saved', 'Event saved successfully!');
    navigation.goBack();
  };

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
          <Text style={styles.heading}>Add Event</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor="#000"
            value={formData.title}
            onChangeText={text => setFormData({ ...formData, title: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Location"
            placeholderTextColor="#000"
            value={formData.location}
            onChangeText={text => setFormData({ ...formData, location: text })}
          />
        </View>

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

        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.input}>Select Date</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.input}>Select Time</Text>
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

        <TouchableOpacity style={styles.addButtonFilled} onPress={handleSave}>
          <Text style={styles.addButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButtonFilled} onPress={handleSave}>
          <Text style={styles.addButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AddEventScreen;

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: '#ff883a',
    paddingVertical: 60,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
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
  addOutlinedText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#ff883a',
  },
});
