// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
//   StyleSheet,
// } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import Icon from 'react-native-vector-icons/Ionicons';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// import axios from 'axios';
// import moment from 'moment';
// import { BASE_URL } from '@env';

// const EditPressRelaese = ({ route, navigation }) => {
//   const { id } = route.params;

//   const [formData, setFormData] = useState({
//     title: '',
//     notes: '',
//     assignee_id: '',
//     status_id: '',
//   });

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showTimePicker, setShowTimePicker] = useState(false);

//   // ✅ Fetch Event Details
//   useEffect(() => {
//     const fetchPressRelease = async () => {
//       try {
//         const token = await AsyncStorage.getItem('token');

//         const [userRes, statusRes] = await Promise.all([
//           axios.get(`${BASE_URL}/api/auth/users`, {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get(`${BASE_URL}/api/tasks/status/all`, {
//             headers: { Authorization: `Bearer ${token}` },
//             params: { type: 'press_release' },
//           }),
//         ]);

//         // const press = response.data;

//         if (press) {
//           setFormData({
//             title: press.title || '',
//             notes: press.notes || '',
//             assignee_id: press.assignee_id || '',
//             status_id: press.status_id || '',
//           });
//         } else {
//           Alert.alert('Error', 'Press Note not found.');
//         }
//       } catch (error) {
//         console.error('Fetch error:', error?.response?.data || error.message);
//         Alert.alert('Error', 'Could not fetch press details.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) {
//       fetchPressRelease();
//     } else {
//       setLoading(false);
//       Alert.alert('Error', 'Missing press ID.');
//     }
//   }, [id]);

//   // ✅ Submit Updated Data
//   const handleUpdate = async () => {
//     try {
//       setSaving(true);
//       const token = await AsyncStorage.getItem('token');

//       const updatedData = {
//         ...formData,
//       };

//       await axios.put(`${BASE_URL}/api/press-release/${id}`, updatedData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       Alert.alert('Success', 'Press Release Note updated successfully!');
//       navigation.goBack();
//     } catch (error) {
//       console.error('Update error:', error?.response?.data || error.message);
//       Alert.alert('Error', 'Could not update press.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#ff883a" />
//         <Text style={{ marginTop: 10 }}>Loading press...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={{ backgroundColor: '#ffeee6', flex: 1 }}>
//       <View style={styles.header}>
//         <View style={styles.details}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Icon name="chevron-back-sharp" color="#000" size={30} />
//           </TouchableOpacity>
//           <Text style={styles.heading}>Edit Press Release</Text>
//         </View>
//       </View>

//       <ScrollView contentContainerStyle={styles.formContainer}>
//         <Text style={styles.label}>Title</Text>
//         <View style={styles.inputContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder="Title"
//             placeholderTextColor="#000"
//             value={formData.title}
//             onChangeText={text => setFormData({ ...formData, title: text })}
//           />
//         </View>
//         <Text style={styles.label}>Notes</Text>
//         <View style={[styles.inputContainer, { height: 80 }]}>
//           <TextInput
//             style={[styles.input, { height: '100%' }]}
//             placeholder="Notes"
//             placeholderTextColor="#000"
//             multiline
//             numberOfLines={5}
//             value={formData.notes}
//             onChangeText={text => setFormData({ ...formData, notes: text })}
//             textAlignVertical="top"
//           />
//         </View>
//         <Text style={styles.label}>Assignee</Text>
//         <View style={styles.inputContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder="Assignee"
//             placeholderTextColor="#000"
//             value={formData.assignee_id}
//             onChangeText={text =>
//               setFormData({ ...formData, assignee_id: text })
//             }
//           />
//         </View>
//         <Text style={styles.label}>Status</Text>
//         <View style={styles.inputContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder="Status"
//             placeholderTextColor="#000"
//             value={formData.status_id}
//             onChangeText={text => setFormData({ ...formData, status_id: text })}
//           />
//         </View>
//         <TouchableOpacity
//           style={styles.addButtonFilled}
//           onPress={handleUpdate}
//           disabled={saving}
//         >
//           <Text style={styles.addButtonText}>
//             {saving ? 'Saving...' : 'Update Event'}
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.addButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Text style={styles.addText}>Cancel</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// };

// export default EditPressRelaese;

// const styles = StyleSheet.create({
//   header: {
//     width: '100%',
//     paddingHorizontal: 20,
//     backgroundColor: '#ff883a',
//     paddingVertical: 60,
//     borderBottomLeftRadius: 50,
//     borderBottomRightRadius: 50,
//   },

//   details: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   heading: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     marginTop: 5,
//     marginLeft: 20,
//     color: '#000',
//   },
//   backButton: {
//     marginTop: 10,
//   },
//   formContainer: {
//     padding: 20,
//     alignItems: 'center',
//     paddingBottom: 100,
//   },
//   inputContainer: {
//     borderColor: '#FF8008',
//     borderWidth: 1,
//     borderRadius: 30,
//     paddingHorizontal: 15,
//     marginBottom: 20,
//     width: '90%',
//     height: 60,
//     justifyContent: 'center',
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#000',
//     alignSelf: 'flex-start',
//     marginHorizontal: 40,
//     marginBottom: 3,
//   },

//   input: {
//     fontSize: 16,
//     color: '#000',
//     marginLeft: 20,
//   },
//   addButtonFilled: {
//     backgroundColor: '#ff883a',
//     paddingVertical: 12,
//     borderRadius: 30,
//     marginBottom: 10,
//     marginTop: 40,
//     width: '90%',
//     alignItems: 'center',
//   },
//   addButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 22,
//   },
//   addButton: {
//     borderColor: '#FF7F2A',
//     paddingVertical: 12,
//     borderRadius: 30,
//     marginBottom: 8,
//     width: '90%',
//     borderWidth: 2,
//     marginTop: 10,

//     alignItems: 'center',
//   },
//   addText: {
//     color: '#000',
//     fontSize: 22,
//     fontWeight: 'bold',
//   },
// });
