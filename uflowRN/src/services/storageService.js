import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Service
 * Replaces MySQLiteOpenHelper.java from Android
 * Uses AsyncStorage instead of SQLite for simplicity
 */

// Storage keys
const KEYS = {
  DB_CONFIGS: '@uflow:db_configs',
  REMEMBER_ME: '@uflow:remember_me',
  SAVED_CREDENTIALS: '@uflow:saved_credentials',
};

/**
 * Database Configurations Management
 * Equivalent to MySQLiteOpenHelper DATABASE_LIST table operations
 */

/**
 * Get all database configurations
 * Equivalent to SELECT_ALL_DB()
 * @returns {Promise<Array>} Array of database config objects
 */
export async function getAllDatabases() {
  try {
    const data = await AsyncStorage.getItem(KEYS.DB_CONFIGS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting all databases:', error);
    return [];
  }
}

/**
 * Add new database configuration
 * Equivalent to INSERT_Database(mDB)
 * @param {Object} dbConfig - Database configuration object
 * @returns {Promise<void>}
 */
export async function addDatabase(dbConfig) {
  try {
    const databases = await getAllDatabases();

    // Generate new ID (equivalent to SQLite autoincrement _id)
    const newId = databases.length > 0
      ? Math.max(...databases.map(db => db.ordinal || 0)) + 1
      : 1;

    const newDb = {
      ordinal: newId,
      serverIP: dbConfig.serverIP || '',
      apiName: dbConfig.apiName || '',
      dbIP: dbConfig.dbIP || '',
      dbName: dbConfig.dbName || '',
      dbAlias: dbConfig.dbAlias || '',
      dbUsername: dbConfig.dbUsername || '',
      dbPassword: dbConfig.dbPassword || '',
      isVisible: dbConfig.isVisible !== undefined ? dbConfig.isVisible : 1,
    };

    databases.push(newDb);
    await AsyncStorage.setItem(KEYS.DB_CONFIGS, JSON.stringify(databases));
  } catch (error) {
    console.error('Error adding database:', error);
    throw error;
  }
}

/**
 * Update existing database configuration
 * Equivalent to UPDATE_Database(mDB, id)
 * @param {number} id - Database ordinal (ID)
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateDatabase(id, updates) {
  try {
    const databases = await getAllDatabases();
    const index = databases.findIndex(db => db.ordinal === id);

    if (index !== -1) {
      databases[index] = {
        ...databases[index],
        ...updates,
        ordinal: id, // Keep original ID
      };
      await AsyncStorage.setItem(KEYS.DB_CONFIGS, JSON.stringify(databases));
    } else {
      throw new Error(`Database with ID ${id} not found`);
    }
  } catch (error) {
    console.error('Error updating database:', error);
    throw error;
  }
}

/**
 * Update visibility status of database
 * Equivalent to UPDATE_Visible(mDB, id)
 * @param {number} id - Database ordinal (ID)
 * @param {number} isVisible - Visibility status (1 or 0)
 * @returns {Promise<void>}
 */
export async function updateDatabaseVisibility(id, isVisible) {
  try {
    await updateDatabase(id, { isVisible });
  } catch (error) {
    console.error('Error updating database visibility:', error);
    throw error;
  }
}

/**
 * Delete database configuration
 * Equivalent to DELETE_Database(id)
 * @param {number} id - Database ordinal (ID)
 * @returns {Promise<void>}
 */
export async function deleteDatabase(id) {
  try {
    const databases = await getAllDatabases();
    const filtered = databases.filter(db => db.ordinal !== id);
    await AsyncStorage.setItem(KEYS.DB_CONFIGS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting database:', error);
    throw error;
  }
}

/**
 * Delete all database configurations
 * Equivalent to DELETE_ALL()
 * @returns {Promise<void>}
 */
export async function deleteAllDatabases() {
  try {
    await AsyncStorage.setItem(KEYS.DB_CONFIGS, JSON.stringify([]));
  } catch (error) {
    console.error('Error deleting all databases:', error);
    throw error;
  }
}

/**
 * Initialize default database configurations
 * Equivalent to loadData() in LoginActivity.java
 * Called when app first launches and no databases exist
 * @returns {Promise<void>}
 */
export async function initializeDefaultDatabases() {
  try {
    const existing = await getAllDatabases();

    // Only initialize if no databases exist
    if (existing.length === 0) {
      // Production databases (matching LoginActivity.java loadData())
      const defaultDatabases = [
        {
          serverIP: '192.168.181.6:8081',
          apiName: 'SewmanTD',
          dbIP: '192.168.181.5',
          dbName: 'sewman_thieudo',
          dbAlias: 'sewman_thieudo',
          dbUsername: 'SYSDBA',
          dbPassword: 'Md@Fb@24',
          isVisible: 1,
        },
        {
          serverIP: 'md1.sewman.vn:8081',
          apiName: 'SewmanTD',
          dbIP: '192.168.181.5',
          dbName: 'sewman_thieudo_n',
          dbAlias: 'sewman_thieudo_n',
          dbUsername: 'SYSDBA',
          dbPassword: 'Md@Fb@24',
          isVisible: 1,
        },
      ];

      // Insert each database
      for (const db of defaultDatabases) {
        await addDatabase(db);
      }

      console.log('Default databases initialized');
    }
  } catch (error) {
    console.error('Error initializing default databases:', error);
    throw error;
  }
}

/**
 * Remember Me & Login Credentials Management
 * Replaces SharedPreferences "loginPrefs" from Android
 */

/**
 * Save login credentials (Remember Me feature)
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Username
 * @param {string} credentials.password - Password (plain text)
 * @param {string} credentials.dbAlias - Selected database alias
 * @returns {Promise<void>}
 */
export async function saveRememberMe(credentials) {
  try {
    await AsyncStorage.setItem(KEYS.REMEMBER_ME, 'true');
    await AsyncStorage.setItem(KEYS.SAVED_CREDENTIALS, JSON.stringify(credentials));
  } catch (error) {
    console.error('Error saving remember me:', error);
    throw error;
  }
}

/**
 * Get saved login credentials
 * @returns {Promise<Object|null>} Saved credentials or null
 */
export async function getRememberMe() {
  try {
    const remember = await AsyncStorage.getItem(KEYS.REMEMBER_ME);

    if (remember === 'true') {
      const credentialsData = await AsyncStorage.getItem(KEYS.SAVED_CREDENTIALS);
      return credentialsData ? JSON.parse(credentialsData) : null;
    }

    return null;
  } catch (error) {
    console.error('Error getting remember me:', error);
    return null;
  }
}

/**
 * Clear saved login credentials
 * @returns {Promise<void>}
 */
export async function clearRememberMe() {
  try {
    await AsyncStorage.removeItem(KEYS.REMEMBER_ME);
    await AsyncStorage.removeItem(KEYS.SAVED_CREDENTIALS);
  } catch (error) {
    console.error('Error clearing remember me:', error);
    throw error;
  }
}

/**
 * Clear all app data (for debugging/reset purposes)
 * @returns {Promise<void>}
 */
export async function clearAllData() {
  try {
    await AsyncStorage.clear();
    console.log('All app data cleared');
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
}
