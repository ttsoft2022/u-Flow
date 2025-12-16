import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useApp} from '../contexts/AppContext';
import {useAuth} from '../contexts/AuthContext';
import * as DatabaseService from '../services/databaseService';
import {Colors} from '../constants/colors';
import {Strings} from '../constants/strings';
import {TEST_USERNAME, TEST_DB_CONFIG, TEST_DEPARTMENT_LIST} from '../constants/testCredentials';
import UserIcon from '../components/icons/UserIcon';
import PasswordIcon from '../components/icons/PasswordIcon';
import DatabaseIcon from '../components/icons/DatabaseIcon';

/**
 * Login Screen
 * User authentication and database selection
 * Equivalent to LoginActivity.java
 *
 * Features:
 * - Database selection dropdown
 * - Username/password input
 * - Remember Me checkbox
 * - Auto-login if credentials saved
 * - Test mode (username = "myapp")
 */

export default function LoginScreen() {
  const {setUser, setDatabaseConfig, setDepartments} = useApp();
  const {performLogin, getSavedCredentials, setIsAuthenticated} = useAuth();

  // Form state
  const [databases, setDatabases] = useState([]);
  const [selectedDbIndex, setSelectedDbIndex] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load databases and saved credentials on mount
  useEffect(() => {
    loadDatabases();
    loadSavedCredentials();
  }, []);

  /**
   * Load database list from storage
   */
  const loadDatabases = async () => {
    try {
      const dbList = await DatabaseService.getVisibleDatabases();
      setDatabases(dbList);
    } catch (error) {
      console.error('Load databases error:', error);
      Alert.alert(Strings.dialogHeaderWarning, 'Failed to load databases');
    }
  };

  /**
   * Load saved credentials (Remember Me)
   */
  const loadSavedCredentials = async () => {
    try {
      const saved = await getSavedCredentials();
      if (saved) {
        setUsername(saved.username);
        setPassword(saved.password);

        // Find matching database
        const dbList = await DatabaseService.getVisibleDatabases();
        const dbIndex = dbList.findIndex(
          db => db.serverIP === saved.serverIP && db.dbName === saved.dbConfig.dbName
        );
        if (dbIndex !== -1) {
          setSelectedDbIndex(dbIndex);
        }
      }
    } catch (error) {
      console.error('Load saved credentials error:', error);
    }
  };

  /**
   * Handle login button press
   */
  const handleLogin = async () => {
    // Validation
    if (!username.trim()) {
      Alert.alert(Strings.dialogHeaderWarning, Strings.errorFieldRequired);
      return;
    }

    if (databases.length === 0) {
      Alert.alert(Strings.dialogHeaderWarning, 'No databases available');
      return;
    }

    setIsLoading(true);

    try {
      // Get selected database config
      const selectedDb = databases[selectedDbIndex];

      // Test mode - username = "myapp"
      // See LoginActivity.java line 297-310
      if (username.toLowerCase() === 'myapp') {
        console.log('[LoginScreen] Test mode activated');
        // Use test credentials (same as Android Constants)
        setUser(TEST_USERNAME);
        setDatabaseConfig(TEST_DB_CONFIG);
        setDepartments(TEST_DEPARTMENT_LIST);
        // Set authenticated to navigate to main screen
        setIsAuthenticated(true);
        return;
      }

      // Normal login flow
      // See LoginActivity.java UserLoginTask and wsLogin()
      console.log('[LoginScreen] Starting normal login flow');
      console.log('[LoginScreen] Selected DB:', selectedDb?.dbAlias);
      console.log('[LoginScreen] Server:', selectedDb?.serverIP);

      const dbConfig = {
        dbIP: selectedDb.dbIP,
        dbName: selectedDb.dbName,
        dbUsername: selectedDb.dbUsername,
        dbPassword: selectedDb.dbPassword,
      };

      // Perform login (always remember credentials)
      const result = await performLogin(
        selectedDb.serverIP,
        selectedDb.apiName,
        username,
        password,
        dbConfig,
        true, // Always remember credentials
        departments => {
          console.log('[LoginScreen] Login success callback, departments:', departments?.length);
          // Login success callback
          // Set user info in AppContext
          setUser(username);

          // Set database config in AppContext
          setDatabaseConfig({
            dbName: selectedDb.dbName,
            dbAlias: selectedDb.dbAlias,
            dbIP: selectedDb.dbIP,
            dbUsername: selectedDb.dbUsername,
            dbPassword: selectedDb.dbPassword,
            serverIP: selectedDb.serverIP,
            apiName: selectedDb.apiName,
          });

          // Set departments in AppContext
          setDepartments(departments);
        },
      );

      console.log('[LoginScreen] Login result:', result?.success, result?.message);

      // Handle login result
      if (!result.success) {
        Alert.alert(Strings.dialogHeaderWarning, result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        Strings.dialogHeaderWarning,
        error.message || Strings.errorNetwork,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Logo/Title */}
        <View style={styles.header}>
          <Text style={styles.appName}>{Strings.appName}</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          {/* Username Input */}
          <View style={styles.inputContainer}>
            <UserIcon size={20} color={Colors.accent} />
            <TextInput
              style={styles.inputWithIcon}
              value={username}
              onChangeText={setUsername}
              placeholder="Tên đăng nhập"
              placeholderTextColor={Colors.gray}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <PasswordIcon size={20} color={Colors.accent} />
            <TextInput
              style={styles.inputWithIcon}
              value={password}
              onChangeText={setPassword}
              placeholder="Mật khẩu"
              placeholderTextColor={Colors.gray}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          {/* Database Selection */}
          <View style={styles.inputContainer}>
            <DatabaseIcon size={20} color={Colors.accent} />
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedDbIndex}
                onValueChange={itemValue => setSelectedDbIndex(itemValue)}
                style={styles.picker}
                dropdownIconColor={Colors.white}
                mode="dropdown">
                {databases.map((db, index) => (
                  <Picker.Item
                    key={index}
                    label={db.dbAlias}
                    value={index}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>{Strings.actionSignIn}</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appName: {
    color: Colors.white,
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  version: {
    color: Colors.gray,
    fontSize: 14,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  inputWithIcon: {
    flex: 1,
    color: Colors.white,
    fontSize: 16,
    marginLeft: 12,
    paddingVertical: 0,
  },
  pickerWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  picker: {
    color: Colors.white,
    height: 50,
    backgroundColor: 'transparent',
    marginTop: -10,
    marginBottom: -10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxLabel: {
    color: Colors.white,
    fontSize: 14,
    marginLeft: 8,
  },
  button: {
    backgroundColor: Colors.green,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    minHeight: 48,
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  hint: {
    color: Colors.gray,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
