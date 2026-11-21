/**
 * Date utilities using local calendar dates to avoid timezone shift bugs.
 */

import { DateRangeFilter } from '../types';

// Format a Date object to YYYY-MM-DD in local time
export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Today's date string YYYY-MM-DD
export function getTodayString(): string {
  return formatLocalDate(new Date());
}

// Parse YYYY-MM-DD into a local Date object (setting time to local midnight 00:00:00)
export function parseLocalDate(dateString: string): Date {
  if (!dateString) return new Date();
  const parts = dateString.split('-');
  if (parts.length !== 3) return new Date();
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day, 0, 0, 0, 0);
}

// Format YYYY-MM-DD to "Saturday, October 17, 2026"
export function formatLongDate(dateString: string): string {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format YYYY-MM-DD to "Oct 17, 2026"
export function formatShortDate(dateString: string): string {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format YYYY-MM-DD to "Oct 17"
export function formatMonthDay(dateString: string): string {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// Calculate difference in whole calendar days: targetDate - fromDate
export function getDaysDifference(targetDateString: string, fromDateString: string = getTodayString()): number {
  if (!targetDateString) return 0;
  const target = parseLocalDate(targetDateString);
  const from = parseLocalDate(fromDateString);
  
  const utcTarget = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const utcFrom = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utcTarget - utcFrom) / msPerDay);
}

// Relative date label for upcoming items
export function getRelativeDateLabel(dateString: string, todayString: string = getTodayString()): string {
  const diff = getDaysDifference(dateString, todayString);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff < -1) return `${Math.abs(diff)}d ago`;
  if (diff > 1 && diff <= 7) return `In ${diff} days`;
  return formatMonthDay(dateString);
}

// Add/subtract days from a local YYYY-MM-DD date string
export function offsetDateString(baseDateString: string, offsetDays: number): string {
  const date = parseLocalDate(baseDateString);
  date.setDate(date.getDate() + offsetDays);
  return formatLocalDate(date);
}

// Add/subtract days from today's date
export function getOffsetDateString(offsetDays: number): string {
  return offsetDateString(getTodayString(), offsetDays);
}

// Get the start date string for a given DateRangeFilter
export function getDateRangeStartDate(filter: DateRangeFilter, todayString: string = getTodayString()): string | null {
  if (filter === 'all') return null;
  const days = filter === '7d' ? 6 : filter === '30d' ? 29 : 89;
  return offsetDateString(todayString, -days);
}

// Get the preceding equivalent date range for comparison
export function getPrecedingDateRange(
  filter: DateRangeFilter,
  todayString: string = getTodayString()
): { start: string; end: string } | null {
  if (filter === 'all') return null;
  const days = filter === '7d' ? 7 : filter === '30d' ? 30 : 90;
  // Preceding end date is 1 day before the current range's start date
  const currentStart = offsetDateString(todayString, -(days - 1));
  const precedingEnd = offsetDateString(currentStart, -1);
  const precedingStart = offsetDateString(precedingEnd, -(days - 1));
  return { start: precedingStart, end: precedingEnd };
}

// Generate continuous array of YYYY-MM-DD dates from startDate to endDate
export function generateDateSeries(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let current = startDate;
  while (current <= endDate) {
    dates.push(current);
    current = offsetDateString(current, 1);
  }
  return dates;
}

// Get current month string in YYYY-MM format
export function getCurrentMonthString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Format YYYY-MM to "October 2026"
export function formatMonthYear(monthString: string): string {
  if (!monthString) return '';
  const parts = monthString.split('-');
  if (parts.length < 2) return monthString;
  const year = parseInt(parts[0], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const d = new Date(year, monthIndex, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Get previous month string, handling year boundaries safely (e.g. 2026-01 -> 2025-12)
export function getPreviousMonth(monthString: string): string {
  const parts = monthString.split('-');
  let year = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10);
  if (month === 1) {
    year -= 1;
    month = 12;
  } else {
    month -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

// Get next month string, handling year boundaries safely (e.g. 2026-12 -> 2027-01)
export function getNextMonth(monthString: string): string {
  const parts = monthString.split('-');
  let year = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10);
  if (month === 12) {
    year += 1;
    month = 1;
  } else {
    month += 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

// Format week range label (e.g. "Oct 19 – Oct 25, 2026")
export function formatWeekRange(startDateStr: string, endDateStr: string): string {
  const start = parseLocalDate(startDateStr);
  const end = parseLocalDate(endDateStr);

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const endDay = end.getDate();
  const year = end.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}

// Get weekday short name (e.g., "Mon", "Tue")
export function getWeekdayShort(dateString: string): string {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// Get day number string (e.g., "19")
export function getDayOfMonth(dateString: string): string {
  const date = parseLocalDate(dateString);
  return String(date.getDate());
}

// Check if a date falls in a given month "YYYY-MM"
export function isDateInMonth(dateString: string, monthString: string): boolean {
  return dateString.startsWith(monthString);
}
