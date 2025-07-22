/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HOURS = Array.from(
  { length: 24 },
  (_, i) => `${i % 12 === 0 ? 12 : i % 12} ${i < 12 ? 'AM' : 'PM'}`,
);
const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const staticData = {
  birthdays: [
    { id: '1', title: "John's Birthday", time: '10', date: '2025-07-21' },
  ],
  events: [
    { id: '2', title: 'Team Meeting', time: '11', date: '2025-07-21' },
    { id: '3', title: 'Lunch with Alex', time: '13', date: '2025-07-23' },
  ],
  notes: [{ id: '4', title: 'Call plumber', time: '16', date: '2025-07-24' }],
  tasks: [{ id: '5', title: 'Submit Report', time: '9', date: '2025-07-25' }],
};

const COLORS = {
  birthdays: '#FF6B81',
  events: '#1ABC9C',
  notes: '#F8C471',
  tasks: '#5DADE2',
};

const WeekView = () => {
  const baseDate = new Date('2025-07-21');
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    return date;
  });

  const allItems = Object.entries(staticData).flatMap(([category, items]) =>
    items.map(item => ({ ...item, category })),
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.weekHeader}>
        {WEEK_DAYS.map((day, index) => (
          <View key={index} style={styles.dayContainer}>
            <Text style={styles.dayText}>{day}</Text>
            <Text style={styles.dateText}>{daysOfWeek[index].getDate()}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {HOURS.map((hour, i) => (
          <View key={i} style={styles.timeRow}>
            <Text style={styles.timeLabel}>{hour}</Text>
            <View style={styles.gridLine} />
          </View>
        ))}

        {allItems.map(item => {
          const itemDate = new Date(item.date);
          const dayIndex = itemDate.getDay();
          const baseDay = baseDate.getDay();
          const relativeDay = dayIndex >= baseDay ? dayIndex - baseDay : 0;

          // eslint-disable-next-line radix
          const top = parseInt(item.time) * 60;
          const left = (SCREEN_WIDTH / 7) * relativeDay + 50;
          return (
            <View
              key={item.id}
              style={{
                position: 'absolute',
                top,
                left,
                zIndex: 10,
                backgroundColor: COLORS[item.category] || 'gray',
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold',
                  flexShrink: 1,
                }}
              >
                {item.title}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingTop: 30,
    paddingLeft: 50,
  },
  weekHeader: {
    flexDirection: 'row',
    borderBottomColor: '#bbb',
    borderBottomWidth: 1,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dayText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dateText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 20,
  },
  activeDay: {
    color: 'black',
    fontWeight: 'bold',
  },
  activeDate: {
    backgroundColor: '#3EB489',
    borderRadius: 12,
    color: 'white',
    paddingHorizontal: 6,
  },
  grid: {
    paddingBottom: 400,
  },
  timeRow: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLabel: {
    color: 'black',
    width: 50,
    fontSize: 12,
    position: 'absolute',
    left: -40,
  },
  gridLine: {
    height: 1,
    backgroundColor: '#bbb',
    flex: 1,
  },

  eventLine: {
    position: 'absolute',
    height: 2,
    width: 50,
    top: 4,
    left: 8,
  },
});

export default WeekView;
