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
  Platform,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import Icon from 'react-native-vector-icons/Ionicons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  location: Yup.string().required('Location is required'),
  assignee_id: Yup.string().required('Assignee is required'),
  status_id: Yup.string().required('Status is required'),
  category_id: Yup.string().required('Category is required'),
  sub_category_id: Yup.string().required('SubCategory is required'),
  estimated_date: Yup.date().required('Estimated Date is required'),
});

const EditTask = ({ route, navigation }) => {
  const { taskId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const [assigneeModalVisible, setAssigneeModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subCategoryModalVisible, setSubCategoryModalVisible] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const [initialValues, setInitialValues] = useState({
    title: '',
    description: '',
    location: '',
    assignee_id: '',
    status_id: '',
    category_id: '',
    sub_category_id: '',
    estimated_date: new Date(),
  });

  const [users, setUsers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const fetchTask = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const task = res.data;

      setInitialValues({
        title: task.title || '',
        description: task.description || '',
        location: task.location || '',
        assignee_id: task.assignee_id?.toString() || '',
        status_id: task.status_id?.toString() || '',
        category_id: task.category_id?.toString() || '',
        sub_category_id: task.sub_category_id?.toString() || '',
        estimated_date: task.estimated_date
          ? new Date(task.estimated_date)
          : new Date(),
      });

      setSelectedCategoryId(task.category_id?.toString() || '');
    } catch (err) {
      Alert.alert(
        'Error',
        err?.response?.data?.error || 'Failed to fetch task',
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const [userRes, statusRes, categoryRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/tasks/status/all?type=task`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/categories/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUsers(
        userRes.data.map(u => ({ label: u.name, value: u.id.toString() })),
      );
      setStatuses(
        statusRes.data.list.map(s => ({
          label: s.status_name,
          value: s.status_id.toString(),
        })),
      );
      setCategories(
        categoryRes.data.list.map(c => ({
          label: c.name,
          value: c.category_id.toString(),
        })),
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch dropdown options');
    }
  };

  const fetchSubCategories = async () => {
    if (!selectedCategoryId) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(
        `${BASE_URL}/api/sub-category/category/${selectedCategoryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSubCategories(
        res.data?.list?.map(sc => ({
          label: sc.name,
          value: sc.sub_category_id.toString(),
        })) || [],
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch subcategories');
    }
  };

  useEffect(() => {
    fetchTask();
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchSubCategories();
  }, [selectedCategoryId]);

  const handleUpdate = async values => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('token');
      const payload = {
        ...values,
        estimated_date: moment(values.estimated_date).format('YYYY-MM-DD'),
      };
      await axios.put(`${BASE_URL}/api/tasks/${taskId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Task updated successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Could not update task.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff883a" />
        <Text>Loading...</Text>
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
          <Text style={styles.title}>Edit Task</Text>
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
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
          }) => (
            <>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Title"
                value={values.title}
                onChangeText={handleChange('title')}
              />
              {touched.title && errors.title && (
                <Text style={styles.error}>{errors.title}</Text>
              )}

              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[
                  styles.input,
                  { height: 100, textAlignVertical: 'top' },
                ]}
                placeholder="Notes"
                multiline
                value={values.description}
                onChangeText={handleChange('description')}
              />

              {/* Modals for Assignee, Status, Category, SubCategory */}
              {[
                {
                  key: 'assignee_id',
                  label: 'Assignee',
                  data: users,
                  visible: assigneeModalVisible,
                  setVisible: setAssigneeModalVisible,
                },
                {
                  key: 'status_id',
                  label: 'Status',
                  data: statuses,
                  visible: statusModalVisible,
                  setVisible: setStatusModalVisible,
                },
                {
                  key: 'category_id',
                  label: 'Category',
                  data: categories,
                  visible: categoryModalVisible,
                  setVisible: setCategoryModalVisible,
                },
                {
                  key: 'sub_category_id',
                  label: 'Sub Category',
                  data: subCategories,
                  visible: subCategoryModalVisible,
                  setVisible: setSubCategoryModalVisible,
                },
              ].map(item => (
                <View key={item.key}>
                  <Text style={styles.label}>{item.label}</Text>
                  <TouchableOpacity
                    onPress={() => item.setVisible(true)}
                    style={styles.input}
                  >
                    <Text
                      style={{
                        color: '#000',
                        fontsize: '14',
                        fontWeight: '600',
                      }}
                    >
                      {item.data.find(d => d.value === values[item.key])
                        ?.label || `Select ${item.label}`}
                    </Text>
                  </TouchableOpacity>
                  {touched[item.key] && errors[item.key] && (
                    <Text style={styles.error}>{errors[item.key]}</Text>
                  )}
                  <Modal
                    visible={item.visible}
                    transparent
                    animationType="slide"
                  >
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalBox}>
                        <TouchableOpacity
                          onPress={() => item.setVisible(false)}
                          style={styles.closeIcon}
                        >
                          <Icon name="close" size={24} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>
                          Select {item.label}
                        </Text>
                        <FlatList
                          data={item.data}
                          keyExtractor={d => d.value}
                          renderItem={({ item: option }) => (
                            <TouchableOpacity
                              onPress={() => {
                                setFieldValue(item.key, option.value);
                                if (item.key === 'category_id') {
                                  setSelectedCategoryId(option.value);
                                  setFieldValue('sub_category_id', '');
                                }
                                item.setVisible(false);
                              }}
                              style={styles.modalItem}
                            >
                              <Text>{option.label}</Text>
                            </TouchableOpacity>
                          )}
                        />
                      </View>
                    </View>
                  </Modal>
                </View>
              ))}

              <Text style={styles.label}>Estimated Date</Text>
              <TouchableOpacity
                onPress={() => setDatePickerVisible(true)}
                style={[styles.input]}
              >
                <Text
                  style={{ color: '#000', fontSize: 12, fontWeight: '600' }}
                >
                  {moment(values.estimated_date).format('YYYY-MM-DD')}
                </Text>
              </TouchableOpacity>
              {datePickerVisible && (
                <DateTimePicker
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  value={new Date(values.estimated_date)}
                  onChange={(event, date) => {
                    setDatePickerVisible(false);
                    if (date) setFieldValue('estimated_date', date);
                  }}
                />
              )}
              {touched.estimated_date && errors.estimated_date && (
                <Text style={styles.error}>{errors.estimated_date}</Text>
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
            </>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
};

export default EditTask;

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
  title: {
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
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    alignSelf: 'flex-start',
    marginHorizontal: 40,
    marginBottom: 3,
  },
  input: {
    borderColor: '#FF8008',
    borderWidth: 1,
    borderRadius: 30,
    marginHorizontal: 18,
    paddingHorizontal: 15,
    marginBottom: 20,
    width: '90%',
    height: 60,
    justifyContent: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffeee6',
  },
  addButtonFilled: {
    backgroundColor: '#ff883a',
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 10,
    marginHorizontal: 20,
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
    marginHorizontal: 20,
    borderWidth: 2,
    marginTop: 10,
    alignItems: 'center',
  },
  addText: {
    color: '#000',
    fontSize: 22,
    fontWeight: 'bold',
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
