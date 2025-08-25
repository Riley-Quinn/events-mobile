/* eslint-disable react-native/no-inline-styles */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '@env';
const PrivatePageList = () => {
  const navigation = useNavigation();
  const [drafts, setDrafts] = useState([]);

  const fetchDrafts = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/drafts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrafts(res.data || []);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch drafts');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDrafts();
    }, [fetchDrafts]),
  );

  const handleDelete = async draftId => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/drafts/${draftId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Deleted', 'Draft deleted successfully');
      fetchDrafts();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to delete draft');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ViewDraft', { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.taskTitle, { maxWidth: '75%' }]} numberOfLines={1}>
          {item.Title}
        </Text>
        <View style={styles.actionIcons}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddPrivatePage', { draft: item })
            }
          >
            <Icon name="create-outline" size={22} color="#1976d2" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Delete Draft', 'Are you sure?', [
                { text: 'Cancel' },
                {
                  text: 'Delete',
                  onPress: () => handleDelete(item.id),
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
        <MaterialIcons name="description" size={18} color="#ff883a" />
        <Text
          style={[styles.label, { marginLeft: 8, marginBottom: 8 }]}
          numberOfLines={1}
        >
          {item.Description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerBackground}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>My Drafts</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddPrivatePage')}
          >
            <Icon name="add-circle" size={30} color="#ff883a" />
          </TouchableOpacity>
        </View>
      </View>

      {drafts.length === 0 ? (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>No Drafts</Text>
        </View>
      ) : (
        <FlatList
          data={drafts}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 50 }}
        />
      )}
    </View>
  );
};

export default PrivatePageList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffeee6',
    paddingTop: 130,
  },
  headerBackground: {
    backgroundColor: '#ff883a',
    height: 120,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 60,
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
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 10,
    marginHorizontal: 20,
    elevation: 3,
    marginTop: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 13,
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
  noEventsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 300,
  },
  noEventsText: {
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
