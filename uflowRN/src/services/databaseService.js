import * as StorageService from './storageService';

/**
 * Database Service
 * Higher-level wrapper around storageService for database operations
 * Provides convenient methods for working with database configurations
 */

/**
 * Get all visible database configurations
 * Used for populating the database dropdown in LoginScreen
 * @returns {Promise<Array>} Array of visible database configs
 */
export async function getVisibleDatabases() {
  try {
    const all = await StorageService.getAllDatabases();
    return all.filter(db => db.isVisible === 1);
  } catch (error) {
    console.error('Error getting visible databases:', error);
    return [];
  }
}

/**
 * Get database configuration by alias
 * @param {string} alias - Database alias to search for
 * @returns {Promise<Object|null>} Database config or null if not found
 */
export async function getDatabaseByAlias(alias) {
  try {
    const all = await StorageService.getAllDatabases();
    return all.find(db => db.dbAlias === alias) || null;
  } catch (error) {
    console.error('Error getting database by alias:', error);
    return null;
  }
}

/**
 * Get database configuration by ordinal (ID)
 * @param {number} ordinal - Database ID
 * @returns {Promise<Object|null>} Database config or null if not found
 */
export async function getDatabaseById(ordinal) {
  try {
    const all = await StorageService.getAllDatabases();
    return all.find(db => db.ordinal === ordinal) || null;
  } catch (error) {
    console.error('Error getting database by ID:', error);
    return null;
  }
}

/**
 * Check if databases have been initialized
 * @returns {Promise<boolean>} True if databases exist
 */
export async function isDatabasesInitialized() {
  try {
    const all = await StorageService.getAllDatabases();
    return all.length > 0;
  } catch (error) {
    console.error('Error checking if databases initialized:', error);
    return false;
  }
}

/**
 * Initialize databases if not already initialized
 * Should be called on app startup
 * @returns {Promise<void>}
 */
export async function ensureDatabasesInitialized() {
  try {
    const initialized = await isDatabasesInitialized();
    if (!initialized) {
      await StorageService.initializeDefaultDatabases();
    }
  } catch (error) {
    console.error('Error ensuring databases initialized:', error);
    throw error;
  }
}

/**
 * Get count of visible databases
 * @returns {Promise<number>} Number of visible databases
 */
export async function getVisibleDatabasesCount() {
  try {
    const visible = await getVisibleDatabases();
    return visible.length;
  } catch (error) {
    console.error('Error getting visible databases count:', error);
    return 0;
  }
}

// Re-export storage service functions for convenience
export {
  getAllDatabases,
  addDatabase,
  updateDatabase,
  updateDatabaseVisibility,
  deleteDatabase,
  deleteAllDatabases,
  initializeDefaultDatabases,
  saveRememberMe,
  getRememberMe,
  clearRememberMe,
  clearAllData,
} from './storageService';
