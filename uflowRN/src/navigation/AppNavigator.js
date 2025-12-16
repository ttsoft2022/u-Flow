import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {useAuth} from '../contexts/AuthContext';
import {Colors} from '../constants/colors';
import LoginScreen from '../screens/LoginScreen';
import MainScreen from '../screens/MainScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';

/**
 * App Navigator
 * Main navigation coordinator
 * Handles navigation between Login and Main screens based on auth state
 * Equivalent to Android's activity navigation
 */

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

/**
 * Main Drawer Navigator
 * Wraps MainScreen with drawer menu
 */
function MainDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: Colors.cardBackground,
          width: 280,
        },
        drawerType: 'front',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
      }}>
      <Drawer.Screen name="MainScreen" component={MainScreen} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const {isAuthenticated, isLoading} = useAuth();

  // Show nothing while checking auth state
  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Hide default header (using custom headers)
          animation: 'fade', // Smooth transition
        }}>
        {!isAuthenticated ? (
          // Not authenticated - show login screen
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          // Authenticated - show main screen with drawer
          <Stack.Screen name="Main" component={MainDrawerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
