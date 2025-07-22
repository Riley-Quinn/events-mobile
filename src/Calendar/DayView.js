import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';

const timeSlots = Array.from(
  { length: 24 },
  (_, i) => `${i % 12 || 12} ${i < 12 ? 'AM' : 'PM'}`,
);

const staticData = {
  birthdays: [
    { id: '1', title: "John's Birthday", time: '10', date: '2025-07-21' },
  ],
  events: [
    { id: '2', title: 'Team Meeting', time: '11', date: '2025-07-21' },
    { id: '3', title: 'Lunch with Alex', time: '13', date: '2025-07-21' },
  ],
  notes: [{ id: '4', title: 'Call plumber', time: '16', date: '2025-07-21' }],
  tasks: [{ id: '5', title: 'Submit Report', time: '9', date: '2025-07-21' }],
};

const COLORS = {
  birthdays: '#FF6B81', // Soft Coral Pink
  events: '#1ABC9C', // Elegant Teal
  notes: '#F8C471', // Warm Amber
  tasks: '#5DADE2', // Soft Blue
};

const DayView = () => {
  const [selectedTab, setSelectedTab] = useState(null);
  const [tabTouched, setTabTouched] = useState(false);
  const navigation = useNavigation();
  const selectedDate = '2025-07-21';

  const getFilteredItems = () => {
    return Object.entries(staticData).flatMap(([category, items]) =>
      items
        .filter(
          item =>
            item.date === selectedDate &&
            (!selectedTab || selectedTab === category),
        )
        .map(item => ({ ...item, category })),
    );
  };

  const renderTabs = () => {
    const tabs = tabTouched
      ? ['all', 'birthdays', 'events', 'notes', 'tasks']
      : ['birthdays', 'events', 'notes', 'tasks'];

    return (
      <View style={styles.tabContainer}>
        {tabs.map(tab => {
          const isActive =
            (selectedTab === null && tab === 'all') || selectedTab === tab;

          return (
            <TouchableOpacity
              key={tab}
              onPress={() => {
                setTabTouched(true);
                setSelectedTab(tab === 'all' ? null : tab);
              }}
              style={[styles.tab, isActive && styles.activeTab]}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.toUpperCase()}
              </Text>
              {isActive && <View style={styles.underline} />}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderDayTimeline = () => {
    const items = getFilteredItems();

    return timeSlots.map((slot, index) => {
      const hour = index;
      // eslint-disable-next-line radix
      const slotItems = items.filter(i => parseInt(i.time) === hour);

      return (
        <View key={index} style={styles.slotRow}>
          <Text style={styles.timeLabel}>{slot}</Text>
          <View style={styles.verticalLine} />
          <View style={styles.slotContent}>
            {slotItems.map(item => (
              <View
                key={item.id}
                style={[
                  styles.eventBox,
                  { backgroundColor: COLORS[item.category] },
                ]}
              >
                <Text style={styles.eventText}>{item.title}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => navigation.navigate('MonthView')}>
          <Text style={styles.topNavText}>Month</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('WeekView')}>
          <Text style={styles.topNavText}>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('DayView')}>
          <Text style={styles.topNavText}>Day</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('MonthView', { selectedDate })}
        >
          <Text style={styles.dateText}>
            {moment(selectedDate).format('dddd, MMMM D')}
          </Text>
        </TouchableOpacity>

        {renderTabs()}
      </View>

      <ScrollView style={styles.timelineContainer}>
        {renderDayTimeline()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    paddingTop: 30,
    paddingBottom: 10,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomColor: '#bbb',
    borderBottomWidth: 1,
  },
  dateText: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    marginTop: 40,
    backgroundColor: '#fff',
    borderBottomColor: '#fff',
    borderBottomWidth: 1,
  },
  topNavText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },

  timelineContainer: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#fdfdfd',
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#ccc',
    borderBottomWidth: 0.8,
    minHeight: 60,
  },
  timeLabel: {
    width: 60,
    color: 'black',
    fontSize: 14,
  },
  slotContent: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  eventBox: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    width: '50%',
    alignSelf: 'center',
    backgroundColor: '#f2f2f2',
  },
  eventText: {
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    borderTopColor: '#eee',
    borderTopWidth: 1,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#e0f7ef',
  },
  tabText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeTabText: {
    color: '#3EB489',
    fontWeight: 'bold',
  },
  verticalLine: {
    width: 1,
    backgroundColor: '#bbb',
    height: '100%',
    marginHorizontal: 10,
  },
  underline: {
    marginTop: 4,
    height: 2,
    width: '100%',
    backgroundColor: '#3EB489',
    borderRadius: 1,
  },
});

export default DayView;
