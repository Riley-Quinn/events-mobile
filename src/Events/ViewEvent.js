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
import { BASE_URL, CLOUD_FRONT_URL } from '@env';
import moment from 'moment';

const ViewEvent = ({ route, navigation }) => {
  const { id } = route.params;
  const [event, setEvent] = useState(null);
  const [media, setMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEvent();
    fetchMedia();
  }, []);

  const fetchEvent = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await axios.get(`${BASE_URL}/api/events/${id}`, {
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
      const res = await axios.get(`${BASE_URL}/api/media/event/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedia(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load media');
    }
  };

  const selectFile = async () => {
    launchImageLibrary(
      {
        mediaType: 'mixed',
        selectionLimit: 1,
      },
      async response => {
        if (response.didCancel) return;

        const asset = response.assets?.[0];
        if (!asset) {
          Alert.alert('Error', 'No file selected');
          return;
        }

        setSelectedFile(asset);
      },
    );
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      Alert.alert('No file selected');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', {
      uri:
        Platform.OS === 'ios'
          ? selectedFile.uri.replace('file://', '')
          : selectedFile.uri,
      type: selectedFile.type,
      name:
        selectedFile.fileName || `upload.${selectedFile.type?.split('/')[1]}`,
    });

    try {
      setUploading(true); // START loader
      await axios.post(`${BASE_URL}/api/media/upload/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSelectedFile(null);
      fetchMedia();
    } catch (err) {
      Alert.alert('Upload Failed', 'Something went wrong');
    } finally {
      setUploading(false); // STOP loader
    }
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
              await axios.delete(`${BASE_URL}/api/media/${mediaId}`, {
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

  const getFileUrl = url => `${CLOUD_FRONT_URL}/${url}`;

  const renderMedia = item => {
    const fileUrl = getFileUrl(item.url);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(item.url);
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
            <Image source={{ uri: fileUrl }} style={styles.mediaThumb} />
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
    <ScrollView style={{ backgroundColor: '#ffeee6', flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back-sharp" color="#000" size={30} />
        </TouchableOpacity>

        <Text style={styles.heading}>{event.title}</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}> : {event.description}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}> : {event.location}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>
              : {moment(event.date).format('DD MMM YYYY')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>
              :{' '}
              {event.time === '00:00:00'
                ? 'All Day'
                : moment(event.time, 'HH:mm:ss').format('hh:mm A')}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <TouchableOpacity style={styles.uploadBtn} onPress={selectFile}>
            <Text style={styles.uploadText}>Choose File</Text>
          </TouchableOpacity>

          {selectedFile && (
            <>
              <Text
                style={{ marginTop: 10, color: '#000', textAlign: 'center' }}
              >
                Selected: {selectedFile.fileName}
              </Text>

              <TouchableOpacity
                style={[
                  styles.uploadBtn,
                  {
                    backgroundColor: '#28a745',
                    marginTop: 10,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
                onPress={uploadFile}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                ) : null}
                <Text style={styles.uploadText}>
                  {uploading ? 'Uploading...' : 'Upload Selected File'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>Uploaded Media</Text>
        <View style={styles.mediaContainer}>{media.map(renderMedia)}</View>

        {/* Modal for preview */}
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
                      style={{ width: '100%', height: '100%' }}
                      controls
                      resizeMode="contain"
                      paused={false}
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  columnRow: {
    marginBottom: 10,
  },

  descriptionText: {
    fontSize: 16,
    color: '#000',
    marginTop: 4,
    lineHeight: 22,
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

  uploadBtn: {
    backgroundColor: '#ff883a',
    padding: 12,
    borderRadius: 10,
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
    color: '#000',
    fontWeight: 'bold',
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
  header: {
    width: '100%',
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
    marginTop: 10,
    lineHeight: 30,
    flexWrap: 'wrap',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ViewEvent;
