/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios'; // replace with your `authAxios` if needed
import EmojiSelector from 'react-native-emoji-selector';
import { format } from 'timeago.js';
// import Icon from 'react-native-vector-icons/MaterialIcons';
import { Avatar } from 'react-native-elements';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
const CommentBox = ({ module, moduleId }) => {
  const [comment, setComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [comments, setComments] = useState([]);

  const fetchAllComments = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const response = await axios.get(`${BASE_URL}/api/comments/${moduleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          module: module,
        },
      });

      setComments(response.data.list);
    } catch (error) {
      console.error('Error fetching comments', error);
    }
  };
  const handleSubmit = async () => {
    if (comment.trim() !== '') {
      try {
        const token = await AsyncStorage.getItem('token');

        await axios.post(
          `${BASE_URL}/api/comments`,
          {
            comment: comment,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              module: module,
              moduleId: moduleId,
            },
          },
        );

        setComment('');
        setShowEmojiPicker(false);
        fetchAllComments();
      } catch (error) {
        console.error('Error posting comment', error.response?.data || error);
      }
    }
  };

  const handleEmojiSelect = emoji => {
    setComment(prev => prev + emoji);
  };

  useEffect(() => {
    fetchAllComments();
  }, []);
  const convertToISO = dateString => {
    // Convert "2025-07-25 14:19:02" → "2025-07-25T14:19:02Z"
    return dateString.replace(' ', 'T') + 'Z';
  };

  const renderItem = ({ item }) => (
    <View style={styles.commentContainer}>
      <Avatar
        rounded
        size="small"
        title={item.commented_username[0]}
        containerStyle={{ backgroundColor: '#ccc', marginRight: 10 }}
      />
      <View style={{ flex: 1 }}>
        <View style={styles.commentHeader}>
          <Text style={styles.username}>{item.commented_username}</Text>
          <Text style={styles.time}>{format(item.created_at)}</Text>
        </View>
        <Text style={styles.commentText}>{item.comment}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Comments</Text>

      <FlatList
        data={comments}
        renderItem={renderItem}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ paddingBottom: 16 }}
        style={styles.commentList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Write your comment..."
          value={comment}
          onChangeText={setComment}
          style={styles.input}
          multiline
        />
        <View style={styles.actions}>
          {/* <TouchableOpacity onPress={() => setShowEmojiPicker(prev => !prev)}>
            <Icon name="emoji-emotions" size={24} color="#333" />
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.postButton} onPress={handleSubmit}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showEmojiPicker && (
        <EmojiSelector
          onEmojiSelected={handleEmojiSelect}
          showSearchBar={false}
          showSectionTitles={false}
          category={EmojiSelector.categories.all}
          columns={8}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default CommentBox;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  commentList: {
    flex: 1,
    marginBottom: 12,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  username: {
    color: '#000',
    fontStyle: 'italic',
    fontSize: 12,
  },
  time: {
    color: '#000',
    fontStyle: 'italic',
    fontSize: 12,
  },
  commentText: {
    marginTop: 2,
    fontSize: 16,
    color: '#000',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 8,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  actions: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    marginTop: 6,
    // alignItems: 'center',
    alignItems: 'flex-end',
  },
  postButton: {
    backgroundColor: '#ff883a',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
