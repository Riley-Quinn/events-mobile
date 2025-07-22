import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
const AddEvents = () => {
  const navigation = useNavigation();
  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.details}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="chevron-back-sharp" color="#000" size={30} />
            </TouchableOpacity>

            <Text style={styles.heading}>Add Event</Text>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor="#000"
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Description"
            placeholderTextColor="#000"
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Start Date"
            placeholderTextColor="#000"
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Location"
            placeholderTextColor="#000"
          />
        </View>

        <TouchableOpacity style={styles.addButtonOutlined}>
          <Text style={styles.addOutlinedText}> + Add Media</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButtonFilled}>
          <Text style={styles.addButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#ffeee6',
  },
  header: {
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: '#ff883a',
    paddingVertical: 60,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    zIndex: 99,
  },
  details: {
    display: 'flex',
    flexDirection: 'row',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 5,
    marginLeft: 20,
    color: '#000',
  },
  inputContainer: {
    borderColor: '#FF8008',
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 15,
    marginBottom: 20,
    width: '90%',
    height: 60,
    marginTop: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 7,
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  addButtonFilled: {
    backgroundColor: '#ff883a',
    paddingVertical: 20,
    borderRadius: 30,
    marginTop: 60,
    marginBottom: 8,
    width: '90%',
    alignItems: 'center',
  },
  addButtonOutlined: {
    paddingVertical: 20,
    borderRadius: 30,
    marginTop: 10,
    width: '90%',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
  },
  addOutlinedText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#ff883a',
  },
  backButton: {
    marginTop: 10,
  },
});

export default AddEvents;
