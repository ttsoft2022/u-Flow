/**
 * uFlow App
 * Production flow monitoring dashboard
 * Ported from Android to React Native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {StatusBar, View, ActivityIndicator, StyleSheet} from 'react-native';
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
  const [isInitialized, setIsInitialized] = useState(false);

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
      await DatabaseService.ensureDatabasesInitialized();
      console.log('App initialized successfully');
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

export default App;
