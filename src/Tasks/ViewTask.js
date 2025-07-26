/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '@env';
import moment from 'moment';
import CommentBox from '../comments/Comments';

const ViewTask = ({ route, navigation }) => {
  const { id } = route.params;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTask();
  }, []);

  const fetchTask = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await axios.get(`${BASE_URL}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTask(res.data); // use .list if that's how the API returns the task
    } catch (err) {
      Alert.alert('Error', 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ff883a" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: '#000' }}>No task found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: '#ffeee6', flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back-sharp" color="#000" size={30} />
        </TouchableOpacity>

        <Text style={styles.heading}>{task.title}</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Description: </Text>
            <Text style={styles.descriptionText}>{task.description}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}> : {task.location}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}> : {task.category_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sub Category</Text>
            <Text style={styles.value}> : {task.sub_category_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Assignee</Text>
            <Text style={styles.value}> : {task.assignee_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}> : {task.status_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Estimated Date</Text>
            <Text style={styles.value}>
              : {moment(task.estimated_date).format('DD MMM YYYY')}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Created At</Text>
            <Text style={styles.value}>
              : {moment(task.created_at).format('DD MMM YYYY')}
            </Text>
          </View>
        </View>
        <View style={styles.CommentBox}>
          <CommentBox module={'task'} moduleId={id} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffeee6',
  },
  container: {
    padding: 20,
  },
  card: {
    borderColor: '#000',
    borderWidth: 0.1,
    borderRadius: 10,
    padding: 20,
    backgroundColor: '#fff',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 18,
  },
  value: {
    color: '#000',
    fontSize: 18,
    flexShrink: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#ff883a',
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  descriptionText: {
    fontSize: 18,
    color: '#000',
    flexShrink: 1,
    flex: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  CommentBox: {
    marginTop: 20,
    borderColor: '#000',
    borderWidth: 0.1,
    borderRadius: 10,
    padding: 20,
    backgroundColor: '#fff',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ViewTask;
