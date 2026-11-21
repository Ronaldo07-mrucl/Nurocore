import { ReflectionEntry, Mood } from '../types';
import { getTodayString, parseLocalDate, formatLocalDate } from './dates';

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  hasEntryToday: boolean;
  totalEntries: number;
  lastEntryDate: string | null;
}

/**
 * Calculates continuous reflection streak.
 * Streak counts consecutive calendar days with at least one entry.
 * If today has an entry, streak includes today.
 * If today has no entry yet, but yesterday did, active streak is preserved up through yesterday.
 * Otherwise, current streak is 0.
 */
export function calculateReflectionStreak(
  entries: ReflectionEntry[],
  todayStr: string = getTodayString()
): StreakResult {
  if (!entries || entries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      hasEntryToday: false,
      totalEntries: 0,
      lastEntryDate: null,
    };
  }

  // Get unique sorted dates in descending order (newest first)
  const uniqueDates = Array.from(new Set(entries.map(e => e.date))).sort((a, b) => b.localeCompare(a));
  const hasEntryToday = uniqueDates.includes(todayStr);
  const lastEntryDate = uniqueDates[0] || null;

  const dateSet = new Set(uniqueDates);

  // Helper to step date backward by 1 day
  const getPrevDate = (dStr: string): string => {
    const d = parseLocalDate(dStr);
    d.setDate(d.getDate() - 1);
    return formatLocalDate(d);
  };

  // Determine starting point for current streak
  let currentStreak = 0;
  let checkDate = hasEntryToday ? todayStr : getPrevDate(todayStr);

  while (dateSet.has(checkDate)) {
    currentStreak++;
    checkDate = getPrevDate(checkDate);
  }

  // Calculate longest streak across all history
  let longestStreak = 0;
  // Sort ascending for longest streak scanning
  const sortedAsc = [...uniqueDates].sort((a, b) => a.localeCompare(b));
  let running = 0;
  let expectedPrev = '';

  for (const d of sortedAsc) {
    if (!expectedPrev) {
      running = 1;
    } else {
      const nextExpected = getPrevDate(d);
      if (nextExpected === expectedPrev) {
        running++;
      } else {
        running = 1;
      }
    }
    expectedPrev = d;
    if (running > longestStreak) {
      longestStreak = running;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    hasEntryToday,
    totalEntries: entries.length,
    lastEntryDate,
  };
}

export interface MoodDistribution {
  great: number;
  good: number;
  neutral: number;
  difficult: number;
  low: number;
}

export function getMoodDistribution(entries: ReflectionEntry[]): MoodDistribution {
  const dist: MoodDistribution = {
    great: 0,
    good: 0,
    neutral: 0,
    difficult: 0,
    low: 0,
  };

  entries.forEach(entry => {
    if (entry.mood && entry.mood in dist) {
      dist[entry.mood]++;
    }
  });

  return dist;
}

export function getTagFrequencies(entries: ReflectionEntry[]): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  entries.forEach(e => {
    (e.tags || []).forEach(t => {
      const clean = t.trim();
      if (clean) {
        map.set(clean, (map.get(clean) || 0) + 1);
      }
    });
  });

  return Array.from(map.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getWordCount(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}
