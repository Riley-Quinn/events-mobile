/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import EmojiSelector from 'react-native-emoji-selector';
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
        headers: { Authorization: `Bearer ${token}` },
        params: { module },
      });
      setComments(response.data.list || []);
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
          { comment },
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { module, moduleId },
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

  const handleEmojiSelect = emoji => setComment(prev => prev + emoji);

  useEffect(() => {
    fetchAllComments();
  }, []);

  const convertToISO = dateString => {
    if (!dateString || typeof dateString !== 'string') return new Date();
    if (!dateString.includes(' ')) return new Date(dateString);

    const [datePart, timePart] = dateString.split(' ');
    if (!datePart || !timePart) return new Date();

    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);

    return new Date(year, month - 1, day, hour, minute, second);
  };

  // ✅ Custom Formatter
  const getTimeAgo = createdAt => {
    const now = new Date();
    const past = convertToISO(createdAt);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;

    const diffDays = Math.floor(diffHour / 24);
    return `${diffDays}d ago`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.commentContainer}>
      <Avatar
        rounded
        size="small"
        title={item.commented_username?.[0] || '?'}
        containerStyle={{ backgroundColor: '#ccc', marginRight: 10 }}
      />
      <View style={{ flex: 1 }}>
        <View style={styles.commentHeader}>
          <Text style={styles.username}>{item.commented_username}</Text>
          <Text style={styles.time}>{getTimeAgo(item.created_at)}</Text>
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
          placeholderTextColor="#000"
          value={comment}
          onChangeText={setComment}
          style={styles.input}
          multiline
        />

        <View style={styles.actions}>
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
    marginTop: 20,
    borderColor: '#000',
    borderWidth: 0.1,
    borderRadius: 10,
    padding: 20,
    backgroundColor: '#fff',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  commentList: {
    flex: 1,
    marginBottom: 8,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 10,
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
    fontWeight: 'bold',
    color: 'red',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 8,
  },
  input: {
    borderColor: 'black',
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 20,
    borderRadius: 10,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
