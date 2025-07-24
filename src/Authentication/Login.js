import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateAbility } from '../casl/ability';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { BASE_URL } from '@env';
const API_URL = `${BASE_URL}/api/auth/login`;

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginScreen = () => {
  const navigation = useNavigation();

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post(API_URL, {
        email: values.email,
        password: values.password,
      });

      const { token, permissions, user } = response.data;
      console.log('response', response?.data);
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userName', user.name);
      await AsyncStorage.setItem('userId', String(user.id));
      await AsyncStorage.setItem('roleId', String(user.role_id));
      await AsyncStorage.setItem('permissions', JSON.stringify(permissions));
      updateAbility(permissions);

      navigation.reset({
        index: 0,
        routes: [{ name: 'DashboardScreen' }],
      });
    } catch (error) {
      console.error(error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Something went wrong';

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/bgg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/Vivekananda1.png')}
            style={styles.avatar}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.welcomeText}>Welcome</Text>

          <Formik
            initialValues={{
              email: 'superadmin@example.com',
              password: 'Password123!',
            }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
            }) => (
              <>
                <View style={styles.inputContainer}>
                  <Icon
                    name="mail"
                    size={20}
                    color="#888"
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    autoCapitalize="none"
                  />
                </View>
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                <View style={styles.inputContainer}>
                  <Icon
                    name="lock"
                    size={20}
                    color="#888"
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="************"
                    placeholderTextColor="#999"
                    secureTextEntry
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                  />
                </View>
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Text style={styles.loginText}>
                    {isSubmitting ? 'Logging in...' : 'LOGIN'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'flex-start' },
  header: { marginTop: 90, alignItems: 'center' },
  avatar: { width: 200, height: 200, borderRadius: 120, marginBottom: 10 },
  card: {
    backgroundColor: '#fff',
    width: '95%',
    borderRadius: 40,
    marginTop: 50,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF8008',
    marginBottom: 30,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#FF8008',
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 15,
    marginBottom: 25,
    backgroundColor: '#fff',
    width: '100%',
    height: 60,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 7, color: '#000' },
  loginButton: {
    backgroundColor: '#ff883a',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  loginText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -15,
    marginBottom: 15,
    alignSelf: 'flex-start',
    paddingLeft: 20,
  },
});

export default LoginScreen;
