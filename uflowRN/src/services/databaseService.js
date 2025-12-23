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
