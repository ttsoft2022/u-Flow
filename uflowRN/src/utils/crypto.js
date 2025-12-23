import CryptoJS from 'crypto-js';

/**
 * MD5 hash for login password
 * Equivalent to Java md5() function in Utility.java
 * @param {string} text - Plain text password
 * @returns {string} MD5 hashed password
 */
export function md5(text) {
  return CryptoJS.MD5(text).toString();
}

/**
 * Encode database password to hex string
 * Equivalent to Java dbEncrypt() and bytesToHex() in Utility.java
 * @param {string} text - Plain text password
 * @returns {string} Hex encoded password (lowercase for compatibility)
 */
export function dbEncrypt(text) {
  // Convert string to bytes manually (TextEncoder may not work on all RN platforms)
  let hex = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    hex += charCode.toString(16).padStart(2, '0');
  }
  console.log('[dbEncrypt] Input:', text, '-> Output:', hex);
  return hex;
}
