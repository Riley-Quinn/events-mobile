import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { BASE_URL } from '@env';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { SafeAreaView } from 'react-native-safe-area-context';

const validationSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must be at least 8 chars with uppercase, lowercase, number & special character',
    )
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

const PasswordChange = ({ navigation }) => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = async values => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Session expired. Please log in again.');
        return;
      }

      const res = await axios.put(
        `${BASE_URL}/api/auth/change-password`,
        {
          oldPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.status === 200) {
        Alert.alert(
          'Success',
          res.data.message || 'Password updated successfully',
        );
      }
    } catch (err) {
      console.error(
        'Change Password Error:',
        err.response?.data || err.message,
      );
      Alert.alert(
        'Error',
        err.response?.data?.message ||
          'Something went wrong. Please try again.',
      );
    }
  };

  return (
    <>
      <SafeAreaView style={{ backgroundColor: '#FF7F2A', padding: 0 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.container}>
        <Formik
          initialValues={{
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSave}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <>
              <View style={styles.inputContainer}>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Current Password"
                    placeholderTextColor="#000"
                    secureTextEntry={!showCurrent}
                    value={values.currentPassword}
                    onChangeText={handleChange('currentPassword')}
                    onBlur={handleBlur('currentPassword')}
                  />
                  <TouchableOpacity
                    style={styles.eyeIconRight}
                    onPress={() => setShowCurrent(!showCurrent)}
                  >
                    <Ionicons
                      name={showCurrent ? 'eye' : 'eye-off'}
                      size={22}
                      color="#000"
                    />
                  </TouchableOpacity>
                </View>
                {touched.currentPassword && errors.currentPassword && (
                  <Text style={styles.errorText}>{errors.currentPassword}</Text>
                )}

                <View style={{ position: 'relative' }}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter New Password"
                    placeholderTextColor="#000"
                    secureTextEntry={!showNew}
                    value={values.newPassword}
                    onChangeText={handleChange('newPassword')}
                    onBlur={handleBlur('newPassword')}
                  />
                  <TouchableOpacity
                    style={styles.eyeIconRight}
                    onPress={() => setShowNew(!showNew)}
                  >
                    <Ionicons
                      name={showNew ? 'eye' : 'eye-off'}
                      size={22}
                      color="#000"
                    />
                  </TouchableOpacity>
                </View>
                {touched.newPassword && errors.newPassword && (
                  <Text style={styles.errorText}>{errors.newPassword}</Text>
                )}

                <View style={{ position: 'relative' }}>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm New Password"
                    placeholderTextColor="#000"
                    secureTextEntry={!showConfirm}
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                  />
                  <TouchableOpacity
                    style={styles.eyeIconRight}
                    onPress={() => setShowConfirm(!showConfirm)}
                  >
                    <Ionicons
                      name={showConfirm ? 'eye' : 'eye-off'}
                      size={22}
                      color="#000"
                    />
                  </TouchableOpacity>
                </View>
                {touched.confirmPassword && errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSubmit}
              >
                <Text style={styles.saveButtonText}> Update</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffeee6',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  inputContainer: {
    width: '100%',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 30,
    marginHorizontal: 20,
  },

  eyeIcon: {
    position: 'absolute',
    right: 15,
  },

  saveButton: {
    backgroundColor: '#FF7F2A',
    width: '100%',
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 30,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },

  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 20,
    marginLeft: 5,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7F2A',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 15,
  },

  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  labelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
    marginLeft: 10,
  },
  input: {
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 45,
    borderWidth: 0.5,
    borderColor: '#000',
  },
  eyeIconRight: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
});

export default PasswordChange;
