/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Platform,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { BASE_URL, CLOUD_FRONT_URL } from '@env';
import CommentBox from '../comments/Comments';
import { useFocusEffect } from '@react-navigation/native';

const ViewPressRelease = ({ route, navigation }) => {
  const { id } = route.params;
  const [press, setPress] = useState(null);
  const [media, setMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchPressRelease = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      console.log('📡 Fetching press release details...');
      const res = await axios.get(`${BASE_URL}/api/press-release/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('✅ Press Release Data:', res.data);
      setPress(res.data);
    } catch (err) {
      console.log('❌ Failed to load Press Release:', err);
      Alert.alert('Error', 'Failed to load Press Release Note');
    }
  };

  const fetchMedia = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      console.log('📡 Fetching media for press ID:', id);
      const res = await axios.get(`${BASE_URL}/api/press-media/press/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('✅ Media API Response:', res.data);
      setMedia(res.data);
    } catch (err) {
      console.log('❌ Failed to fetch media:', err);
      Alert.alert('Error', 'Failed to load media');
    }
  };

  useEffect(() => {
    fetchPressRelease();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Screen Focused - Fetching Media Again...');
      fetchMedia();
    }, [id]),
  );

  const selectFile = () => {
    launchImageLibrary({ mediaType: 'mixed', selectionLimit: 1 }, response => {
      if (response.didCancel) return;
      const asset = response.assets?.[0];
      if (!asset) return Alert.alert('Error', 'No file selected');
      console.log('📂 File Selected:', asset);
      setSelectedFile(asset);
    });
  };

  const uploadFile = async () => {
    if (!selectedFile) return Alert.alert('No file selected');
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
      console.log('⬆️ Uploading file...');
      await axios.post(`${BASE_URL}/api/press-media/upload/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ Upload Success!');
      setSelectedFile(null);
      await fetchMedia(); // ✅ Refresh media after upload
    } catch (err) {
      console.log('❌ Upload Error:', err);
      Alert.alert('Upload Failed', 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async mediaId => {
    const token = await AsyncStorage.getItem('token');
    Alert.alert('Confirm Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            console.log('🗑 Deleting media:', mediaId);
            await axios.delete(`${BASE_URL}/api/press-media/${mediaId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchMedia();
          } catch (err) {
            console.log('❌ Delete Error:', err);
            Alert.alert('Error', 'Delete failed');
          }
        },
      },
    ]);
  };

  const getFileUrl = url => `${CLOUD_FRONT_URL}/${url}?t=${Date.now()}`;

  const renderMedia = item => {
    const fileUrl = getFileUrl(item.url);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(item.url);
    return (
      <View key={item.image_id} style={styles.mediaBox}>
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
          onPress={() => deleteMedia(item.image_id)}
        >
          <Icon name="trash" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  if (!press)
    return <ActivityIndicator style={{ marginTop: 100 }} size="large" />;

  return (
    <FlatList
      data={[]}
      keyExtractor={() => 'key'}
      ListHeaderComponent={
        <View style={{ backgroundColor: '#ffeee6', flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="chevron-back-sharp" color="#000" size={30} />
            </TouchableOpacity>
            <Text style={styles.heading}>{press.title}</Text>
          </View>

          <View style={styles.container}>
            <View style={styles.card}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.label}>Notes: </Text>
                <Text style={styles.value}>{press.notes}</Text>
              </View>

              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.label}>Assignee: </Text>
                <Text style={styles.value}>{press.assignee_name}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.uploadBtn} onPress={selectFile}>
              <Text style={styles.uploadText}>Choose File</Text>
            </TouchableOpacity>

            {selectedFile && (
              <>
                <Text style={{ marginTop: 10, textAlign: 'center' }}>
                  Selected: {selectedFile.fileName}
                </Text>
                <TouchableOpacity
                  style={[styles.uploadBtn, { backgroundColor: '#28a745' }]}
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
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <Text style={styles.sectionTitle}>Uploaded Media</Text>
            <View style={styles.mediaContainer}>{media.map(renderMedia)}</View>
          </View>

          <Modal
            visible={modalVisible}
            transparent
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContent}>
                {selectedMedia &&
                  (/\.(mp4|webm|ogg)$/i.test(selectedMedia.url) ? (
                    <Video
                      source={{ uri: getFileUrl(selectedMedia.url) }}
                      style={{ width: '100%', height: '100%' }}
                      controls
                      resizeMode="contain"
                    />
                  ) : (
                    <Image
                      source={{ uri: getFileUrl(selectedMedia.url) }}
                      style={styles.previewMedia}
                      resizeMode="contain"
                    />
                  ))}
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={{ color: 'white' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={styles.CommentBox}>
            <CommentBox module={'press_release'} moduleId={id} />
          </View>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontWeight: 'bold', fontSize: 18, color: '#000' },
  value: { fontSize: 18, color: '#000' },
  card: { padding: 15, backgroundColor: '#fff', borderRadius: 10 },
  uploadBtn: { backgroundColor: '#ff883a', padding: 12, borderRadius: 10 },
  uploadText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  sectionTitle: { fontSize: 18, marginTop: 20, fontWeight: 'bold' },
  mediaContainer: { flexDirection: 'row', flexWrap: 'wrap' },
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { width: '90%', height: '80%' },
  previewMedia: { width: '100%', height: '100%' },
  closeButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
  },
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
  heading: { fontSize: 22, fontWeight: 'bold', color: '#000', marginLeft: 10 },
  CommentBox: { margin: 20, padding: 20, backgroundColor: '#fff' },
});

export default ViewPressRelease;
