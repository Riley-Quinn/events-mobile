import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
const Header = ({ title }) => {
  const [rightMenuVisible, setRightMenuVisible] = useState(false);
  const [leftMenuVisible, setLeftMenuVisible] = useState(false);

  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    if (leftMenuVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftMenuVisible]);

  return (
    <View>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => setLeftMenuVisible(true)}
          style={styles.leftIcon}
        >
          <Icon name="menu" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {/* Left Menu Modal */}
      <Modal
        transparent
        visible={leftMenuVisible}
        animationType="none"
        onRequestClose={() => setLeftMenuVisible(false)}
      >
        <Pressable
          style={styles.fullScreenOverlay}
          onPress={() => setLeftMenuVisible(false)}
        >
          <Animated.View
            style={[styles.drawerMenuContainer, { left: slideAnim }]}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/Vivekananda1.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.separator} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { label: 'Calendar', icon: 'tools', route: 'DayView' },
                { label: 'Profile', icon: 'factory', route: 'Profile' },
                {
                  label: 'Change Password',
                  icon: 'view-dashboard',
                  route: 'PasswordChange',
                },
                {
                  label: 'Gallery',
                  icon: 'account-cog',
                  route: 'Gallery',
                },
                {
                  label: 'Tasks',
                  icon: 'calendar-clock',
                  route: 'TaskList',
                },
                {
                  label: 'Events',
                  icon: 'robot-industrial',
                  route: 'EventsList',
                },
                {
                  label: 'Press Release',
                  icon: 'clipboard-check',
                  route: 'PressReleaseList',
                },
                {
                  label: 'Logout',
                  icon: 'file-document-edit',
                  route: 'LoginScreen',
                  onPress: () => {
                    // Add logout logic here
                  },
                },
              ].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItemRow}
                  onPress={() => {
                    setLeftMenuVisible(false); // Close the drawer
                    navigation.navigate(item.route); // Navigate to the screen
                  }}
                >
                  <MCIcon
                    name={item.icon}
                    size={20}
                    color="#fca103"
                    style={styles.menuIcon}
                  />
                  <Text style={styles.menuItem}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FF7F2A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 30,
    alignSelf: 'center',
  },
  leftIcon: {
    position: 'absolute',
    left: 20,
  },
  rightIcon: {
    position: 'absolute',
    right: 20,
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 1,
  },
  drawerMenuContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '70%',
    backgroundColor: '#FF7F2A',
    padding: 20,
    elevation: 5,
    justifyContent: 'flex-start',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingRight: 20,
  },
  menuContainerLeft: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    elevation: 5,
  },
  menuItem: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuIcon: {
    marginRight: 10,
  },
  icon: {
    marginRight: 10,
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },

  dropdownText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 60,
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#fca103',
    width: '100%',
    marginBottom: 10,
  },
});
