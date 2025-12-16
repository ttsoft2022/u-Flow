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
 * @returns {string} Hex encoded password
 */
export function dbEncrypt(text) {
  const bytes = new TextEncoder().encode(text);
  return Array.from(bytes)
    .map(byte => byte.toString(16).toUpperCase().padStart(2, '0'))
    .join('');
}

/**
 * Validate email with regex pattern
 * Equivalent to Java validate() in Utility.java
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function validateEmail(email) {
  const EMAIL_PATTERN =
    /^[_A-Za-z0-9-+]+(\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$/;
  return EMAIL_PATTERN.test(email);
}

/**
 * Check if string is not null or empty
 * Equivalent to Java isNotNull() in Utility.java
 * @param {string} txt - String to check
 * @returns {boolean} True if not null/empty
 */
export function isNotNull(txt) {
  return txt != null && txt.trim().length > 0;
}
