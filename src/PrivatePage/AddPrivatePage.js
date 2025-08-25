/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
const AddPrivatePage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const editingDraft = route.params?.draft || null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingDraft) {
      setTitle(editingDraft.Title || '');
      setDescription(editingDraft.Description || '');
    }
  }, [editingDraft]);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const newErrors = {};

    if (!trimmedTitle) newErrors.title = 'Title is required';
    if (!trimmedDescription) newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('token');

      if (editingDraft) {
        // UPDATE existing draft
        await axios.put(
          `${BASE_URL}/api/drafts/${editingDraft.id}`,
          { Title: trimmedTitle, Description: trimmedDescription },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        Alert.alert('Success', 'Draft updated successfully');
      } else {
        // CREATE new draft
        await axios.post(
          `${BASE_URL}/api/drafts`,
          { Title: trimmedTitle, Description: trimmedDescription },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        Alert.alert('Success', 'Draft added successfully');
      }

      navigation.goBack();
    } catch (err) {
      console.error('API Error:', err.response?.data || err.message);
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to save draft',
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
            <Text style={styles.heading}>
              {editingDraft ? 'Edit Draft' : 'Add Draft'}
            </Text>
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

        <TouchableOpacity
          style={styles.addButtonFilled}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.addButtonText}>
            {submitting ? 'Submitting...' : editingDraft ? 'Update' : 'Submit'}
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
  backButton: {
    marginTop: 10,
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
  errorText: {
    color: 'red',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 30,
    alignSelf: 'flex-start',
  },
  addButtonFilled: {
    backgroundColor: '#ff883a',
    paddingVertical: 20,
    borderRadius: 30,
    marginTop: 40,
    width: '90%',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
  },
});

export default AddPrivatePage;
