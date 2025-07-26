/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
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
import StepIndicator from 'react-native-step-indicator';

const ViewTask = ({ route, navigation }) => {
  const { id } = route.params;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFlow, setStatusFlow] = useState([]);

  useEffect(() => {
    fetchTask();
  }, []);

  const fetchTask = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const [taskRes, flowRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/tasks/${id}/status-flow`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setTask(taskRes.data);
      setStatusFlow(flowRes.data.flow || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to load task or status history');
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
  const stepIndicatorStyles = {
    stepIndicatorSize: 30,
    currentStepIndicatorSize: 30,
    separatorStrokeWidth: 3,
    currentStepStrokeWidth: 3,
    stepStrokeCurrentColor: '#FFA500',
    stepStrokeWidth: 3,
    stepStrokeFinishedColor: '#4CAF50',
    stepStrokeUnFinishedColor: '#ccc',
    separatorFinishedColor: '#4CAF50',
    separatorUnFinishedColor: '#ccc',
    stepIndicatorFinishedColor: '#4CAF50',
    stepIndicatorUnFinishedColor: '#fff',
    stepIndicatorCurrentColor: '#FFA500',
    stepIndicatorLabelFontSize: 13,
    currentStepIndicatorLabelFontSize: 13,
    stepIndicatorLabelCurrentColor: '#000',
    stepIndicatorLabelFinishedColor: '#fff',
    stepIndicatorLabelUnFinishedColor: '#aaa',
    labelColor: '#000',
    labelSize: 13,
    currentStepLabelColor: '#000',
  };

  return (
    <FlatList
      data={[]} // No list data, just using FlatList as a scroll container
      keyExtractor={() => 'key'}
      ListHeaderComponent={
        <View style={{ backgroundColor: '#ffeee6', flex: 1 }}>
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
            <View style={styles.statusTracker}>
              {statusFlow.length > 0 && (
                <View style={{ marginTop: 20 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      marginBottom: 10,
                      color: '#000',
                    }}
                  >
                    Status History
                  </Text>

                  <StepIndicator
                    customStyles={stepIndicatorStyles}
                    currentPosition={statusFlow.length - 1}
                    direction="vertical"
                    stepCount={statusFlow.length}
                    labels={statusFlow.map(s => s.name)}
                    renderLabel={({ position }) => {
                      const step = statusFlow[position];
                      const isFirst = position === 0;

                      const changedText = isFirst
                        ? 'System • 26 Jul 2025, 02:30 PM'
                        : step.changed_by && step.changed_at
                        ? `${step.changed_by} • ${moment(
                            step.changed_at,
                          ).format('DD MMM YYYY, hh:mm A')}`
                        : '';

                      return (
                        <View
                          style={{
                            paddingLeft: 12,
                            minHeight: 70,
                            justifyContent: 'center',
                            width: '100%',
                            display: 'flex',
                          }}
                        >
                          <View
                            style={{
                              paddingLeft: 12,
                              width: '100%',
                              minHeight: 70,
                              flexDirection: 'column',
                              justifyContent: 'center',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 15,
                                fontWeight: 'bold',
                                color: '#000',
                                marginBottom: 2,
                              }}
                            >
                              {step.name}
                            </Text>
                            <Text style={{ fontSize: 13, color: '#666' }}>
                              {changedText}
                            </Text>
                          </View>
                        </View>
                      );
                    }}
                  />
                </View>
              )}
            </View>
            <View style={styles.CommentBox}>
              <CommentBox module={'task'} moduleId={id} />
            </View>
          </View>
        </View>
      }
    />
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
  statusTracker: {
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
