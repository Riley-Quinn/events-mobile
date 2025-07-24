/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';

const TaskList = () => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, []),
  );

  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const res = await axios.get(`${BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(res.data.list);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch tasks');
    }
  };

  const handleDelete = async task_id => {
    try {
      const token = await AsyncStorage.getItem('token');

      await axios.delete(`${BASE_URL}/api/tasks/${task_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchTasks();
      Alert.alert('Deleted', 'Task deleted successfully');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'Pending':
        return 'orange';
      case 'Done':
        return 'green';
      case 'Closed':
        return 'green';
      default:
        return '#1976d2';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>My Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTasks')}
        >
          <Icon name="add-circle" size={30} color="#ff883a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.taskList}>
        {tasks.map(task => (
          <TouchableOpacity
            key={task.task_id}
            style={styles.card}
            onPress={() =>
              navigation.navigate('ViewTask', { id: task.task_id })
            }
          >
            <View style={styles.cardHeader}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={styles.actionIcons}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditTask', { task })}
                >
                  <Icon name="create-outline" size={22} color="#1976d2" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      'Delete Task',
                      'Are you sure you want to delete this task?',
                      [
                        { text: 'Cancel' },
                        {
                          text: 'Delete',
                          onPress: () => handleDelete(task.task_id),
                          style: 'destructive',
                        },
                      ],
                    )
                  }
                  style={{ marginLeft: 12 }}
                >
                  <Icon name="trash-outline" size={22} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <MaterialIcons name="category" size={18} color="#ff883a" />
              <Text style={styles.label}> {task.category_name}</Text>
            </View>

            <View style={styles.row}>
              <Icon name="location-outline" size={18} color="#ff883a" />
              <Text style={styles.label}> {task.location}</Text>
            </View>

            <View style={styles.row}>
              <FontAwesome5 name="user-circle" size={18} color="#ff883a" />
              <Text style={styles.label}> {task.assignee_name}</Text>
            </View>

            <View style={styles.row}>
              <MaterialIcons
                name="pending-actions"
                size={18}
                color={getStatusColor(task.status_name)}
              />
              <Text
                style={[
                  styles.status,
                  { color: getStatusColor(task.status_name) },
                ]}
              >
                {' '}
                {task.status_name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff883a',
    paddingTop: 50,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    backgroundColor: '#ffeee6',
    padding: 10,
    borderRadius: 50,
  },
  taskList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#ffeee6',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  actionIcons: {
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  label: {
    fontSize: 14,
    color: '#555',
  },
  status: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default TaskList;
