import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { BASE_URL, CLOUD_FRONT_URL } from '@env';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import moment from 'moment';

const ViewEvent = ({ route, navigation }) => {
  const { id } = route.params;
  const [event, setEvent] = useState(null);
  const [media, setMedia] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const fetchEvent = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await axios.get(`${BASE_URL}/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvent(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load event');
    }
  }, [id]);

  const fetchMedia = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await axios.get(`${BASE_URL}/api/media/event/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedia(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load media');
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
    fetchMedia();
  }, [fetchEvent, fetchMedia]);

  const selectFile = async () => {
    if (media.length >= 4) {
      Alert.alert('Limit Reached', 'You can only upload 4 images.');
      return;
    }

    launchImageLibrary(
      { mediaType: 'mixed', selectionLimit: 1 },
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
      setUploading(true);
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
      setUploading(false);
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

  const shareSelectedImages = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Images Selected', 'Please select images to share.');
      return;
    }

    try {
      const downloadedPaths = [];

      for (let img of selectedImages) {
        const imageUrl = getFileUrl(img.url);
        const localPath = `${RNFS.CachesDirectoryPath}/${Date.now()}_${
          img.id
        }.jpg`;
        await RNFS.downloadFile({ fromUrl: imageUrl, toFile: localPath })
          .promise;
        downloadedPaths.push('file://' + localPath);
      }

      await Share.open({
        urls: downloadedPaths,
        type: 'image/jpeg',
      });
    } catch (err) {}
  };

  const toggleSelectImage = item => {
    const alreadySelected = selectedImages.find(img => img.id === item.id);
    if (alreadySelected) {
      setSelectedImages(selectedImages.filter(img => img.id !== item.id));
    } else {
      setSelectedImages([...selectedImages, item]);
    }
  };

  const renderMedia = item => {
    const fileUrl = getFileUrl(item.url);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(item.url);
    const isSelected = selectedImages.some(img => img.id === item.id);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.mediaBox}
        onPress={() => toggleSelectImage(item)}
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
            onError={() => {}}
          />
        )}

        {isSelected && (
          <View style={styles.selectedCircle}>
            <Icon name="checkmark" size={18} color="white" />
          </View>
        )}

        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={() => deleteMedia(item.id)}
        >
          <Icon name="trash" size={20} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
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

        <View
          style={{
            flexDirection: 'row',
            marginLeft: 'auto',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={shareSelectedImages}
            style={{ marginRight: 12 }}
          >
            <Icon name="share-social" size={30} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('AddPressRelease')}
          >
            <Icon name="add-circle" size={30} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Description: </Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}> : {event.location}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>
              {' '}
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
                style={{ marginTop: 10, textAlign: 'center', color: '#000' }}
              >
                Selected: {selectedFile.fileName}
              </Text>
              <TouchableOpacity
                style={[
                  styles.uploadBtn,
                  { backgroundColor: '#28a745', marginTop: 10 },
                ]}
                onPress={uploadFile}
                disabled={uploading}
              >
                {uploading && (
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text style={styles.uploadText}>
                  {uploading ? 'Uploading...' : 'Upload Selected File'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>Uploaded Media</Text>
        <View style={styles.mediaContainer}>{media.map(renderMedia)}</View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  plusIcon: { marginLeft: 10 },
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
  row: { flexDirection: 'row', marginBottom: 8, flexWrap: 'wrap' },
  label: { fontWeight: 'bold', color: '#000', fontSize: 18 },
  value: { color: '#000', fontSize: 18, flexShrink: 1 },
  descriptionText: { fontSize: 16, color: '#000', marginTop: 4 },
  uploadBtn: {
    backgroundColor: '#ff883a',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadText: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: {
    fontSize: 18,
    marginTop: 24,
    marginBottom: 10,
    color: '#000',
    fontWeight: 'bold',
  },
  mediaContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  mediaBox: { width: 110, height: 110, margin: 6, position: 'relative' },
  mediaThumb: { width: '100%', height: '100%', borderRadius: 8 },
  deleteIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 4,
  },
  selectedCircle: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff883a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ViewEvent;
