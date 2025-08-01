/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
  TextInput,
  FlatList,
} from 'react-native';
import Video from 'react-native-video';
import axios from 'axios';
import { BASE_URL, CLOUD_FRONT_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');
const numColumns = 3;
const imageSize = width / numColumns - 10;

const Gallery = () => {
  const [flatMedia, setFlatMedia] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const navigation = useNavigation();

  const formatDate = date => moment(date).format('ddd, MMMM D');

  const groupByDate = mediaList => {
    return mediaList.reduce((acc, item) => {
      const section = acc.find(s => s.title === item.date);
      if (section) section.data.push(item);
      else acc.push({ title: item.date, data: [item] });
      return acc;
    }, []);
  };

  const fetchMediaByEvent = async eventId => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/media/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formatted = res.data.map(item => ({
        uri: `${CLOUD_FRONT_URL}/${item.url}`,
        created_at: item.created_at,
        type: item.type || (item.url.endsWith('.mp4') ? 'video' : 'image'),
        date: formatDate(item.created_at),
      }));

      setFlatMedia(formatted);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch media for selected event');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMedia = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/media/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formatted = res.data.map(item => ({
        uri: `${CLOUD_FRONT_URL}/${item.url}`,
        created_at: item.created_at,
        type: item.type || (item.url.endsWith('.mp4') ? 'video' : 'image'),
        date: formatDate(item.created_at),
      }));

      setFlatMedia(formatted);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch all media');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/events/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formatted = res.data.map(event => ({
        label: event.title,
        value: event.id,
      }));

      const allEvents = [{ label: 'All', value: 'all' }, ...formatted];
      setEvents(allEvents);
      setFilteredEvents(allEvents);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMedia();
    fetchEvents();
  }, []);

  const handleSearchChange = text => {
    setSearchText(text);
    setShowDropdown(true);

    const filtered = events.filter(e =>
      e.label.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredEvents(filtered);
  };

  const selectEvent = item => {
    setSelectedEvent(item.value);
    setSearchText(item.label);
    setShowDropdown(false);

    if (item.value === 'all') fetchAllMedia();
    else fetchMediaByEvent(item.value);
  };

  const filteredMedia = flatMedia.filter(item => {
    if (!selectedDate) return true;
    return moment(item.created_at).isSame(selectedDate, 'day');
  });

  const filteredGroupedMedia = groupByDate(filteredMedia);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6600" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.details}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back-sharp" color="#000" size={30} />
          </TouchableOpacity>
          <Text style={styles.heading}>Gallery</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search  event..."
          placeholderTextColor="#aaa"
          value={searchText}
          onChangeText={handleSearchChange}
        />
        <TouchableOpacity onPress={() => setShowDropdown(!showDropdown)}>
          <Icon name="chevron-down" size={22} color="#FF6600" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Icon
            name="calendar"
            size={22}
            color="#FF6600"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
      </View>

      {showDropdown && filteredEvents.length > 0 && (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item, index) => index.toString()}
          style={styles.suggestionBox}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => selectEvent(item)}
            >
              <Text style={styles.suggestionText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {filteredGroupedMedia.length === 0 && (
        <Text
          style={{
            textAlign: 'center',
            marginTop: 20,
            fontSize: 16,
            color: '#555',
          }}
        >
          No events on this date
        </Text>
      )}

      <SectionList
        sections={filteredGroupedMedia}
        keyExtractor={(_, index) => index.toString()}
        renderItem={() => null}
        renderSectionHeader={({ section }) => (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.date}>{section.title}</Text>
            <View style={styles.grid}>
              {section.data.map((item, index) => (
                <View key={index} style={{ width: imageSize }}>
                  <TouchableOpacity onPress={() => setSelectedIndex(index)}>
                    {item.type === 'image' ? (
                      <Image source={{ uri: item.uri }} style={styles.image} />
                    ) : (
                      <View style={styles.videoThumbnail}>
                        <Video
                          source={{ uri: item.uri }}
                          paused
                          resizeMode="cover"
                          style={styles.image}
                        />
                        <View style={styles.playOverlay}>
                          <Text style={styles.playText}>▶</Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffeee6' },
  header: {
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: '#ff883a',
    paddingVertical: 40,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  date: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
    marginTop: 8,
    marginLeft: 20,
  },

  details: { flexDirection: 'row', alignItems: 'center' },
  heading: { fontSize: 26, fontWeight: 'bold', marginLeft: 20, color: '#000' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 10,
    borderRadius: 16,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#000' },
  suggestionBox: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 2,
    borderRadius: 8,
    elevation: 3,
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: { fontSize: 15, color: '#000' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 5 },
  image: { width: imageSize, height: imageSize, margin: 5, borderRadius: 8 },
  videoThumbnail: { position: 'relative' },
  playOverlay: {
    position: 'absolute',
    top: '35%',
    left: '35%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10,
    borderRadius: 30,
  },
  playText: { fontSize: 24, color: '#fff' },
});

export default Gallery;
