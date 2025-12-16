/**
 * Format number with German locale (e.g., 1234.56 -> 1.234,56)
 * Matching Android's toLocaleString('de-DE') behavior
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number string
 */
export function formatNumberGerman(value, decimals = 0) {
  if (value == null || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format integer with German locale (no decimals)
 * @param {number} value - Number to format
 * @returns {string} Formatted integer string
 */
export function formatInteger(value) {
  return formatNumberGerman(value, 0);
}

/**
 * Format percentage with German locale
 * @param {number} value - Percentage value (0-100)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string with % sign
 */
export function formatPercentage(value, decimals = 1) {
  return `${formatNumberGerman(value, decimals)}%`;
}
