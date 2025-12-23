import axios from 'axios';

/**
 * Create Axios API client
 * Replaces AsyncHttpClient from Android
 * @param {string} baseURL - Base URL for API (e.g., "http://md1.sewman.vn:8081/SewmanTD")
 * @param {number} timeout - Request timeout in milliseconds (default: 30000)
 * @returns {Object} Configured axios instance
 */
export const createApiClient = (baseURL, timeout = 30000) => {
  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  // Request interceptor for logging
  client.interceptors.request.use(
    config => {
      // Build full URL for debugging
      const fullURL = config.baseURL + config.url;
      const queryString = config.params
        ? '?' + Object.entries(config.params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
        : '';
      console.log('='.repeat(50));
      console.log('[API] FULL URL:', fullURL + queryString);
      console.log('[API] URL Length:', (fullURL + queryString).length);
      console.log('='.repeat(50));
      return config;
    },
    error => {
      console.error('[API Request Error]', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for logging and error handling
  client.interceptors.response.use(
    response => {
      console.log(`[API Response] ${response.status} ${response.config.url}`);
      return response.data; // Return only data, not full response
    },
    error => {
      if (error.code === 'ECONNABORTED') {
        console.error('[API Timeout]', error.config?.url);
        throw new Error('Request timeout. Please check your network connection.');
      }

      if (error.response) {
        // Server responded with error status
        console.error(
          `[API Error] ${error.response.status} ${error.config?.url}`,
          error.response.data
        );

        if (error.response.status === 404) {
          throw new Error('Resource not found');
        }
        if (error.response.status === 500) {
          throw new Error('Internal server error');
        }
        if (error.response.status === 401) {
          throw new Error('Unauthorized. Please check your credentials.');
        }

        throw new Error(error.response.data?.message || 'Server error');
      }

      if (error.request) {
        // Request was made but no response received
        console.error('[API No Response]', error.request);
        console.error('[API No Response] Error code:', error.code);
        console.error('[API No Response] Error message:', error.message);
        // Include more details in error message
        const details = error.code ? ` (${error.code})` : '';
        const nativeError = error.message || '';
        throw new Error(`No response from server${details}. ${nativeError}`);
      }

      // Something else happened
      console.error('[API Error]', error.message);
      console.error('[API Error] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(error.message || 'Unknown network error');
    }
  );

  return client;
};

/**
 * Convert object to URL search params (for GET requests)
 * Axios requires params object, not URLSearchParams
 * @param {Object} params - Parameters object
 * @returns {Object} Params object for Axios
 */
export const toParams = params => {
  return params; // Axios handles this automatically
};
