import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const Profile = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.topOrange} />

      <View style={styles.circleWrapper}>
        <View style={styles.circle}>
          <Image
            source={require('../../assets/Profile.png')}
            style={styles.image}
          />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          A Passionate healthcare Professional and social Worker who Played in a
          Key role in serving rural communities during the COVID-19 Crisis.
          Actively engaged in Spiritual education, youth empowerment, and
          political service with a focus on national development.
        </Text>
        <Text style={styles.heading}>Public Skills</Text>

        <View style={styles.pointItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.pointText}>Strong public Speaker</Text>
        </View>

        <View style={styles.pointItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.pointText}>Effective conflict resolution</Text>
        </View>

        <View style={styles.pointItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.pointText}>
            In-depth understanding of local issues
          </Text>
        </View>

        <View style={styles.pointItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.pointText}>
            Proficient in Networking and alliance building
          </Text>
        </View>

        <Text style={styles.heading}>Political Skills</Text>

        <View style={styles.pointItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.pointText}>Opposition Research</Text>
        </View>

        <View style={styles.pointItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.pointText}>Policy Preparation</Text>
        </View>

        <View style={styles.pointItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.pointText}>Election Manifesto Creation</Text>
        </View>

        <View style={styles.pointItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.pointText}>Electronic Media Campaign</Text>
        </View>

        <View style={styles.pointItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.pointText}>Political Data Analysis</Text>
        </View>

        <View style={styles.imageRow}>
          <Image
            source={require('../../assets/1.png')}
            style={styles.gridImage}
          />
          <Image
            source={require('../../assets/2.png')}
            style={styles.gridImage}
          />
        </View>
        <View style={styles.imageRow}>
          <Image
            source={require('../../assets/3.png')}
            style={styles.gridImage}
          />
          <Image
            source={require('../../assets/4.png')}
            style={styles.gridImage}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const CIRCLE_SIZE = 150;

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    position: 'relative',
  },
  circleHalfTop: {
    flex: 1,
    overflow: 'hidden',
  },

  topOrange: {
    height: height * 0.2,
    backgroundColor: '#F57921',
  },
  circleWrapper: {
    position: 'absolute',
    top: height * 0.2 - CIRCLE_SIZE / 2,
    left: width / 2 - CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  circleHalf: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    marginTop: CIRCLE_SIZE / 2 - 10,
    padding: 20,
  },

  description: {
    fontSize: 16,
    color: '#5C5C5C',
    fontWeight: 'bold',
    lineHeight: 20,
    textAlign: 'justify',

    marginBottom: 10,
    paddingHorizontal: 16,
  },

  bullet: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 2,
    marginRight: 8,
  },

  pointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 5,
    // marginBottom: 6,
    marginHorizontal: 40,
  },

  pointText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5C5C5C',
  },

  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#C56B06',
    marginHorizontal: 30,
  },

  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  gridImage: {
    width: (width - 60) / 2,
    height: 120,
    borderRadius: 8,
  },
});

export default Profile;
