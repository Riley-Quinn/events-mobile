/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

const API_BASE = 'http://10.0.2.2:4000';
const MEDIA_BASE_URL = 'https://d108ysp6ovb3mv.cloudfront.net';

const ViewEvent = ({ route }) => {
  const { id } = route.params;
  const [event, setEvent] = useState(null);
  const [media, setMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchEvent();
    fetchMedia();
  }, []);

  const fetchEvent = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await axios.get(`${API_BASE}/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvent(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load event');
    }
  };

  const fetchMedia = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await axios.get(`${API_BASE}/api/media/event/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedia(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load media');
    }
  };

  const uploadFile = async () => {
    const token = await AsyncStorage.getItem('token');

    launchImageLibrary(
      {
        mediaType: 'mixed', // 'photo' | 'video' | 'mixed'
        selectionLimit: 1,
      },
      async response => {
        if (response.didCancel) return;

        const asset = response.assets?.[0];
        if (!asset) {
          Alert.alert('Error', 'No file selected');
          return;
        }

        const formData = new FormData();
        formData.append('file', {
          uri:
            Platform.OS === 'ios'
              ? asset.uri.replace('file://', '')
              : asset.uri,
          type: asset.type,
          name: asset.fileName || `upload.${asset.type?.split('/')[1]}`,
        });

        try {
          await axios.post(`${API_BASE}/api/media/upload/${id}`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });
          fetchMedia();
        } catch (err) {
          Alert.alert('Upload Failed', 'Something went wrong');
        }
      },
    );
  };

  const deleteMedia = async mediaId => {
    const token = await AsyncStorage.getItem('token');
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this media?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE}/api/media/${mediaId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              fetchMedia();
            } catch (err) {
              Alert.alert('Error', 'Delete failed');
            }
          },
        },
      ],
    );
  };

  const getFileUrl = url => `${MEDIA_BASE_URL}/${url}`;
  const renderMedia = item => {
    const fileUrl = getFileUrl(item.url);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(item.url);
    const isPdf = /\.pdf$/i.test(item.url);

    return (
      <View key={item.id} style={styles.mediaBox}>
        <TouchableOpacity
          onPress={() => {
            setSelectedMedia(item);
            setModalVisible(true);
          }}
        >
          {isVideo ? (
            <Video
              source={{ uri: fileUrl }}
              style={styles.mediaThumb}
              resizeMode="cover"
              paused
            />
          ) : (
            <Image
              source={{ uri: fileUrl }}
              style={styles.mediaThumb}
              onError={() => Alert.alert('Image failed to load')}
              onLoad={() => console.log('Image loaded')}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={() => deleteMedia(item.id)}
        >
          <Icon name="trash" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  if (!event)
    return <ActivityIndicator style={{ marginTop: 100 }} size="large" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{event.title}</Text>

      <Text style={styles.label}>
        Description: <Text style={styles.value}>{event.description}</Text>
      </Text>
      <Text style={styles.label}>
        Location: <Text style={styles.value}>{event.location}</Text>
      </Text>
      <Text style={styles.label}>
        Date: <Text style={styles.value}>{event.date}</Text>
      </Text>
      <Text style={styles.label}>
        Time:{' '}
        <Text style={styles.value}>
          {event.time === '00:00:00' ? 'All Day' : event.time}
        </Text>
      </Text>

      <TouchableOpacity style={styles.uploadBtn} onPress={uploadFile}>
        <Text style={styles.uploadText}>Upload Media</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Uploaded Media</Text>
      <View style={styles.mediaContainer}>{media.map(renderMedia)}</View>

      {/* Media Preview Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            {selectedMedia && (
              <>
                {/\.(mp4|webm|ogg)$/i.test(selectedMedia.url) ? (
                  <Video
                    source={{ uri: getFileUrl(selectedMedia.url) }}
                    style={styles.previewMedia}
                    controls
                  />
                ) : (
                  <Image
                    source={{ uri: getFileUrl(selectedMedia.url) }}
                    style={styles.previewMedia}
                    resizeMode="contain"
                  />
                )}
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={{ color: 'white' }}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  value: {
    fontWeight: 'normal',
  },
  uploadBtn: {
    backgroundColor: '#ff883a',
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  uploadText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 24,
    marginBottom: 10,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaBox: {
    width: 110,
    height: 110,
    margin: 6,
    position: 'relative',
  },
  mediaThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  deleteIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 4,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
  },
  previewMedia: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  closeButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
  },
});

export default ViewEvent;
