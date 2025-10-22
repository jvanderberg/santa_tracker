/**
 * Format current time with AM/PM
 * @param date - Date to format
 * @returns Formatted string like "9:35 AM" or "2:15 PM"
 */
export function formatCurrentTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12; // Convert 0 to 12 for midnight
  const minutesStr = minutes.toString().padStart(2, '0');
  return `${hours12}:${minutesStr} ${ampm}`;
}
