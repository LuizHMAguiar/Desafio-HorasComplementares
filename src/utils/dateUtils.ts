/**
 * Utility functions for date handling and validation
 */

/**
 * Get max date (today) for date inputs
 */
export function getMaxDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validate if date is not in the future
 */
export function isValidDate(dateString: string): boolean {
  const selectedDate = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today to allow today's date
  
  return selectedDate <= today;
}

/**
 * Format date to Brazilian format (dd/mm/yyyy)
 */
export function formatDateBR(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get date string for filenames (yyyymmdd)
 */
export function getDateStringForFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
