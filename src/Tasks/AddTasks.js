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
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddTasks = () => {
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);

  const [location, setLocation] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [assigneeId, setAssigneeId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [subCategoryId, setSubCategoryId] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [statusId, setStatusId] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [estimatedDate, setEstimatedDate] = useState('');
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isImportant, setIsImportant] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const [userRes, categoryRes, statusRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/tasks/status/all?type=task`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUsers(userRes.data);
      setCategories(categoryRes.data.list);
      setStatuses(statusRes.data.list);
    } catch (err) {
      console.error('Fetch error:', err);
      Alert.alert('Error', 'Failed to load data');
    }
  };
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!categoryId) return;
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(
          `${BASE_URL}/api/sub-category/category/${categoryId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setSubCategories(res.data?.list || []);
      } catch (err) {
        console.error('Subcategories error:', err);
      }
    };

    fetchSubcategories();
  }, [categoryId]);

  const handleSubmit = async () => {
    const newErrors = {};
    if (!categoryId) newErrors.categoryId = 'Category is required';
    if (!title) newErrors.title = 'Title is required';
    if (!description) newErrors.description = 'Description is required';
    if (!location) newErrors.location = 'Location is required';
    if (!assigneeId) newErrors.assigneeId = 'Assignee is required';
    if (!statusId) newErrors.statusId = 'Status is required';
    if (!estimatedDate) newErrors.estimatedDate = 'Estimated Date is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('token');

      const taskData = {
        title,
        description,
        location,
        category_id: categoryId,
        assignee_id: assigneeId,
        sub_category_id: subCategoryId,
        status_id: statusId || 1,
        estimated_date: estimatedDate || null,
        is_important: isImportant ? 1 : 0,
      };

      const res = await axios.post(`${BASE_URL}/api/tasks`, taskData, {
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
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={styles.input}>
            {categoryId
              ? categories.find(cat => cat.category_id === categoryId)?.name
              : 'Select Category'}
          </Text>
        </TouchableOpacity>
        {errors.categoryId && (
          <Text style={styles.errorText}>{errors.categoryId}</Text>
        )}
        {categoryId && subCategories.length > 0 && (
          <>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowSubCategoryModal(true)}
            >
              <Text style={styles.input}>
                {subCategoryId
                  ? subCategories.find(
                      sub => sub.sub_category_id === subCategoryId,
                    )?.name
                  : 'Select Subcategory'}
              </Text>
            </TouchableOpacity>
            <Modal
              visible={showSubCategoryModal}
              transparent
              animationType="slide"
              onRequestClose={() => setShowSubCategoryModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                  <TouchableOpacity
                    style={{ position: 'absolute', top: 10, right: 10 }}
                    onPress={() => setShowSubCategoryModal(false)}
                  >
                    <Icon name="close" size={24} color="#000" />
                  </TouchableOpacity>
                  <Text style={styles.modalHeading}>Select Subcategory</Text>
                  <FlatList
                    data={subCategories}
                    keyExtractor={item => item.sub_category_id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          setSubCategoryId(item.sub_category_id);
                          setShowSubCategoryModal(false);
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </Modal>
          </>
        )}
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
        <View style={[styles.inputContainer, { height: 80 }]}>
          <TextInput
            style={[styles.input, { height: '100%' }]}
            placeholder="Description"
            placeholderTextColor="#000"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>
        {errors.description && (
          <Text style={styles.errorText}>{errors.description}</Text>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Location"
            placeholderTextColor="#000"
            value={location}
            onChangeText={setLocation}
          />
        </View>
        {errors.location && (
          <Text style={styles.errorText}>{errors.location}</Text>
        )}
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowAssigneeModal(true)}
        >
          <Text style={styles.input}>
            {assigneeId
              ? users.find(u => u.id === assigneeId)?.name
              : 'Select Assignee'}
          </Text>
        </TouchableOpacity>
        {errors.assigneeId && (
          <Text style={styles.errorText}>{errors.assigneeId}</Text>
        )}
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowStatusModal(true)}
        >
          <Text style={styles.input}>
            {statusId
              ? statuses.find(s => s.status_id === statusId)?.status_name
              : 'Select Status'}
          </Text>
        </TouchableOpacity>
        {errors.statusId && (
          <Text style={styles.errorText}>{errors.statusId}</Text>
        )}
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.input}>
            {estimatedDate ? estimatedDate : 'Select Estimated Date'}
          </Text>
        </TouchableOpacity>

        {errors.estimatedDate && (
          <Text style={styles.errorText}>{errors.estimatedDate}</Text>
        )}
        {showDatePicker && (
          <DateTimePicker
            value={estimatedDate ? new Date(estimatedDate) : new Date()}
            mode="date"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                const formattedDate = selectedDate.toISOString().split('T')[0];
                setEstimatedDate(formattedDate);
              }
            }}
          />
        )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 15,
            marginTop: 10,
          }}
        >
          <Text style={{ fontSize: 16, color: '#000' }}>Important</Text>
          <TouchableOpacity
            onPress={() => setIsImportant(prev => !prev)}
            style={{ marginLeft: 12 }}
          >
            <Icon
              name={isImportant ? 'toggle' : 'toggle-outline'}
              size={32}
              color={isImportant ? '#ff6600' : '#aaa'}
            />
          </TouchableOpacity>
        </View>

        <Modal
          visible={showStatusModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowStatusModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <TouchableOpacity
                style={{ position: 'absolute', top: 10, right: 10 }}
                onPress={() => setShowStatusModal(false)}
              >
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalHeading}>Select Status</Text>
              <FlatList
                data={statuses}
                keyExtractor={item => item.status_id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setStatusId(item.status_id);
                      setShowStatusModal(false);
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{item.status_name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
        <Modal
          visible={showAssigneeModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAssigneeModal(false)}
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
                style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}
              >
                Select Assignee
              </Text>

              <FlatList
                data={users}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderColor: '#eee',
                    }}
                    onPress={() => {
                      setAssigneeId(item.id);
                      setShowAssigneeModal(false);
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
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

      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
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
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 20,
              width: '85%',
              maxHeight: '70%',
            }}
          >
            <TouchableOpacity
              style={{ position: 'absolute', top: 10, right: 10 }}
              onPress={() => setShowCategoryModal(false)}
            >
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>

            <Text
              style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}
            >
              Select Category
            </Text>

            <FlatList
              data={categories}
              keyExtractor={item => item.category_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderColor: '#eee',
                  }}
                  onPress={() => {
                    setCategoryId(item.category_id);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  addButtonFilled: {
    backgroundColor: '#ff883a',
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 40,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    width: '85%',
    maxHeight: '70%',
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  input: {
    fontSize: 16,
    color: '#000',
    marginLeft: 20,
  },
});

export default AddTasks;
