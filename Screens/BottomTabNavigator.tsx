import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenHome from './ScreenHome';
import ScreenTransactions from './ScreenTransactions';
import ScreenReports from './ScreenReports';
import ScreenSettings from './ScreenSettings';
import ScreenAdd from './ScreenAdd';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: styles.tabBarStyle,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Transactions':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Reports':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return (
            <Ionicons name={iconName} size={focused ? 28 : 24} color={color} />
          );
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={ScreenHome} />
      <Tab.Screen name="Transactions" component={ScreenTransactions} />

      <Tab.Screen
        name="Add"
        component={ScreenAdd}
        options={{
          tabBarButton: (props: any) => (
            <TouchableOpacity
              {...props}
              style={styles.fabButton}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen name="Reports" component={ScreenReports} />
      <Tab.Screen name="Profile" component={ScreenSettings} />
      
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 55,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
    position: 'absolute',
    paddingBottom: Platform.OS === 'android' ? 5 : 20,
  },
  fabButton: {
    top: -25,
    justifyContent: 'center',
    alignItems: 'center',
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: 'green',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    left: 10,
    elevation: 10,
  },
});
