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
import { BASE_URL } from '@env';
import { PERMISSIONS } from '../Dashboard/contextPage';

const AddPressRelease = () => {
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState({});
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);

  const [assigneeId, setAssigneeId] = useState(null);
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusId, setStatusId] = useState(null);
  const [statusOptions, setStatusOptions] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const [userRes, statusRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/tasks/status/all`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { type: 'press_release' },
        }),
      ]);

      setUsers(userRes.data);
      setStatusOptions(statusRes.data?.list || []);
    } catch (err) {
      console.error('Fetch error:', err);
      Alert.alert('Error', 'Failed to load users or categories');
    }
  };

  const handleSubmit = async () => {
    // if (!title || !notes || !assigneeId) {
    //   Alert.alert('Validation', 'All fields are required');
    //   return;
    // }
    const newErrors = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!notes.trim()) newErrors.notes = 'Description is required';
    if (!assigneeId) newErrors.assigneeId = 'Assignee is required';
    if (!statusId) newErrors.statusId = 'Status is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Validation Error', 'Please fill all the required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('token');

      const pressReleaseData = {
        title,
        notes,
        assignee_id: assigneeId,
        status_id: statusId,
      };

      const res = await axios.post(
        `${BASE_URL}/api/press-release/create`,
        pressReleaseData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

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
            <Text style={styles.heading}>Add PressRelease</Text>
          </View>
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
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        <View style={[styles.inputContainer, { height: 130 }]}>
          <TextInput
            style={[styles.input, { height: '100%' }]}
            placeholder="Notes"
            placeholderTextColor="#000"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {errors.notes && <Text style={styles.errorText}>{errors.notes}</Text>}

        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowAssigneeModal(true)}
        >
          <Text style={styles.input}>
            {assigneeId
              ? users.find(user => user.id === assigneeId)?.name
              : 'Select Assignee'}
          </Text>
        </TouchableOpacity>
        {errors.assigneeId && (
          <Text style={styles.errorText}>{errors.assigneeId}</Text>
        )}
        {showAssigneeModal && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: '#fff',
                padding: 20,
                borderRadius: 20,
                width: '85%',
                maxHeight: '70%',
              }}
            >
              <TouchableOpacity
                style={{ position: 'absolute', top: 10, right: 10 }}
                onPress={() => setShowAssigneeModal(false)}
              >
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 16,
                  color: 'black',
                  fontWeight: 'bold',
                  marginBottom: 15,
                }}
              >
                Select Assignee
              </Text>

              {users.map(user => (
                <TouchableOpacity
                  key={user.id}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderColor: '#eee',
                  }}
                  onPress={() => {
                    setAssigneeId(user.id);
                    setShowAssigneeModal(false);
                  }}
                >
                  <Text
                    style={{ fontSize: 16, color: '#888', fontWeight: 'bold' }}
                  >
                    {user.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowStatusModal(true)}
        >
          <Text style={styles.input}>
            {statusId
              ? statusOptions.find(status => status.status_id === statusId)
                  ?.status_name
              : 'Select Status'}
          </Text>
        </TouchableOpacity>
        {errors.statusId && (
          <Text style={styles.errorText}>{errors.statusId}</Text>
        )}
        {showStatusModal && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: '#fff',
                padding: 20,
                borderRadius: 20,
                width: '85%',
                maxHeight: '70%',
              }}
            >
              <TouchableOpacity
                style={{ position: 'absolute', top: 10, right: 10 }}
                onPress={() => setShowStatusModal(false)}
              >
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 16,
                  color: 'black',
                  fontWeight: 'bold',
                  marginBottom: 15,
                }}
              >
                Select Status
              </Text>

              {statusOptions.map(status => (
                <TouchableOpacity
                  key={status.status_id}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderColor: '#eee',
                  }}
                  onPress={() => {
                    setStatusId(status.status_id);
                    setShowStatusModal(false);
                  }}
                >
                  <Text
                    style={{ fontSize: 16, color: '#888', fontWeight: 'bold' }}
                  >
                    {status.status_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

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
  errorText: {
    color: 'red',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 30,
    alignSelf: 'flex-start',
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

export default AddPressRelease;
