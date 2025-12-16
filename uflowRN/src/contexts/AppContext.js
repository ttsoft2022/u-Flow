import React, {createContext, useContext, useState, useEffect} from 'react';

/**
 * App Context
 * Global application state management
 * Replaces MyApplication.java from Android
 *
 * Stores:
 * - User information (userNo)
 * - Current department (noDep)
 * - Database configuration (dbName, dbIP, dbUsername, dbPassword, etc.)
 * - Server configuration (serverIP, apiName)
 * - Department list (listDep)
 */

const AppContext = createContext();

/**
 * App Provider Component
 * Wraps the entire app to provide global state
 */
export function AppProvider({children}) {
  // Global state (equivalent to MyApplication fields)
  const [state, setState] = useState({
    // User info
    userNo: null, // Username (e.g., "tola.sm")

    // Current department
    noDep: null, // Current department number (e.g., "TD.SM")

    // Database configuration (from selected database in login)
    dbName: null, // Database name
    dbAlias: null, // Database alias (display name)
    dbUsername: null, // Database username
    dbPassword: null, // Database password
    dbIP: null, // Database IP

    // Server configuration
    serverIP: null, // API server IP (e.g., "md1.sewman.vn:8081")
    apiName: null, // API name (e.g., "SewmanTD")

    // Department list (fetched after login)
    listDep: [], // Array of Department objects [{NO_DEP, NAME_DEP}, ...]
  });

  /**
   * Update state
   * Merge updates into existing state
   * @param {Object} updates - Fields to update
   */
  const updateState = updates => {
    setState(prevState => ({
      ...prevState,
      ...updates,
    }));
  };

  /**
   * Set user information
   * Called after successful login
   * @param {string} username - Username
   */
  const setUser = username => {
    updateState({userNo: username});
  };

  /**
   * Set database configuration
   * Called when user selects database in login screen
   * @param {Object} dbConfig - Database configuration
   */
  const setDatabaseConfig = dbConfig => {
    updateState({
      dbName: dbConfig.dbName,
      dbAlias: dbConfig.dbAlias,
      dbUsername: dbConfig.dbUsername,
      dbPassword: dbConfig.dbPassword,
      dbIP: dbConfig.dbIP,
      serverIP: dbConfig.serverIP,
      apiName: dbConfig.apiName,
    });
  };

  /**
   * Set department list
   * Called after fetching departments from API
   * @param {Array} departments - Array of department objects
   */
  const setDepartments = departments => {
    updateState({
      listDep: departments,
      // Set first department as current if available
      noDep: departments.length > 0 ? departments[0].NO_DEP : null,
    });
  };

  /**
   * Switch to different department
   * Called when user switches department in MainActivity
   * @param {string} departmentNo - Department number to switch to
   */
  const switchDepartment = departmentNo => {
    updateState({noDep: departmentNo});
  };

  /**
   * Get current department name
   * @returns {string} Current department name or empty string
   */
  const getCurrentDepartmentName = () => {
    if (!state.noDep || state.listDep.length === 0) {
      return '';
    }

    const currentDep = state.listDep.find(dep => dep.NO_DEP === state.noDep);
    return currentDep ? currentDep.NAME_DEP : '';
  };

  /**
   * Get next department (cycle through list)
   * Used for department switching in MainActivity
   * @returns {Object|null} Next department or null
   */
  const getNextDepartment = () => {
    if (state.listDep.length === 0) {
      return null;
    }

    const currentIndex = state.listDep.findIndex(
      dep => dep.NO_DEP === state.noDep,
    );

    // If current not found or is last, return first
    if (currentIndex === -1 || currentIndex === state.listDep.length - 1) {
      return state.listDep[0];
    }

    // Return next department
    return state.listDep[currentIndex + 1];
  };

  /**
   * Clear all state (on logout)
   */
  const clearState = () => {
    setState({
      userNo: null,
      noDep: null,
      dbName: null,
      dbAlias: null,
      dbUsername: null,
      dbPassword: null,
      dbIP: null,
      serverIP: null,
      apiName: null,
      listDep: [],
    });
  };

  /**
   * Get database configuration object
   * Convenient for passing to API functions
   * @returns {Object} Database config {dbIP, dbName, dbUsername, dbPassword}
   */
  const getDbConfig = () => ({
    dbIP: state.dbIP,
    dbName: state.dbName,
    dbUsername: state.dbUsername,
    dbPassword: state.dbPassword,
  });

  // Context value
  const value = {
    // State
    ...state,

    // Methods
    updateState,
    setUser,
    setDatabaseConfig,
    setDepartments,
    switchDepartment,
    getCurrentDepartmentName,
    getNextDepartment,
    clearState,
    getDbConfig,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Custom hook to use App Context
 * @returns {Object} App context value
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
