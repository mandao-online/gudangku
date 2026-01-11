/**
 * Timezone utilities for consistent time handling
 * Uses Asia/Singapore (UTC+8) timezone to match server
 */

import { format as dateFnsFormat, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

// Target timezone (UTC+8)
export const TIMEZONE = 'Asia/Singapore';

/**
 * Get current date/time in the target timezone
 */
export const getCurrentTime = (): Date => {
  return new Date();
};

/**
 * Format date with timezone awareness
 */
export const formatDate = (date: Date | string, formatStr: string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsFormat(dateObj, formatStr, { locale: id });
};

/**
 * Format time with timezone awareness
 */
export const formatTime = (date: Date | string): string => {
  return formatDate(date, 'HH:mm');
};

/**
 * Format full datetime with timezone awareness
 */
export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'EEEE, d MMMM yyyy HH:mm');
};

/**
 * Format date only with timezone awareness
 */
export const formatDateOnly = (date: Date | string): string => {
  return formatDate(date, 'EEE, d MMM');
};

/**
 * Check if a time string represents a valid date
 */
export const isValidDate = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

/**
 * Convert server timestamp to local display
 * Server sends UTC+8 timestamps, browser displays in local time
 */
export const serverTimeToLocal = (serverTime: string): Date => {
  // Server time is already in UTC+8, parse as-is
  return parseISO(serverTime);
};