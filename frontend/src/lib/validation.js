/**
 * Phone Number Validation Utility
 * Validates WhatsApp phone numbers with proper formatting
 */

/**
 * Validates if a phone number is in correct format
 * Accepts formats:
 * - +212600000000
 * - 212600000000
 * - 0600000000 (Morocco)
 * - +1 234 567 8900 (with spaces)
 * - (212) 600-000-000 (with parentheses and dashes)
 * 
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove all spaces, dashes, parentheses, and other formatting
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Must contain only digits and optional leading +
  if (!/^\+?\d+$/.test(cleaned)) {
    return false;
  }

  // Remove the + if present for length check
  const digits = cleaned.replace(/^\+/, '');

  // Phone number should be between 8 and 15 digits
  // Minimum: 8 digits (some countries)
  // Maximum: 15 digits (international standard)
  if (digits.length < 8 || digits.length > 15) {
    return false;
  }

  return true;
}

/**
 * Normalizes a phone number for backend processing
 * Removes all formatting and ensures consistent format
 * 
 * @param {string} phone - The phone number to normalize
 * @returns {string} - Normalized phone number
 */
export function normalizePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters except leading +
  let cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Remove leading + for processing
  cleaned = cleaned.replace(/^\+/, '');

  return cleaned;
}

/**
 * Formats a phone number for display
 * Adds appropriate formatting based on the number
 * 
 * @param {string} phone - The phone number to format
 * @returns {string} - Formatted phone number
 */
export function formatPhoneNumber(phone) {
  const normalized = normalizePhoneNumber(phone);
  
  if (!normalized) {
    return '';
  }

  // Morocco format (212XXXXXXXXX -> +212 6XX XXX XXX)
  if (normalized.startsWith('212') && normalized.length === 12) {
    return `+212 ${normalized.slice(3, 4)}${normalized.slice(4, 6)} ${normalized.slice(6, 9)} ${normalized.slice(9)}`;
  }

  // Default: add + prefix if international format
  if (normalized.length > 10) {
    return `+${normalized}`;
  }

  return normalized;
}

/**
 * Gets error message for invalid phone number
 * 
 * @param {string} phone - The phone number that failed validation
 * @param {Function} t - Translation function
 * @returns {string} - Error message
 */
export function getPhoneValidationError(phone, t) {
  if (!phone || phone.trim() === '') {
    return t('auth.validation.phoneRequired');
  }

  const cleaned = phone.replace(/[\s\-()]/g, '').replace(/^\+/, '');

  if (!/^\d+$/.test(cleaned)) {
    return t('auth.validation.phoneOnlyNumbers');
  }

  if (cleaned.length < 8) {
    return t('auth.validation.phoneTooShort');
  }

  if (cleaned.length > 15) {
    return t('auth.validation.phoneTooLong');
  }

  return t('auth.validation.phoneInvalid');
}
