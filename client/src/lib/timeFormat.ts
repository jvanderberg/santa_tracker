/**
 * Format minutes into a human-readable time ago string
 * @param minutes - Number of minutes ago
 * @returns Formatted string like "now", "5 min ago", "2h ago", or "3d ago"
 */
export function formatTimeAgo(minutes: number): string {
  // Less than 5 minutes - show as "now"
  if (minutes < 5) {
    return 'now';
  }

  // Less than 60 minutes - show in minutes
  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  // Less than 24 hours - show in hours
  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }

  // 24 hours or more - show in days
  const days = Math.floor(minutes / 1440);
  return `${days}d ago`;
}
