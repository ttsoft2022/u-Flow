/**
 * uFlow App
 * Production flow monitoring dashboard
 * Ported from Android to React Native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppProvider} from './src/contexts/AppContext';
import {AuthProvider} from './src/contexts/AuthContext';
import {Colors} from './src/constants/colors';
import * as DatabaseService from './src/services/databaseService';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Root App Component
 * Sets up providers and initializes app
 */
function App() {
  // Initialize default databases on app start
  useEffect(() => {
    initializeApp();
  }, []);

  /**
   * Initialize app
   * Load default databases into storage
   */
  const initializeApp = async () => {
    try {
      await DatabaseService.initializeDefaultDatabases();
      console.log('App initialized successfully');
    } catch (error) {
      console.error('App initialization error:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <AppProvider>
        <AuthProvider>
          {/* Dark theme status bar */}
          <StatusBar
            barStyle="light-content"
            backgroundColor={Colors.background}
          />

          {/* Main app navigation */}
          <AppNavigator />
        </AuthProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

export default App;
