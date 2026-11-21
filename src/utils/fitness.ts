import {
  WorkoutSession,
  WeightEntry,
  BodyMeasurementEntry,
  FitnessSettings,
} from '../types';
import { parseLocalDate, formatLocalDate, offsetDateString, formatMonthDay } from './dates';

export const KG_TO_LB = 2.20462262;
export const CM_TO_IN = 0.393700787;

// --- Unit Conversions ---

export function kgToLb(kg: number): number {
  return Math.round(kg * KG_TO_LB * 10) / 10;
}

export function lbToKg(lb: number): number {
  return Math.round((lb / KG_TO_LB) * 100) / 100;
}

export function formatWeight(kg: number, unit: 'kg' | 'lb'): string {
  if (isNaN(kg) || kg <= 0) return '—';
  if (unit === 'lb') {
    return `${kgToLb(kg)} lbs`;
  }
  return `${Math.round(kg * 10) / 10} kg`;
}

export function formatWeightValue(kg: number, unit: 'kg' | 'lb'): number {
  if (unit === 'lb') {
    return kgToLb(kg);
  }
  return Math.round(kg * 10) / 10;
}

export function cmToIn(cm: number): number {
  return Math.round(cm * CM_TO_IN * 10) / 10;
}

export function inToCm(inch: number): number {
  return Math.round((inch / CM_TO_IN) * 10) / 10;
}

export function formatLength(cm: number, unit: 'cm' | 'in'): string {
  if (isNaN(cm) || cm <= 0) return '—';
  if (unit === 'in') {
    return `${cmToIn(cm)} in`;
  }
  return `${Math.round(cm * 10) / 10} cm`;
}

export function formatLengthValue(cm: number, unit: 'cm' | 'in'): number {
  if (unit === 'in') {
    return cmToIn(cm);
  }
  return Math.round(cm * 10) / 10;
}

// --- Week Calculations (Monday through Sunday) ---

export function getMondaySundayWeekRange(dateString: string): { start: string; end: string } {
  const date = parseLocalDate(dateString);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  // Distance from Monday (if day is 0/Sunday, distance back to Monday is 6 days)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: formatLocalDate(monday),
    end: formatLocalDate(sunday),
  };
}

export function calculateWorkoutsThisWeek(workouts: WorkoutSession[], todayString: string): number {
  const { start, end } = getMondaySundayWeekRange(todayString);
  return workouts.filter(w => w.date >= start && w.date <= end).length;
}

// --- Weight Analysis ---

export function getLatestWeight(entries: WeightEntry[]): WeightEntry | null {
  if (!entries || entries.length === 0) return null;
  // Sort descending by date, then by createdAt if same date
  const sorted = [...entries].sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });
  return sorted[0];
}

export function getEarliestWeight(entries: WeightEntry[]): WeightEntry | null {
  if (!entries || entries.length === 0) return null;
  // Sort ascending by date, then by createdAt if same date
  const sorted = [...entries].sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return (a.createdAt || '').localeCompare(b.createdAt || '');
  });
  return sorted[0];
}

export function calculateNetWeightChange(entries: WeightEntry[]): {
  diffKg: number;
  isIncrease: boolean;
  isDecrease: boolean;
  isNeutral: boolean;
  earliest: WeightEntry;
  latest: WeightEntry;
} | null {
  if (!entries || entries.length < 2) return null;
  const earliest = getEarliestWeight(entries);
  const latest = getLatestWeight(entries);

  if (!earliest || !latest || earliest.id === latest.id) return null;

  const diffKg = Math.round((latest.weightKg - earliest.weightKg) * 100) / 100;
  const isIncrease = diffKg > 0.05;
  const isDecrease = diffKg < -0.05;
  const isNeutral = !isIncrease && !isDecrease;

  return {
    diffKg,
    isIncrease,
    isDecrease,
    isNeutral,
    earliest,
    latest,
  };
}

// Map dates to single canonical weight entry (latest entry for that date)
export function getDailyWeightMap(entries: WeightEntry[]): Map<string, WeightEntry> {
  const map = new Map<string, WeightEntry>();
  // Sort ascending by date & createdAt so latest overrides earlier on the same day
  const sorted = [...entries].sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return (a.createdAt || '').localeCompare(b.createdAt || '');
  });
  sorted.forEach(entry => {
    map.set(entry.date, entry);
  });
  return map;
}

// Filter weight entries for trend chart by time range or specific week
export function filterWeightsForChart(
  entries: WeightEntry[],
  filter: '7d' | '30d' | '90d' | 'all' | 'custom_week',
  todayString: string,
  weekStartDate?: string
): { date: string; formattedDate: string; weightKg: number; entry: WeightEntry }[] {
  const dailyMap = getDailyWeightMap(entries);
  const allDailyEntries = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  if (allDailyEntries.length === 0) return [];

  let filtered = allDailyEntries;

  if (filter === 'custom_week' && weekStartDate) {
    const weekEnd = offsetDateString(weekStartDate, 6);
    filtered = allDailyEntries.filter(e => e.date >= weekStartDate && e.date <= weekEnd);
  } else if (filter === '7d') {
    const start = offsetDateString(todayString, -6);
    filtered = allDailyEntries.filter(e => e.date >= start && e.date <= todayString);
  } else if (filter === '30d') {
    const start = offsetDateString(todayString, -29);
    filtered = allDailyEntries.filter(e => e.date >= start && e.date <= todayString);
  } else if (filter === '90d') {
    const start = offsetDateString(todayString, -89);
    filtered = allDailyEntries.filter(e => e.date >= start && e.date <= todayString);
  }

  return filtered.map(e => ({
    date: e.date,
    formattedDate: formatMonthDay(e.date),
    weightKg: e.weightKg,
    entry: e,
  }));
}

// --- Calendar Grid Generation ---

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export function generateMonthlyCalendarGrid(year: number, month: number, todayString: string): CalendarDay[] {
  // Days in current month
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  
  // First day of current month: 0=Sun, 1=Mon ... 6=Sat
  const firstDayWeekday = new Date(year, month, 1).getDay();
  // We use Monday as first day of week: Monday=0, Tuesday=1 ... Sunday=6
  const startOffset = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;

  // Days in previous month
  const prevMonthDate = new Date(year, month, 0);
  const daysInPrevMonth = prevMonthDate.getDate();

  const days: CalendarDay[] = [];

  // Previous month trailing days
  for (let i = startOffset - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthIdx = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    days.push({
      date: dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayString,
      isFuture: dateStr > todayString,
    });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    days.push({
      date: dateStr,
      dayNumber: dayNum,
      isCurrentMonth: true,
      isToday: dateStr === todayString,
      isFuture: dateStr > todayString,
    });
  }

  // Next month leading days to complete grid (multiples of 7, 35 or 42 cells)
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    days.push({
      date: dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayString,
      isFuture: dateStr > todayString,
    });
  }

  return days;
}

// --- Workout Type Badges ---

export const WORKOUT_TYPE_LABELS: Record<string, string> = {
  strength: 'Strength',
  cardio: 'Cardio',
  mobility: 'Mobility & Recovery',
  sports: 'Sports & Athletics',
  other: 'General Workout',
};

export function getWorkoutTypeStyle(workoutType: string): {
  label: string;
  badgeClass: string;
} {
  const norm = (workoutType || '').toLowerCase();
  if (norm.includes('cardio') || norm.includes('run') || norm.includes('cycle') || norm.includes('swim')) {
    return {
      label: 'Cardio',
      badgeClass: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
    };
  }
  if (norm.includes('mobility') || norm.includes('stretch') || norm.includes('recovery') || norm.includes('yoga')) {
    return {
      label: 'Mobility',
      badgeClass: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    };
  }
  if (norm.includes('sport') || norm.includes('basketball') || norm.includes('football') || norm.includes('tennis')) {
    return {
      label: 'Sports',
      badgeClass: 'text-purple-300 bg-purple-400/10 border-purple-400/30',
    };
  }
  return {
    label: WORKOUT_TYPE_LABELS[norm] || workoutType || 'Strength',
    badgeClass: 'text-[#43D9A3] bg-[#43D9A3]/10 border-[#43D9A3]/30',
  };
}
