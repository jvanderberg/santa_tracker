import { describe, it, expect } from 'vitest';
import { formatTimeAgo } from './timeFormat';

describe('formatTimeAgo', () => {
  it('formats less than 5 minutes as "now"', () => {
    expect(formatTimeAgo(0)).toBe('now');
    expect(formatTimeAgo(1)).toBe('now');
    expect(formatTimeAgo(4)).toBe('now');
  });

  it('formats 5-59 minutes as "X min ago"', () => {
    expect(formatTimeAgo(5)).toBe('5 min ago');
    expect(formatTimeAgo(30)).toBe('30 min ago');
    expect(formatTimeAgo(59)).toBe('59 min ago');
  });

  it('formats 60+ minutes as hours', () => {
    expect(formatTimeAgo(60)).toBe('1h ago');
    expect(formatTimeAgo(90)).toBe('1h ago');
    expect(formatTimeAgo(119)).toBe('1h ago');
    expect(formatTimeAgo(120)).toBe('2h ago');
    expect(formatTimeAgo(180)).toBe('3h ago');
  });

  it('formats 24+ hours as days', () => {
    expect(formatTimeAgo(1440)).toBe('1d ago'); // 24 hours
    expect(formatTimeAgo(1500)).toBe('1d ago');
    expect(formatTimeAgo(2880)).toBe('2d ago'); // 48 hours
    expect(formatTimeAgo(4320)).toBe('3d ago'); // 72 hours
  });

  it('handles edge cases', () => {
    expect(formatTimeAgo(0)).toBe('now');
    expect(formatTimeAgo(1439)).toBe('23h ago'); // Just under 24 hours
    expect(formatTimeAgo(10080)).toBe('7d ago'); // 1 week
  });
});
