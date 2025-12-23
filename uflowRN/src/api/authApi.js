import {createApiClient} from './client';
import {md5, dbEncrypt} from '../utils/crypto';

/**
 * Authentication API
 * Handles login and department retrieval
 * Equivalent to wsLogin() and wsGetDep() in LoginActivity.java
 */

/**
 * Login user
 * Endpoint: GET /general/login
 * Equivalent to wsLogin() in LoginActivity.java
 *
 * @param {string} serverIP - Server IP with port (e.g., "md1.sewman.vn:8081")
 * @param {string} apiName - API name (e.g., "SewmanTD")
 * @param {string} username - Username
 * @param {string} password - Plain text password (will be MD5 hashed)
 * @param {Object} dbConfig - Database configuration
 * @param {string} dbConfig.dbIP - Database IP
 * @param {string} dbConfig.dbName - Database name
 * @param {string} dbConfig.dbUsername - Database username
 * @param {string} dbConfig.dbPassword - Database password (plain text)
 * @returns {Promise<Object>} Login response {status: boolean, ...}
 */
export async function login(serverIP, apiName, username, password, dbConfig) {
  try {
    // Build URL with params
    const params = new URLSearchParams({
      name_usl: username,
      password_usl: md5(password), // MD5 hash password
      dbIP: dbConfig.dbIP,
      dbName: dbConfig.dbName,
      dbUsername: dbConfig.dbUsername,
      dbPassword: dbEncrypt(dbConfig.dbPassword), // Hex encode to avoid special chars like @
    });

    const fullURL = `http://${serverIP}/${apiName}/general/login?${params.toString()}`;

    console.log('[Login] ==================');
    console.log('[Login] Full URL:', fullURL);
    console.log('[Login] ==================');

    // Use XMLHttpRequest instead of fetch (more compatible with RN)
    const response = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', fullURL, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.timeout = 15000; // 15 seconds timeout

      xhr.onload = () => {
        console.log('[Login] XHR status:', xhr.status);
        console.log('[Login] XHR response:', xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        console.log('[Login] XHR error event fired');
        reject(new Error('Network request failed (XHR)'));
      };

      xhr.ontimeout = () => {
        console.log('[Login] XHR timeout');
        reject(new Error('Request timeout'));
      };

      console.log('[Login] Sending XHR request...');
      xhr.send();
    });

    console.log('[Login] Response:', JSON.stringify(response));

    // Response structure from Android: { "status": true/false, ... }
    // See LoginActivity.java line 438: obj.getBoolean("status")
    return {
      status: response.status === true || response.status === 'true',
      rawResponse: response,
      error: null,
    };
  } catch (error) {
    console.error('[Login] Error:', error.message);
    // Return error details instead of throwing
    return {
      status: false,
      rawResponse: null,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Get department/factory list
 * Endpoint: GET /general/stats/getdepfactory
 * Equivalent to wsGetDep() in LoginActivity.java
 *
 * @param {string} serverIP - Server IP with port
 * @param {string} apiName - API name
 * @param {Object} dbConfig - Database configuration
 * @param {string} dbConfig.dbIP - Database IP
 * @param {string} dbConfig.dbName - Database name
 * @param {string} dbConfig.dbUsername - Database username
 * @param {string} dbConfig.dbPassword - Database password (plain text)
 * @param {number} type - Department type (default: 11)
 * @returns {Promise<Array>} Array of department objects [{NO_DEP, NAME_DEP}, ...]
 */
export async function getDepartments(
  serverIP,
  apiName,
  dbConfig,
  type = 11,
) {
  try {
    // Create client with base URL
    const baseURL = `http://${serverIP}/${apiName}`;
    const client = createApiClient(baseURL, 10000); // 10 second timeout

    // Prepare params (matching Android RequestParams exactly)
    // See LoginActivity.java line 470-475
    // Note: dbPassword is hex-encoded for getDepartments (different from login!)
    const params = {
      type: String(type),
      dbIP: dbConfig.dbIP,
      dbName: dbConfig.dbName,
      dbUsername: dbConfig.dbUsername,
      dbPassword: dbEncrypt(dbConfig.dbPassword), // Hex encode password
    };

    console.log('[GetDepartments] ==================');
    console.log('[GetDepartments] baseURL:', baseURL);
    console.log('[GetDepartments] Full URL:', baseURL + '/general/stats/getdepfactory');
    console.log('[GetDepartments] params:', JSON.stringify(params));
    console.log('[GetDepartments] ==================');

    // Make GET request
    const response = await client.get('/general/stats/getdepfactory', {params});

    console.log('[GetDepartments] Response:', JSON.stringify(response));

    // Response structure: { "list": [{"NO_DEP": "...", "NAME_DEP": "..."}, ...] }
    if (response && response.list) {
      const departments = response.list.map(item => ({
        NO_DEP: item.NO_DEP,
        NAME_DEP: item.NAME_DEP,
      }));
      console.log('[GetDepartments] Found', departments.length, 'departments');
      return departments;
    }

    console.log('[GetDepartments] No departments found in response');
    return [];
  } catch (error) {
    console.error('[GetDepartments] Error:', error.message);
    throw error;
  }
}
