import {createApiClient} from './client';

/**
 * Chart API
 * Handles fetching chart data for top and bottom charts
 * Equivalent to wsGetChart() in TopFragment.java and BottomFragment.java
 */

/**
 * Get top chart data (today's data)
 * Endpoint: GET /general/flow/getflowcharttoday
 * Equivalent to wsGetChart() in TopFragment.java
 *
 * @param {string} serverIP - Server IP with port (e.g., "md1.sewman.vn:8081")
 * @param {string} apiName - API name (e.g., "SewmanTD")
 * @param {string} noDep - Department number (e.g., "TD.SM")
 * @param {string} fdate - From date in yyyy-MM-dd format
 * @param {string} tdate - To date in yyyy-MM-dd format
 * @param {number} type - Chart type (1, 2, or 3)
 * @param {Object} dbConfig - Database configuration
 * @param {string} dbConfig.dbIP - Database IP
 * @param {string} dbConfig.dbName - Database name
 * @param {string} dbConfig.dbUsername - Database username
 * @param {string} dbConfig.dbPassword - Database password (plain text)
 * @returns {Promise<Array>} Array of chart data [{QTY, QTY_WORKER, ORDINAL, LABEL}, ...]
 */
export async function getTopChartData(
  serverIP,
  apiName,
  noDep,
  fdate,
  tdate,
  type,
  dbConfig,
) {
  try {
    // Create client with base URL
    const baseURL = `http://${serverIP}/${apiName}`;
    const client = createApiClient(baseURL, 30000); // 30 second timeout (matches Android)

    // Prepare params
    const params = {
      noDep,
      fdate,
      tdate,
      type: String(type),
      dbIP: dbConfig.dbIP,
      dbName: dbConfig.dbName,
      dbUsername: dbConfig.dbUsername,
      dbPassword: dbConfig.dbPassword,
    };

    // Make GET request
    const response = await client.get('/general/flow/getflowcharttoday', {
      params,
    });

    // Response structure: { "list": [{"QTY": ..., "QTY_WORKER": ..., "ORDINAL": ..., "LABEL": "..."}, ...] }
    if (response && response.list) {
      return response.list;
    }

    return [];
  } catch (error) {
    console.error('Get top chart data error:', error);
    throw error;
  }
}

/**
 * Get bottom chart data (15-minute data)
 * Endpoint: GET /general/flow/getflowchart15
 * Equivalent to wsGetChart() in BottomFragment.java
 *
 * @param {string} serverIP - Server IP with port
 * @param {string} apiName - API name
 * @param {string} noDep - Department number
 * @param {string} fdate - From date in yyyy-MM-dd format
 * @param {string} tdate - To date in yyyy-MM-dd format
 * @param {number} type - Chart type (1, 2, 3, or 4)
 * @param {Object} dbConfig - Database configuration
 * @param {string} dbConfig.dbIP - Database IP
 * @param {string} dbConfig.dbName - Database name
 * @param {string} dbConfig.dbUsername - Database username
 * @param {string} dbConfig.dbPassword - Database password (plain text)
 * @returns {Promise<Array>} Array of chart data [{QTY, ORDINAL}, ...]
 */
export async function getBottomChartData(
  serverIP,
  apiName,
  noDep,
  fdate,
  tdate,
  type,
  dbConfig,
) {
  try {
    // Create client with base URL
    const baseURL = `http://${serverIP}/${apiName}`;
    const client = createApiClient(baseURL, 15000); // 15 second timeout (matches Android)

    // Prepare params
    const params = {
      noDep,
      fdate,
      tdate,
      type: String(type),
      dbIP: dbConfig.dbIP,
      dbName: dbConfig.dbName,
      dbUsername: dbConfig.dbUsername,
      dbPassword: dbConfig.dbPassword,
    };

    // Make GET request
    const response = await client.get('/general/flow/getflowchart15', {
      params,
    });

    // Response structure: { "list": [{"QTY": ..., "ORDINAL": ...}, ...] }
    if (response && response.list) {
      return response.list;
    }

    return [];
  } catch (error) {
    console.error('Get bottom chart data error:', error);
    throw error;
  }
}
