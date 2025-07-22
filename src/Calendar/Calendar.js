import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import IonIcon from 'react-native-vector-icons/Ionicons';

const { height } = Dimensions.get('window');

const CalendarScreen = () => {
  const navigation = useNavigation();
  return (
    <ScrollView>
      <ImageBackground
        source={require('../../assets/bgg.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <View style={styles.details}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <IonIcon name="chevron-back-sharp" color="#000" size={30} />
            </TouchableOpacity>

            <Text style={styles.heading}>Events Calendar</Text>
          </View>
        </View>
        <View style={styles.reminder}>
          <Icon
            name="plus"
            size={50}
            color="#FF7F2A"
            style={styles.reminderIcon}
          />
          <View>
            <Text style={styles.reminderSubText}>Add Events</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Calendar
            style={styles.calendar}
            theme={{
              backgroundColor: '#ffeee6',
              calendarBackground: '#ffeee6',
              textSectionTitleColor: '#000', // Weekday title color
              textSectionTitleDisabledColor: '#ccc',
              dayTextColor: '#000',
              todayTextColor: '#ff883a',
              selectedDayBackgroundColor: '#ff883a',
              selectedDayTextColor: '#fff',
              monthTextColor: '#000',
              arrowColor: '#ff883a',
              textMonthFontWeight: 'bold',
              textMonthFontSize: 20,
              textDayHeaderFontWeight: 'bold',
              textDayHeaderFontSize: 14,
            }}
            onDayPress={day => {
              console.log('Selected day', day);
            }}
          />
        </View>
        <Text style={styles.today}>Today</Text>
        <Text style={styles.datetext}>July 12, 2025</Text>
        <View style={styles.separator} />
        <View>
          <View style={styles.eventcards}>
            <View style={styles.leftContent}>
              <Text style={styles.eventDetails1}>Party President Meeting</Text>
              <Text style={styles.eventDetails}>
                Date & Time: 12 July 2025, 11:00 AM
              </Text>
              <Text style={styles.eventDetails}>
                Location: BJP office, Hyderabad
              </Text>
              <TouchableOpacity style={styles.Button}>
                <Text style={styles.ButtonText}>Details</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.eventcards}>
            <View style={styles.leftContent}>
              <Text style={styles.eventDetails1}>Karyakarta Meet</Text>
              <Text style={styles.eventDetails}>
                Date & Time: 13 July 2025, 2:00 PM
              </Text>
              <Text style={styles.eventDetails}>
                Location: Convention Center, Hyderabad
              </Text>
              <TouchableOpacity style={styles.Button}>
                <Text style={styles.ButtonText}>Details</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rightIcon}>
              <Icon name="image-multiple-outline" size={60} color="#000" />
            </View>
          </View>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  header: {
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: '#ff883a',
    paddingVertical: 80,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    zIndex: 99,
  },
  menuIcon: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  details: {
    display: 'flex',
    flexDirection: 'row',
  },
  backButton: {
    marginTop: 10,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 5,
    marginLeft: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  reminder: {
    backgroundColor: '#fff',
    width: '88%',
    borderRadius: 60,
    marginTop: -40,
    height: 60,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 9999,
  },
  reminderIcon: {
    padding: 10,
  },
  reminderSubText: {
    fontSize: 22,
    color: '#FF7F2A',
    marginTop: 4,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#ffeee6',
    width: '95%',
    borderRadius: 20,
    marginTop: -80,
    height: height * 0.5,
    justifyContent: 'center',
    alignSelf: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    padding: 10,
  },
  calendar: {
    borderRadius: 20,
    width: '100%',
    alignSelf: 'stretch',
    marginTop: 20,
  },
  today: {
    fontSize: 16,
    marginTop: 20,
    marginLeft: 30,
  },
  datetext: {
    fontSize: 20,
    marginLeft: 30,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#000',
    width: '90%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  eventcards: {
    backgroundColor: '#ffeee6',
    width: '90%',
    borderRadius: 20,
    marginTop: 10,
    minHeight: height * 0.14,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    alignSelf: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  leftContent: {
    flex: 3,
    justifyContent: 'center',
  },
  rightIcon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDetails: {
    marginVertical: 2,
    fontSize: 14,
    fontWeight: 'bold',
  },
  eventDetails1: {
    marginBottom: 4,
    fontWeight: 'bold',
    fontSize: 16,
    fontStyle: 'italic',
  },
  Button: {
    backgroundColor: '#ff883a',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  ButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CalendarScreen;
