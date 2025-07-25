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
} from 'react-native';
import Video from 'react-native-video';
import axios from 'axios';
import { BASE_URL, CLOUD_FRONT_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';

const { width, height } = Dimensions.get('window');
const numColumns = 3;
const imageSize = width / numColumns - 10;

const Gallery = () => {
  const [flatMedia, setFlatMedia] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const navigation = useNavigation();

  const formatDate = date => moment(date).format('ddd, MMMM D');

  const groupByDate = mediaList => {
    return mediaList.reduce((acc, item) => {
      const section = acc.find(s => s.title === item.date);
      if (section) {
        section.data.push(item);
      } else {
        acc.push({ title: item.date, data: [item] });
      }
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
      console.error('Error fetching event media', err);
      Alert.alert('Error', 'Failed to fetch media for selected event');
      setFlatMedia([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMedia();
  }, []);
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
      console.error('Error fetching all media', err);
      Alert.alert('Error', 'Failed to fetch all media');
      setFlatMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = flatMedia.filter(item => item.uri.toLowerCase());
  const filteredGroupedMedia = groupByDate(filteredMedia);

  const openViewer = item => {
    const index = flatMedia.findIndex(i => i.uri === item.uri);
    setSelectedIndex(index);
  };

  const closeViewer = () => {
    setSelectedIndex(null);
  };

  const renderMediaItem = ({ item }) => (
    <TouchableOpacity onPress={() => openViewer(item)}>
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
  );

  const renderSection = ({ section }) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.date}>{section.title}</Text>
      <View style={styles.grid}>
        {section.data.map((item, index) => (
          <View key={index} style={{ width: imageSize }}>
            {renderMediaItem({ item })}
          </View>
        ))}
      </View>
    </View>
  );

  const renderViewerItem = ({ item }) => (
    <View style={styles.viewerItem}>
      {item.type === 'image' ? (
        <Image
          source={{ uri: item.uri }}
          style={styles.fullMedia}
          resizeMode="contain"
        />
      ) : (
        <Video
          source={{ uri: item.uri }}
          controls
          resizeMode="contain"
          style={styles.fullMedia}
        />
      )}
    </View>
  );
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

      // Add "All" option at the top
      setEvents([{ label: 'All', value: 'all' }, ...formatted]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6600" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {/* Header */}
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
      <View style={styles.container1}>
        <Dropdown
          style={styles.dropdown}
          data={events}
          labelField="label"
          valueField="value"
          placeholder="Choose an event"
          value={selectedEvent}
          onChange={item => {
            setSelectedEvent(item.value);
            if (item.value === 'all') {
              fetchAllMedia();
            } else {
              fetchMediaByEvent(item.value);
            }
          }}
          containerStyle={styles.dropdownContainer}
          selectedTextStyle={styles.selectedText}
          itemTextStyle={styles.itemText}
          placeholderStyle={styles.placeholderText}
        />
      </View>
      {/* Gallery */}
      {loading ? (
        <ActivityIndicator size="large" color="#f97316" />
      ) : (
        <SectionList
          sections={filteredGroupedMedia}
          keyExtractor={(_, index) => index.toString()}
          renderItem={() => null}
          renderSectionHeader={renderSection}
        />
      )}

      {/* Viewer */}
      <Modal visible={selectedIndex !== null} transparent={false}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalClose} onPress={closeViewer}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <SectionList
            sections={[{ title: '', data: flatMedia }]}
            horizontal
            pagingEnabled
            initialScrollIndex={selectedIndex}
            renderItem={renderViewerItem}
            keyExtractor={(_, index) => index.toString()}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffeee6',
  },
  header: {
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: '#ff883a',
    paddingVertical: 40,
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
    marginTop: 8,
    marginLeft: 20,
    color: '#000',
  },
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 5,
  },
  image: {
    width: imageSize,
    height: imageSize,
    margin: 5,
    borderRadius: 8,
  },
  videoThumbnail: {
    position: 'relative',
  },
  date: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
    marginTop: 8,
    marginLeft: 20,
  },
  playOverlay: {
    position: 'absolute',
    top: '35%',
    left: '35%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10,
    borderRadius: 30,
  },
  playText: {
    fontSize: 24,
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  closeText: {
    fontSize: 28,
    color: '#fff',
  },
  viewerItem: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullMedia: {
    width,
    height: '100%',
  },
  container1: {
    margin: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  dropdown: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    borderRadius: 8,
    elevation: 4,
    backgroundColor: '#fff',
  },
  selectedText: {
    fontSize: 14,
    color: '#000',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
  },
  itemText: {
    fontSize: 14,
    color: '#000',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Gallery;
