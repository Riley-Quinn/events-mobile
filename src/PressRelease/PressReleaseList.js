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

const PressReleaseList = () => {
  const navigation = useNavigation();
  const [pressRelease, setPressRelease] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchPressRelease();
    }, []),
  );

  const fetchPressRelease = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const res = await axios.get(`${BASE_URL}/api/press-release/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPressRelease(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch Press Release');
    }
  };

  const handleDelete = async press_id => {
    try {
      const token = await AsyncStorage.getItem('token');

      await axios.delete(`${BASE_URL}/api/press-release/${press_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchPressRelease();
      Alert.alert('Deleted', 'Press Release deleted successfully');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to delete Press Release');
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>My Press Release</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPressRelease')}
        >
          <Icon name="add-circle" size={30} color="#ff883a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.taskList}>
        {pressRelease.map(pressrelease => (
          <View key={pressrelease.press_id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.taskTitle}>{pressrelease.title}</Text>
              <View style={styles.actionIcons}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('EditPressRelease', { pressrelease })
                  }
                >
                  <Icon name="create-outline" size={22} color="#1976d2" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      'Delete Press Release',
                      'Are you sure you want to delete this Press Release?',
                      [
                        { text: 'Cancel' },
                        {
                          text: 'Delete',
                          onPress: () => handleDelete(pressrelease.press_id),
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
              <MaterialIcons name="notes" size={18} color="#ff883a" />
              <Text
                style={[styles.label, { flex: 1 }]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {pressrelease.notes}
              </Text>
            </View>

            <View style={styles.row}>
              <FontAwesome5 name="user-circle" size={18} color="#ff883a" />
              <Text style={styles.label}> {pressrelease.assignee_name}</Text>
            </View>

            <View style={styles.row}>
              <MaterialIcons
                name="pending-actions"
                size={18}
                color={getStatusColor(pressrelease.status_name)}
              />
              <Text
                style={[
                  styles.status,
                  { color: getStatusColor(pressrelease.status_name) },
                ]}
              >
                {pressrelease.status_name}
              </Text>
            </View>
          </View>
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

export default PressReleaseList;
