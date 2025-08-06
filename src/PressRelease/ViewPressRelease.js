/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from 'react';
import { Linking } from 'react-native';

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Platform,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Video from 'react-native-video';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { BASE_URL, CLOUD_FRONT_URL } from '@env';
import CommentBox from '../comments/Comments';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';

const ViewPressRelease = ({ route, navigation }) => {
  const { id } = route.params;
  const [press, setPress] = useState(null);
  const [media, setMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [PressReleaseList, setPressReleaseList] = useState([]);
  const fetchPressRelease = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await axios.get(`${BASE_URL}/api/press-release/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPress(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load Press Release Note');
    }
  };

  const fetchMedia = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await axios.get(`${BASE_URL}/api/press-media/press/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedia(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load media');
    }
  };

  useEffect(() => {
    fetchPressRelease();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMedia();
    }, [id]),
  );

  const selectFile = () => {
    if (media.length >= 4) {
      Alert.alert(
        'Limit Reached',
        'You can upload only 4 files per press release.',
      );
      return;
    }

    launchImageLibrary({ mediaType: 'mixed', selectionLimit: 1 }, response => {
      if (response.didCancel) return;
      const asset = response.assets?.[0];
      if (!asset) return Alert.alert('Error', 'No file selected');
      setSelectedFile(asset);
    });
  };

  const uploadFile = async () => {
    if (!selectedFile) return Alert.alert('No file selected');

    if (media.length >= 4) {
      Alert.alert(
        'Limit Reached',
        'You can upload only 4 files per press release.',
      );
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
      await axios.post(`${BASE_URL}/api/press-media/upload/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSelectedFile(null);
      await fetchMedia();
    } catch (err) {
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
            await axios.delete(`${BASE_URL}/api/press-media/${mediaId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchMedia();
          } catch (err) {
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
  const sharePressRelease = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/press-release/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data) {
        Alert.alert('No Press Release to share');
        return;
      }

      setPressReleaseList([res.data]);

      setTimeout(() => {
        setShareModalVisible(true);
      }, 100);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to fetch Press Release');
    }
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="chevron-back-sharp" color="#000" size={30} />
              </TouchableOpacity>

              <Text style={styles.heading} numberOfLines={1}>
                {press.title}
              </Text>
            </View>

            <TouchableOpacity onPress={sharePressRelease}>
              <Icon name="share-social" size={28} color="#000" />
            </TouchableOpacity>
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
          <Modal
            visible={shareModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShareModalVisible(false)}
          >
            <View style={styles.shareModalContainer}>
              <View style={styles.shareModalBox}>
                <Text style={styles.shareTitle}>Share Events</Text>

                <ScrollView style={{ maxHeight: 300 }}>
                  {PressReleaseList.map((e, i) => {
                    return (
                      <Text key={i} style={styles.pressItem}>
                        {i + 1}. {e.title} -{' '}
                        {moment(e.created_at).format('DD MMM YYYY')}
                      </Text>
                    );
                  })}
                </ScrollView>
                <View style={styles.iconRow}>
                  <TouchableOpacity
                    onPress={() => {
                      const msg = `Title: ${press.title}
Notes: ${press.notes}`;
                      const url = `whatsapp://send?text=${encodeURIComponent(
                        msg,
                      )}`;

                      Linking.canOpenURL(url)
                        .then(supported => {
                          if (supported) {
                            Linking.openURL(url);
                          } else {
                            Linking.openURL(
                              `https://wa.me/?text=${encodeURIComponent(msg)}`,
                            );
                          }
                        })
                        .catch(() =>
                          Alert.alert('Error', 'Unable to open WhatsApp'),
                        );
                    }}
                  >
                    <Icon name="logo-whatsapp" size={30} color="#25D366" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      const msg = `Title: ${press.title}\nNotes: ${press.notes}`;
                      const appUrl = `twitter://post?message=${encodeURIComponent(
                        msg,
                      )}`;
                      const webUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        msg,
                      )}`;

                      Linking.canOpenURL(appUrl)
                        .then(supported => {
                          if (supported) {
                            Linking.openURL(appUrl);
                          } else {
                            Linking.openURL(webUrl);
                          }
                        })
                        .catch(() =>
                          Alert.alert('Error', 'Unable to open Twitter'),
                        );
                    }}
                  >
                    <Icon name="logo-twitter" size={30} color="#1DA1F2" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      const subject = `Press Release: ${press.title}`;
                      const body = `Title: ${press.title}\nNotes: ${press.notes}`;

                      const gmailUrl = `googlegmail:///co?subject=${encodeURIComponent(
                        subject,
                      )}&body=${encodeURIComponent(body)}`;

                      Linking.canOpenURL(gmailUrl)
                        .then(supported => {
                          if (supported) {
                            Linking.openURL(gmailUrl);
                          } else {
                            const mailUrl = `mailto:?subject=${encodeURIComponent(
                              subject,
                            )}&body=${encodeURIComponent(body)}`;
                            Linking.openURL(mailUrl);
                          }
                        })
                        .catch(() =>
                          Alert.alert('Error', 'Unable to open Gmail'),
                        );
                    }}
                  >
                    <Icon name="mail-outline" size={30} color="#FF5722" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      const msg = `Title: ${press.title}
Notes: ${press.notes}`;

                      const appUrl = `tg://msg?text=${encodeURIComponent(msg)}`;
                      const webUrl = `https://t.me/share/url?text=${encodeURIComponent(
                        msg,
                      )}`;

                      Linking.canOpenURL(appUrl)
                        .then(supported => {
                          if (supported) {
                            Linking.openURL(appUrl);
                          } else {
                            Linking.openURL(webUrl);
                          }
                        })
                        .catch(() =>
                          Alert.alert('Error', 'Unable to open Telegram'),
                        );
                    }}
                  >
                    <MaterialIcons name="telegram" size={30} color="#0088cc" />
                  </TouchableOpacity>
                </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginLeft: 5, // small gap from back icon
    maxWidth: 200, // prevent pushing icon out
  },

  shareModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  shareModalBox: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },

  pressItem: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },

  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
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

  CommentBox: { margin: 20, padding: 20, backgroundColor: '#fff' },
});

export default ViewPressRelease;
