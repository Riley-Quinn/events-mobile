/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const AddTasks = () => {
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [assigneeId, setAssigneeId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const [userRes, categoryRes] = await Promise.all([
        axios.get('http://10.0.2.2:4000/api/auth/users', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://10.0.2.2:4000/api/categories', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUsers(userRes.data);
      setCategories(categoryRes.data.list);
    } catch (err) {
      console.error('Fetch error:', err);
      Alert.alert('Error', 'Failed to load users or categories');
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !location || !categoryId || !assigneeId) {
      Alert.alert('Validation', 'All fields are required');
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('token');

      const taskData = {
        title,
        description,
        location,
        category_id: categoryId,
        assignee_id: assigneeId,
        status_id: 1,
      };

      const res = await axios.post('http://10.0.2.2:4000/api/tasks', taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Success', res.data.message);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to create task',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: '#ffeee6' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.details}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="chevron-back-sharp" color="#000" size={30} />
            </TouchableOpacity>
            <Text style={styles.heading}>Add Task</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Picker
            selectedValue={categoryId}
            onValueChange={value => setCategoryId(value)}
            style={styles.input}
          >
            <Picker.Item
              label="Select Category"
              value={null}
              style={styles.input}
            />
            {categories.map(cat => (
              <Picker.Item
                key={cat.category_id}
                label={cat.name}
                value={cat.category_id}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor="#000"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Description"
            placeholderTextColor="#000"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Location"
            placeholderTextColor="#000"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.inputContainer}>
          <Picker
            selectedValue={assigneeId}
            onValueChange={value => setAssigneeId(value)}
            style={styles.input}
          >
            <Picker.Item label="Select Assignee" value={null} />
            {users.map(user => (
              <Picker.Item key={user.id} label={user.name} value={user.id} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.addButtonOutlined}>
          <Text style={styles.addOutlinedText}>+ Add Media</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButtonFilled}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.addButtonText}>
            {submitting ? 'Submitting...' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#ffeee6',
  },
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
  addButtonOutlined: {
    paddingVertical: 20,
    borderRadius: 30,
    marginTop: 10,
    width: '90%',
    alignItems: 'center',
    backgroundColor: '#fff',
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
  backButton: {
    marginTop: 10,
  },
});

export default AddTasks;
