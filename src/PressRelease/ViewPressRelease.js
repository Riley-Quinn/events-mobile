/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from 'react';
import { Linking } from 'react-native';

import {
  View,
  Modal,
  FlatList,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Video from 'react-native-video';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { BASE_URL, CLOUD_FRONT_URL } from '@env';
import CommentBox from '../comments/Comments';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
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
  const [selectedImages, setSelectedImages] = useState([]);

  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [PressReleaseList, setPressReleaseList] = useState([]);
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera access to take photos and videos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };
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

  const captureFromCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Camera access is required to take photos or videos.',
      );
      return;
    }

    if (media.length >= 4) {
      Alert.alert('Limit Reached', 'You can only upload 4 images.');
      return;
    }

    launchCamera(
      { mediaType: 'mixed', videoQuality: 'high', saveToPhotos: true },
      response => {
        if (response.didCancel) return;

        const asset = response.assets?.[0];
        if (!asset) {
          Alert.alert('Error', 'No file captured');
          return;
        }

        setSelectedFile(asset);
      },
    );
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
    } catch (err) {
      console.log(err);
    }
  };

  const toggleSelectImage = item => {
    setSelectedImages(prev => {
      const alreadySelected = prev.find(img => img.key === item.key);
      if (alreadySelected) {
        return prev.filter(img => img.key !== item.key);
      } else {
        return [...prev, item];
      }
    });
  };

  const renderMedia = (item, index) => {
    const fileUrl = getFileUrl(item.url);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(item.url);

    const mediaItem = { ...item, key: item.id || index.toString() };
    const isSelected = selectedImages.some(img => img.key === mediaItem.key);

    return (
      <TouchableOpacity
        key={mediaItem.key}
        style={styles.mediaBox}
        onPress={() => toggleSelectImage(mediaItem)}
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

        {isSelected && <View style={styles.selectedDot} />}

        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={() => deleteMedia(mediaItem.id)}
        >
          <Icon name="trash" size={20} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
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
    <View style={{ flex: 1 }}>
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
              {selectedImages.length > 0 && (
                <TouchableOpacity
                  onPress={shareSelectedImages}
                  style={{ marginLeft: 105 }}
                >
                  <Icon name="images" size={28} color="#000" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={sharePressRelease}>
                <Icon name="share-social" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.container}>
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.value}>{press.notes}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Assignee</Text>
                  <Text style={styles.colon}>:</Text>
                  <Text style={styles.value}>{press.assignee_name}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.uploadBtn} onPress={selectFile}>
                <Text style={styles.uploadText}>Choose File</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.uploadBtn,
                  { backgroundColor: '#007bff', marginTop: 10 },
                ]}
                onPress={captureFromCamera}
              >
                <Text style={styles.uploadText}>Capture from Camera</Text>
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
              <View style={styles.mediaContainer}>
                {media.map(renderMedia)}
              </View>
            </View>

            <Modal
              visible={shareModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShareModalVisible(false)}
            >
              <View style={styles.shareModalContainer}>
                <View style={styles.shareModalBox}>
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      zIndex: 10,
                    }}
                    onPress={() => setShareModalVisible(false)}
                  >
                    <Icon name="close" size={28} color="#000" />
                  </TouchableOpacity>
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
                                `https://wa.me/?text=${encodeURIComponent(
                                  msg,
                                )}`,
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

                        const appUrl = `tg://msg?text=${encodeURIComponent(
                          msg,
                        )}`;
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
                      <MaterialIcons
                        name="telegram"
                        size={30}
                        color="#0088cc"
                      />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },

  selectedBorder: { borderColor: '#ff883a' },
  selectedDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff883a',
    justifyContent: 'center',
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 16,
  },
  colon: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',

    marginHorizontal: 5,
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    flexWrap: 'wrap',
  },
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
    marginLeft: 5,
    maxWidth: 200,
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

  // CommentBox: {
  //   marginTop: 10,
  //   borderColor: '#000',
  //   borderWidth: 0.1,
  //   borderRadius: 10,
  //   padding: 10,
  //   backgroundColor: '#fff',
  //   shadowOpacity: 0.25,
  //   shadowRadius: 3.84,
  //   elevation: 5,
  // },
});

export default ViewPressRelease;
