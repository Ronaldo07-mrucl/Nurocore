import { Habit, HabitCompletion, HabitSchedule } from '../types';
import { parseLocalDate, formatShortDate, formatMonthDay, offsetDateString } from './dates';

/**
 * Checks whether a habit is due / scheduled on a specific date (YYYY-MM-DD).
 *
 * Rules:
 * 1. If habit is inactive (!isActive), it is NOT scheduled on or after its pause.
 * 2. If habit has startDate and dateString < startDate, it is NOT scheduled.
 * 3. If habit has endDate and dateString > endDate, it is NOT scheduled.
 * 4. Checks the schedule definition (daily, weekdays, or specific days of week).
 */
export function isHabitScheduledOnDate(habit: Habit, dateString: string): boolean {
  if (!habit.isActive) {
    return false;
  }

  if (habit.startDate && dateString < habit.startDate) {
    return false;
  }

  if (habit.endDate && dateString > habit.endDate) {
    return false;
  }

  const date = parseLocalDate(dateString);
  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat

  if (habit.schedule) {
    switch (habit.schedule.type) {
      case 'daily':
        return true;
      case 'weekdays':
        return dayOfWeek >= 1 && dayOfWeek <= 5;
      case 'custom_days':
        return habit.schedule.daysOfWeek.includes(dayOfWeek);
      default:
        break;
    }
  }

  // Fallback to legacy scheduledDays
  if (Array.isArray(habit.scheduledDays)) {
    return habit.scheduledDays.includes(dayOfWeek);
  }

  return true;
}

/**
 * Returns all active habits that are due on a specific date.
 */
export function getDueHabitsForDate(habits: Habit[], dateString: string): Habit[] {
  return habits.filter(h => isHabitScheduledOnDate(h, dateString));
}

/**
 * Checks if a specific habit was completed on a given date.
 */
export function isHabitCompletedOnDate(
  habitId: string,
  dateString: string,
  completions: HabitCompletion[]
): boolean {
  const record = completions.find(c => c.habitId === habitId && c.date === dateString);
  return record?.completed === true;
}

/**
 * Retrieves the completion record (if any) for a habit and date.
 */
export function getHabitCompletionRecord(
  habitId: string,
  dateString: string,
  completions: HabitCompletion[]
): HabitCompletion | undefined {
  return completions.find(c => c.habitId === habitId && c.date === dateString);
}

/**
 * Calculates today's (or any date's) completion metrics.
 * Returns:
 * - total: number of active habits scheduled on that date
 * - completed: number of those habits completed
 * - percentage: 0-100 completion percentage (0 if total === 0)
 * - hasScheduled: boolean flag indicating if at least 1 habit was scheduled
 */
export function calculateDailyHabitCompletion(
  habits: Habit[],
  completions: HabitCompletion[],
  dateString: string
): {
  total: number;
  completed: number;
  percentage: number;
  hasScheduled: boolean;
} {
  const due = getDueHabitsForDate(habits, dateString);
  const total = due.length;

  if (total === 0) {
    return { total: 0, completed: 0, percentage: 0, hasScheduled: false };
  }

  const completed = due.filter(h => isHabitCompletedOnDate(h.id, dateString, completions)).length;
  const percentage = Math.round((completed / total) * 100);

  return { total, completed, percentage, hasScheduled: true };
}

/**
 * Returns 7 dates (YYYY-MM-DD) for the Monday-to-Sunday week containing the given reference date.
 */
export function getWeekDatesMondayStart(referenceDateString: string): {
  dates: string[];
  mondayDate: string;
  sundayDate: string;
} {
  const ref = parseLocalDate(referenceDateString);
  const day = ref.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  // Monday offset: if day == 0 (Sun), offset = -6. Otherwise offset = 1 - day.
  const distanceToMonday = day === 0 ? -6 : 1 - day;

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(offsetDateString(referenceDateString, distanceToMonday + i));
  }

  return {
    dates,
    mondayDate: dates[0],
    sundayDate: dates[6],
  };
}

/**
 * Calculates current streak across all active habits.
 *
 * Definition:
 * Consecutive eligible calendar days on which all due habits were completed.
 * An eligible day has at least one scheduled active habit.
 * - If today's due habits are already completed (or no habits are due today), today is counted and we walk backwards.
 * - If today's due habits are NOT yet all completed (day in progress), today does not break the streak;
 *   the streak is determined by consecutive eligible days ending yesterday.
 * - Days with no habits scheduled (e.g. rest days) are skipped without breaking the streak.
 * - Future dates are never counted or penalized.
 */
export function calculateHabitCurrentStreak(
  habits: Habit[],
  completions: HabitCompletion[],
  todayString: string
): number {
  const activeHabits = habits.filter(h => h.isActive);
  if (activeHabits.length === 0) return 0;

  const todayStatus = calculateDailyHabitCompletion(habits, completions, todayString);
  let streak = 0;
  let startDateToCheck = todayString;

  if (todayStatus.hasScheduled) {
    if (todayStatus.completed === todayStatus.total) {
      // Today is fully completed!
      streak = 1;
      startDateToCheck = offsetDateString(todayString, -1);
    } else {
      // Today is in progress (not all finished yet).
      // Check from yesterday backwards so today does not penalize yet.
      startDateToCheck = offsetDateString(todayString, -1);
    }
  } else {
    // No habits scheduled today; check from yesterday
    startDateToCheck = offsetDateString(todayString, -1);
  }

  // Walk backwards up to 365 days
  let currentDate = startDateToCheck;
  for (let i = 0; i < 365; i++) {
    const dayStatus = calculateDailyHabitCompletion(habits, completions, currentDate);

    if (dayStatus.hasScheduled) {
      if (dayStatus.completed === dayStatus.total) {
        streak++;
      } else {
        // Missed at least one scheduled habit on this past day - streak ends
        break;
      }
    }
    // If no habits were scheduled on this day, we skip it without breaking streak

    currentDate = offsetDateString(currentDate, -1);
  }

  return streak;
}

/**
 * Calculates the longest historical consecutive streak of eligible days
 * where all scheduled habits were completed.
 * Looks over the past 180 days up to today.
 */
export function calculateHabitLongestStreak(
  habits: Habit[],
  completions: HabitCompletion[],
  todayString: string
): number {
  const activeHabits = habits.filter(h => h.isActive);
  if (activeHabits.length === 0) return 0;

  const LOOKBACK_DAYS = 180;
  let maxStreak = 0;
  let currentRun = 0;

  // Iterate chronologically from (today - 180 days) up to today
  for (let offset = -LOOKBACK_DAYS; offset <= 0; offset++) {
    const dateStr = offsetDateString(todayString, offset);
    const dayStatus = calculateDailyHabitCompletion(habits, completions, dateStr);

    if (offset === 0) {
      // On today: if all finished, include in run; if not, do not forcibly break historical max
      if (dayStatus.hasScheduled && dayStatus.completed === dayStatus.total) {
        currentRun++;
        if (currentRun > maxStreak) maxStreak = currentRun;
      }
    } else {
      if (dayStatus.hasScheduled) {
        if (dayStatus.completed === dayStatus.total) {
          currentRun++;
          if (currentRun > maxStreak) {
            maxStreak = currentRun;
          }
        } else {
          currentRun = 0;
        }
      }
      // If no habits scheduled, maintain currentRun (does not break streak)
    }
  }

  return maxStreak;
}

/**
 * Calculates consistency over the trailing 30 calendar days (including today).
 * Consistency % = (Total completed occurrences) / (Total scheduled occurrences) * 100
 * Excludes future occurrences.
 */
export function calculateHabit30DayConsistency(
  habits: Habit[],
  completions: HabitCompletion[],
  todayString: string
): {
  percentage: number;
  completedOccurrences: number;
  scheduledOccurrences: number;
  periodLabel: string;
} {
  const activeHabits = habits.filter(h => h.isActive);
  if (activeHabits.length === 0) {
    return {
      percentage: 0,
      completedOccurrences: 0,
      scheduledOccurrences: 0,
      periodLabel: 'Trailing 30 days',
    };
  }

  let totalScheduled = 0;
  let totalCompleted = 0;

  // Trailing 30 days: today - 29 through today
  for (let i = 29; i >= 0; i--) {
    const dateStr = offsetDateString(todayString, -i);
    const due = getDueHabitsForDate(habits, dateStr);
    totalScheduled += due.length;

    for (const habit of due) {
      if (isHabitCompletedOnDate(habit.id, dateStr, completions)) {
        totalCompleted++;
      }
    }
  }

  if (totalScheduled === 0) {
    return {
      percentage: 0,
      completedOccurrences: 0,
      scheduledOccurrences: 0,
      periodLabel: 'Trailing 30 days',
    };
  }

  const percentage = Math.round((totalCompleted / totalScheduled) * 100);

  return {
    percentage,
    completedOccurrences: totalCompleted,
    scheduledOccurrences: totalScheduled,
    periodLabel: 'Trailing 30 days',
  };
}

/**
 * Calculates individual statistics for a single habit:
 * - Current streak (consecutive scheduled days completed)
 * - 30-day completion rate
 * - All-time total completions
 */
export function calculateIndividualHabitStats(
  habit: Habit,
  completions: HabitCompletion[],
  todayString: string
): {
  currentStreak: number;
  thirtyDayRate: number;
  totalCompletions: number;
} {
  const habitCompletions = completions.filter(c => c.habitId === habit.id && c.completed);
  const totalCompletions = habitCompletions.length;

  // 1. Current streak for this habit
  let currentStreak = 0;
  const isScheduledToday = isHabitScheduledOnDate(habit, todayString);
  const isDoneToday = isHabitCompletedOnDate(habit.id, todayString, completions);

  let checkDate = todayString;
  if (isScheduledToday) {
    if (isDoneToday) {
      currentStreak = 1;
      checkDate = offsetDateString(todayString, -1);
    } else {
      // Not done today yet; walk from yesterday without breaking streak yet
      checkDate = offsetDateString(todayString, -1);
    }
  } else {
    checkDate = offsetDateString(todayString, -1);
  }

  for (let i = 0; i < 180; i++) {
    if (isHabitScheduledOnDate(habit, checkDate)) {
      if (isHabitCompletedOnDate(habit.id, checkDate, completions)) {
        currentStreak++;
      } else {
        break;
      }
    }
    checkDate = offsetDateString(checkDate, -1);
  }

  // 2. Trailing 30-day rate
  let scheduledLast30 = 0;
  let completedLast30 = 0;
  for (let i = 29; i >= 0; i--) {
    const d = offsetDateString(todayString, -i);
    if (isHabitScheduledOnDate(habit, d)) {
      scheduledLast30++;
      if (isHabitCompletedOnDate(habit.id, d, completions)) {
        completedLast30++;
      }
    }
  }

  const thirtyDayRate =
    scheduledLast30 > 0 ? Math.round((completedLast30 / scheduledLast30) * 100) : 0;

  return {
    currentStreak,
    thirtyDayRate,
    totalCompletions,
  };
}

/**
 * Generates human-readable schedule description string.
 */
export function getScheduleDescription(schedule?: HabitSchedule, scheduledDays?: number[]): string {
  if (schedule) {
    if (schedule.type === 'daily') return 'Every day';
    if (schedule.type === 'weekdays') return 'Weekdays (Mon–Fri)';
    if (schedule.type === 'custom_days') {
      const days = schedule.daysOfWeek;
      if (days.length === 7) return 'Every day';
      if (days.length === 5 && [1, 2, 3, 4, 5].every(d => days.includes(d))) {
        return 'Weekdays (Mon–Fri)';
      }
      if (days.length === 2 && [0, 6].every(d => days.includes(d))) {
        return 'Weekends only';
      }
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      // Sort starting with Monday (1..6, then 0)
      const sorted = [...days].sort((a, b) => {
        const aNorm = a === 0 ? 7 : a;
        const bNorm = b === 0 ? 7 : b;
        return aNorm - bNorm;
      });
      return sorted.map(d => dayNames[d]).join(', ');
    }
  }

  if (scheduledDays && Array.isArray(scheduledDays)) {
    if (scheduledDays.length === 7) return 'Every day';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return scheduledDays.map(d => dayNames[d]).join(', ');
  }

  return 'Every day';
}

/**
 * Category styling & badge labels
 */
export const HABIT_CATEGORY_CONFIG: Record<
  string,
  { label: string; textClass: string; bgClass: string; borderClass: string; accentColor: string }
> = {
  study: {
    label: 'Study & Academics',
    textClass: 'text-[#9B7BFF]',
    bgClass: 'bg-[#9B7BFF]/10',
    borderClass: 'border-[#9B7BFF]/25',
    accentColor: '#9B7BFF',
  },
  fitness: {
    label: 'Fitness & Physical',
    textClass: 'text-[#43D9A3]',
    bgClass: 'bg-[#43D9A3]/10',
    borderClass: 'border-[#43D9A3]/25',
    accentColor: '#43D9A3',
  },
  mindset: {
    label: 'Mindset & Reflection',
    textClass: 'text-amber-400',
    bgClass: 'bg-amber-400/10',
    borderClass: 'border-amber-400/25',
    accentColor: '#F59E0B',
  },
  discipline: {
    label: 'Discipline & Focus',
    textClass: 'text-cyan-400',
    bgClass: 'bg-cyan-400/10',
    borderClass: 'border-cyan-400/25',
    accentColor: '#06B6D4',
  },
  health: {
    label: 'Health & Recovery',
    textClass: 'text-rose-400',
    bgClass: 'bg-rose-400/10',
    borderClass: 'border-rose-400/25',
    accentColor: '#F43F5E',
  },
  other: {
    label: 'General Routine',
    textClass: 'text-[#8E8EA0]',
    bgClass: 'bg-[#1B1B26]',
    borderClass: 'border-[#292936]',
    accentColor: '#8E8EA0',
  },
};
