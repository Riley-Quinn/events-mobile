/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import moment from 'moment';

import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import { DraxProvider, DraxList } from 'react-native-drax';

const TaskList = () => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks(showAll);
    }, [showAll]),
  );

  const fetchTasks = async (showAll = false) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allTasks = res.data.list || [];

      const filteredTasks = showAll
        ? allTasks
        : allTasks.filter(
            t =>
              moment(t.created_at).format('YYYY-MM-DD') ===
              moment().format('YYYY-MM-DD'),
          );

      setTasks(filteredTasks);
    } catch (err) {
      console.error('Tasks error', err);
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
      case 'Closed':
        return 'green';
      default:
        return '#1976d2';
    }
  };

  const onItemReorder = async ({ fromIndex, toIndex }) => {
    const updatedTasks = [...tasks];
    const movedItem = updatedTasks.splice(fromIndex, 1)[0];
    updatedTasks.splice(toIndex, 0, movedItem);
    setTasks(updatedTasks);

    try {
      const reorderedPayload = updatedTasks.map((task, index) => ({
        task_id: task.task_id,
        priority: index + 1,
      }));

      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${BASE_URL}/api/tasks/update-priority`,
        { tasks: reorderedPayload },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Alert.alert('Success', 'Task order updated successfully');
    } catch (err) {
      console.error('Failed to update task order', err);
      Alert.alert('Error', 'Failed to update task order');
      fetchTasks(showAll);
    }
  };

  const renderTask = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ViewTask', { id: item.task_id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <View style={styles.actionIcons}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('EditTask', { taskId: item.task_id })
            }
          >
            <Icon name="create-outline" size={22} color="#1976d2" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Delete Task', 'Are you sure?', [
                { text: 'Cancel' },
                {
                  text: 'Delete',
                  onPress: () => handleDelete(item.task_id),
                  style: 'destructive',
                },
              ])
            }
            style={{ marginLeft: 12 }}
          >
            <Icon name="trash-outline" size={22} color="#ff3b30" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.row}>
        <MaterialIcons name="category" size={18} color="#ff883a" />
        <Text style={styles.label}> {item.category_name}</Text>
      </View>

      <View style={styles.row}>
        <Icon name="location-outline" size={18} color="#ff883a" />
        <Text style={styles.label}> {item.location}</Text>
      </View>

      <View style={styles.row}>
        <MaterialIcons name="description" size={18} color="#ff883a" />
        <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
          {item.description}
        </Text>
      </View>

      <View style={styles.row}>
        <FontAwesome5 name="user-circle" size={18} color="#ff883a" />
        <Text style={styles.label}> {item.assignee_name}</Text>
      </View>

      <View style={styles.row}>
        <MaterialIcons
          name="pending-actions"
          size={18}
          color={getStatusColor(item.status_name)}
        />
        <Text
          style={[styles.status, { color: getStatusColor(item.status_name) }]}
        >
          {item.status_name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>My Tasks</Text>
        <TouchableOpacity
          style={{ marginRight: 12 }}
          onPress={() => setShowAll(prev => !prev)}
        >
          <Icon
            name={showAll ? 'toggle' : 'toggle-outline'}
            size={30}
            color={showAll ? 'red' : '#888'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTasks')}
        >
          <Icon name="add-circle" size={30} color="#ff883a" />
        </TouchableOpacity>
      </View>

      {/* 🔥 Drax Drag & Drop List */}
      <DraxProvider>
        <DraxList
          data={tasks}
          renderItemContent={renderTask}
          keyExtractor={item => item.task_id.toString()}
          reorderable={true}
          onItemReorder={onItemReorder}
          scrollEnabled={true}
          itemAnimator={{ type: 'scale', spring: true }}
          dragPayload={item => item}
        />
      </DraxProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffeee6', paddingTop: 50 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: { padding: 5, marginRight: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#000' },
  addButton: { backgroundColor: '#ffeee6', padding: 10, borderRadius: 50 },
  card: {
    backgroundColor: '#ffeee6',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    marginHorizontal: 20,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  actionIcons: { flexDirection: 'row' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, color: '#555', marginLeft: 8 },
  status: { fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
});

export default TaskList;
