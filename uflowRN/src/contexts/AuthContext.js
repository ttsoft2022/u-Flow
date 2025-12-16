import React, {createContext, useContext, useState, useEffect} from 'react';
import * as StorageService from '../services/storageService';
import {login, getDepartments} from '../api/authApi';

/**
 * Auth Context
 * Handles authentication state and login/logout functionality
 * Replaces SharedPreferences from LoginActivity.java
 *
 * Stores:
 * - Authentication status (isAuthenticated)
 * - Remember Me state (rememberMe)
 * - Loading states
 */

const AuthContext = createContext();

/**
 * Auth Provider Component
 * Wraps the app to provide authentication state and methods
 */
export function AuthProvider({children}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize auth state on app start
   * Check if user has saved credentials (Remember Me)
   */
  useEffect(() => {
    checkAutoLogin();
  }, []);

  /**
   * Check for saved credentials on app start
   * Equivalent to checking SharedPreferences in LoginActivity.onCreate()
   */
  const checkAutoLogin = async () => {
    try {
      const savedCredentials = await StorageService.getRememberMe();
      if (savedCredentials) {
        setRememberMe(true);
        // Credentials exist but don't auto-login
        // User still needs to tap login button
        // This just pre-fills the form (handled in LoginScreen)
      }
    } catch (error) {
      console.error('Check auto-login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Perform login
   * Calls login API and handles success/failure
   *
   * @param {string} serverIP - Server IP with port
   * @param {string} apiName - API name
   * @param {string} username - Username
   * @param {string} password - Plain text password
   * @param {Object} dbConfig - Database configuration
   * @param {boolean} shouldRemember - Whether to save credentials
   * @param {Function} onLoginSuccess - Callback on successful login with department list
   * @returns {Promise<Object>} Login result {success, message, departments}
   */
  const performLogin = async (
    serverIP,
    apiName,
    username,
    password,
    dbConfig,
    shouldRemember,
    onLoginSuccess,
  ) => {
    try {
      console.log('[AuthContext] Starting login for user:', username);
      console.log('[AuthContext] Server:', serverIP, '/', apiName);

      // Step 1: Authenticate user
      // See LoginActivity.java wsLogin() line 427-467
      const loginResponse = await login(
        serverIP,
        apiName,
        username,
        password,
        dbConfig,
      );

      console.log('[AuthContext] Login response:', JSON.stringify(loginResponse));

      // Check login status (Android uses "status" field, not "success")
      // See LoginActivity.java line 438: obj.getBoolean("status")
      if (!loginResponse || !loginResponse.status) {
        console.log('[AuthContext] Login failed - status is false');
        return {
          success: false,
          message: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
        };
      }

      console.log('[AuthContext] Login successful, getting departments...');

      // Step 2: Get department list (type = 11)
      // See LoginActivity.java getDepFactory(11) line 442
      const departments = await getDepartments(serverIP, apiName, dbConfig, 11);

      console.log('[AuthContext] Got', departments?.length || 0, 'departments');

      if (!departments || departments.length === 0) {
        return {
          success: false,
          message: 'Không tìm thấy phân xưởng nào.',
        };
      }

      // Step 3: Save credentials (always remember)
      if (shouldRemember) {
        await StorageService.saveRememberMe({
          serverIP,
          apiName,
          username,
          password,
          dbConfig,
        });
        setRememberMe(true);
      }

      // Step 4: Mark as authenticated
      setIsAuthenticated(true);

      // Step 5: Call success callback with departments
      if (onLoginSuccess) {
        onLoginSuccess(departments);
      }

      console.log('[AuthContext] Login complete!');

      return {
        success: true,
        message: 'Đăng nhập thành công',
        departments,
      };
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      return {
        success: false,
        message: error.message || 'Lỗi kết nối. Vui lòng thử lại.',
      };
    }
  };

  /**
   * Logout user
   * Clear authentication state and optionally clear saved credentials
   *
   * @param {boolean} clearSavedCredentials - Whether to clear Remember Me data
   */
  const logout = async (clearSavedCredentials = false) => {
    try {
      // Clear authentication state
      setIsAuthenticated(false);

      // Clear saved credentials if requested
      if (clearSavedCredentials) {
        await StorageService.clearRememberMe();
        setRememberMe(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Get saved credentials (for pre-filling login form)
   * @returns {Promise<Object|null>} Saved credentials or null
   */
  const getSavedCredentials = async () => {
    try {
      return await StorageService.getRememberMe();
    } catch (error) {
      console.error('Get saved credentials error:', error);
      return null;
    }
  };

  // Context value
  const value = {
    // State
    isAuthenticated,
    rememberMe,
    isLoading,

    // Methods
    performLogin,
    logout,
    getSavedCredentials,
    setIsAuthenticated, // For test mode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use Auth Context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
