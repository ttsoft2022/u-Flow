import {format} from 'date-fns';

/**
 * Format date to yyyy-MM-dd format
 * Used for API calls (matching Android's LocalDate format)
 * @param {Date} date - Date object
 * @returns {string} Formatted date string (e.g., "2025-12-12")
 */
export function formatDateForAPI(date = new Date()) {
  return format(date, 'yyyy-MM-dd');
}
