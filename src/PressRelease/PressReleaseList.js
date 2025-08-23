/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import moment from 'moment';
import { DraxProvider, DraxList } from 'react-native-drax';
import { PERMISSIONS } from '../Dashboard/contextPage';

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

  const onItemReorder = async ({ fromIndex, toIndex }) => {
    const updatedPress = [...pressRelease];
    const movedItem = updatedPress.splice(fromIndex, 1)[0];
    updatedPress.splice(toIndex, 0, movedItem);
    setPressRelease(updatedPress);

    try {
      const reorderedPayload = updatedPress.map((item, index) => ({
        press_id: item.press_id,
        priority: index + 1,
      }));

      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${BASE_URL}/api/press-release/update-priority`,
        { presses: reorderedPayload },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Alert.alert('Success', 'Press release order updated successfully');
    } catch (err) {
      console.error('Failed to update press release order', err);
      Alert.alert('Error', 'Failed to update press release order');
      fetchPressRelease();
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
        <Text style={styles.title}>My PressRelease</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {PERMISSIONS.addEvent() && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddEvent')}
            >
              <Icon name="add-circle" size={30} color="#ff883a" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <DraxProvider>
        <DraxList
          data={pressRelease}
          renderItemContent={({ item }) => (
            <TouchableOpacity
              key={item.press_id}
              style={styles.card}
              onPress={() =>
                navigation.navigate('ViewPressRelease', {
                  id: item.press_id,
                })
              }
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text
                    style={styles.taskTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.title}
                  </Text>
                </View>

                <View style={styles.actionIcons}>
                  {PERMISSIONS.addEvent() && (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('EditPressRelease', {
                          pressId: item.press_id,
                        })
                      }
                    >
                      <Icon name="create-outline" size={22} color="#1976d2" />
                    </TouchableOpacity>
                  )}

                  {PERMISSIONS.addEvent() && (
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(
                          'Delete Press Release',
                          'Are you sure you want to delete this Press Release?',
                          [
                            { text: 'Cancel' },
                            {
                              text: 'Delete',
                              onPress: () => handleDelete(item.press_id),
                              style: 'destructive',
                            },
                          ],
                        )
                      }
                      style={{ marginLeft: 12 }}
                    >
                      <Icon name="trash-outline" size={22} color="#ff3b30" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ marginTop: 2 }}>
                  <MaterialIcons name="notes" size={18} color="#ff883a" />
                </View>
                <Text style={[styles.label, { flex: 1 }]}>{item.notes}</Text>
              </View>

              <View style={styles.row}>
                <FontAwesome5 name="user-circle" size={18} color="#ff883a" />
                <Text
                  style={[styles.label, { flex: 1 }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.assignee_name}
                </Text>
              </View>

              <View style={styles.row}>
                <MaterialIcons
                  name="pending-actions"
                  size={18}
                  color={getStatusColor(item.status_name)}
                />
                <Text
                  style={[
                    styles.status,
                    { color: getStatusColor(item.status_name) },
                  ]}
                >
                  {item.status_name}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          onItemReorder={onItemReorder}
          keyExtractor={item => item.press_id.toString()}
          scrollEnabled={true}
          draggingStyle={{ opacity: 0.2 }}
          dragReleasedStyle={{ opacity: 1 }}
        />
      </DraxProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffeee6' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#ff883a',
    paddingBottom: 15,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  addButton: {
    backgroundColor: '#ffeee6',
    padding: 10,
    borderRadius: 50,
  },

  backButton: { padding: 5, marginRight: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#000' },
  taskList: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 10,
    marginTop: 30,
    marginHorizontal: 20,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  actionIcons: { flexDirection: 'row' },
  row: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'flex-start',
  },

  label: {
    fontSize: 15,
    color: '#000',
    marginLeft: 8,
    flexShrink: 1,
  },

  status: { fontSize: 15, fontWeight: 'bold', marginTop: 5, marginLeft: 8 },
});

export default PressReleaseList;
