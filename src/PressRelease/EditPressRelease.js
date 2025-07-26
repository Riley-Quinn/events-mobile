/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import Icon from 'react-native-vector-icons/Ionicons';
import { Formik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  notes: Yup.string().required('Notes are required'),
  assignee_id: Yup.string().required('Assignee is required'),
  status_id: Yup.string().required('Status is required'),
});

const EditPressRelease = ({ route, navigation }) => {
  const { pressId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [assigneeModalVisible, setAssigneeModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  const [initialValues, setInitialValues] = useState({
    title: '',
    notes: '',
    assignee_id: '',
    status_id: '',
  });

  const [users, setUsers] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const fetchPress = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/press-release/${pressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const press = res.data;

      setInitialValues({
        title: press.title || '',
        notes: press.notes || '',
        assignee_id: press.assignee_id?.toString() || '',
        status_id: press.status_id?.toString() || '',
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch press release');
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const [userRes, statusRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/tasks/status/all?type=press_release`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUsers(
        userRes.data?.map(u => ({ label: u.name, value: u.id.toString() })) ||
          [],
      );
      setStatuses(
        statusRes.data?.list.map(s => ({
          label: s.status_name,
          value: s.status_id.toString(),
        })) || [],
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to load options');
    }
  };

  useEffect(() => {
    fetchPress();
    fetchOptions();
  }, []);

  const handleUpdate = async values => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${BASE_URL}/api/press-release/${pressId}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Press updated successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Could not update press.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff883a" />
        <Text style={{ marginTop: 10 }}>Loading press release...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#ffeee6' }}>
      <View style={styles.header}>
        <View style={styles.details}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back-sharp" color="#000" size={30} />
          </TouchableOpacity>
          <Text style={styles.heading}>Edit Press</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handleUpdate}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
          }) => (
            <>
              <Text style={styles.label}>Title</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Title"
                  value={values.title}
                  onChangeText={handleChange('title')}
                />
              </View>
              {touched.title && errors.title && (
                <Text style={styles.error}>{errors.title}</Text>
              )}

              <Text style={styles.label}>Notes</Text>
              <View style={[styles.inputContainer, { height: 80 }]}>
                <TextInput
                  style={[styles.input, { height: '100%' }]}
                  placeholder="Notes"
                  multiline
                  numberOfLines={4}
                  value={values.notes}
                  onChangeText={handleChange('notes')}
                  textAlignVertical="top"
                />
              </View>
              {touched.notes && errors.notes && (
                <Text style={styles.error}>{errors.notes}</Text>
              )}

              <Text style={styles.label}>Assignee</Text>
              <TouchableOpacity
                onPress={() => setAssigneeModalVisible(true)}
                style={styles.inputContainer}
              >
                <Text style={styles.inputText}>
                  {users.find(u => u.value === values.assignee_id)?.label ||
                    'Select Assignee'}
                </Text>
              </TouchableOpacity>
              {touched.assignee_id && errors.assignee_id && (
                <Text style={styles.error}>{errors.assignee_id}</Text>
              )}

              <Text style={styles.label}>Status</Text>
              <TouchableOpacity
                onPress={() => setStatusModalVisible(true)}
                style={styles.inputContainer}
              >
                <Text style={styles.inputText}>
                  {statuses.find(s => s.value === values.status_id)?.label ||
                    'Select Status'}
                </Text>
              </TouchableOpacity>
              {touched.status_id && errors.status_id && (
                <Text style={styles.error}>{errors.status_id}</Text>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.addButtonFilled}
                disabled={saving}
              >
                <Text style={styles.addButtonText}>
                  {saving ? 'Saving...' : 'Update Press'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.addButton}
              >
                <Text style={styles.addText}>Cancel</Text>
              </TouchableOpacity>

              {/* Assignee Modal */}
              <Modal
                visible={assigneeModalVisible}
                transparent
                animationType="slide"
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalBox}>
                    <TouchableOpacity
                      onPress={() => setAssigneeModalVisible(false)}
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 10,
                        padding: 10,
                      }}
                    >
                      <Icon name="close" size={24} color="#000" />
                    </TouchableOpacity>

                    <Text style={styles.modalTitle}>Select Assignee</Text>
                    <FlatList
                      data={users}
                      keyExtractor={item => item.value}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => {
                            setFieldValue('assignee_id', item.value);
                            setAssigneeModalVisible(false);
                          }}
                          style={styles.modalItem}
                        >
                          <Text>{item.label}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>
              </Modal>

              {/* Status Modal */}
              <Modal
                visible={statusModalVisible}
                transparent
                animationType="slide"
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalBox}>
                    <TouchableOpacity
                      onPress={() => setStatusModalVisible(false)} // ✅ correct modal
                      style={{ position: 'absolute', top: 10, right: 10 }}
                    >
                      <Icon name="close" size={24} color="#000" />
                    </TouchableOpacity>

                    <Text style={styles.modalTitle}>Select Status</Text>
                    <FlatList
                      data={statuses}
                      keyExtractor={item => item.value}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => {
                            setFieldValue('status_id', item.value);
                            setStatusModalVisible(false);
                          }}
                          style={styles.modalItem}
                        >
                          <Text>{item.label}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>
              </Modal>
            </>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
};

export default EditPressRelease;

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
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#000',
    marginLeft: 20,
  },
  inputText: {
    fontSize: 16,
    color: '#000',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    alignSelf: 'flex-start',
    marginHorizontal: 40,
    marginBottom: 3,
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 5,
  },

  error: {
    color: 'red',
    alignSelf: 'flex-start',
    marginHorizontal: 40,
    marginBottom: 10,
  },
  addButtonFilled: {
    backgroundColor: '#ff883a',
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 10,
    marginTop: 40,
    width: '90%',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
  },
  addButton: {
    borderColor: '#FF7F2A',
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 8,
    width: '90%',
    borderWidth: 2,
    marginTop: 10,
    alignItems: 'center',
  },
  addText: {
    color: '#000',
    fontSize: 22,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffeee6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    width: '80%',
    maxHeight: '60%',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});
