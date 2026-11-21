import {
  Mood,
  EnergyLevel,
  ChecklistAnswer,
  DailyChecklist,
  ReflectionEntry,
  StudySession,
  TestRecord,
  Habit,
  HabitCompletion,
  WorkoutSession,
  Task,
} from '../types';
import {
  parseLocalDate,
  getTodayString,
  offsetDateString,
  formatMonthDay,
} from './dates';
import { isHabitScheduledOnDate, isHabitCompletedOnDate } from './habitSchedule';

// Mood definitions
export const MOOD_CONFIG: Record<
  Mood,
  { label: string; textClass: string; bgClass: string; borderClass: string; emoji: string }
> = {
  great: {
    label: 'Great',
    textClass: 'text-emerald-400',
    bgClass: 'bg-emerald-400/10',
    borderClass: 'border-emerald-400/30',
    emoji: '😊',
  },
  good: {
    label: 'Good',
    textClass: 'text-sky-400',
    bgClass: 'bg-sky-400/10',
    borderClass: 'border-sky-400/30',
    emoji: '🙂',
  },
  neutral: {
    label: 'Neutral',
    textClass: 'text-slate-300',
    bgClass: 'bg-slate-500/10',
    borderClass: 'border-slate-500/30',
    emoji: '😐',
  },
  difficult: {
    label: 'Difficult',
    textClass: 'text-amber-400',
    bgClass: 'bg-amber-400/10',
    borderClass: 'border-amber-400/30',
    emoji: '😣',
  },
  low: {
    label: 'Low',
    textClass: 'text-rose-400',
    bgClass: 'bg-rose-400/10',
    borderClass: 'border-rose-400/30',
    emoji: '😔',
  },
};

// Energy definitions
export const ENERGY_CONFIG: Record<
  EnergyLevel,
  { label: string; level: number; textClass: string; bgClass: string }
> = {
  very_low: { label: 'Very Low', level: 1, textClass: 'text-rose-400', bgClass: 'bg-rose-500/10' },
  low: { label: 'Low', level: 2, textClass: 'text-amber-400', bgClass: 'bg-amber-500/10' },
  moderate: { label: 'Moderate', level: 3, textClass: 'text-sky-400', bgClass: 'bg-sky-500/10' },
  high: { label: 'High', level: 4, textClass: 'text-[#9B7BFF]', bgClass: 'bg-[#9B7BFF]/10' },
  very_high: { label: 'Very High', level: 5, textClass: 'text-[#43D9A3]', bgClass: 'bg-[#43D9A3]/10' },
};

// Checklist configuration
export const CHECKLIST_ITEMS: { key: keyof DailyChecklist; label: string }[] = [
  { key: 'reviewedLearning', label: 'Did I review what I learned today?' },
  { key: 'taskProgress', label: 'Did I make progress on an important task?' },
  { key: 'physicalWellbeing', label: 'Did I take care of my physical well-being?' },
  { key: 'reflectedOnMistake', label: 'Did I reflect on a mistake or lesson?' },
  { key: 'identifiedNextStep', label: 'Have I identified a useful next step?' },
];

export const CHECKLIST_ANSWER_CONFIG: Record<
  ChecklistAnswer,
  { label: string; textClass: string; bgClass: string; borderClass: string }
> = {
  yes: {
    label: 'Yes',
    textClass: 'text-[#43D9A3]',
    bgClass: 'bg-[#43D9A3]/10',
    borderClass: 'border-[#43D9A3]/30',
  },
  partly: {
    label: 'Partly',
    textClass: 'text-amber-400',
    bgClass: 'bg-amber-400/10',
    borderClass: 'border-amber-400/30',
  },
  not_yet: {
    label: 'Not yet',
    textClass: 'text-rose-400',
    bgClass: 'bg-rose-400/10',
    borderClass: 'border-rose-400/30',
  },
  skipped: {
    label: 'Skipped',
    textClass: 'text-[#8E8EA0]',
    bgClass: 'bg-[#1B1B26]',
    borderClass: 'border-[#292936]',
  },
};

// Standard reflection prompts catalog
export interface PromptCategory {
  id: string;
  category: string;
  prompts: string[];
}

export const REFLECTION_PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: 'daily',
    category: 'Daily Review',
    prompts: [
      'What went well today?',
      'What was difficult, and what did it teach me?',
      'What is one thing I want to improve tomorrow?',
      'What am I grateful for today?',
      'What is one thing I handled better than before?',
    ],
  },
  {
    id: 'study',
    category: 'Study Reflection',
    prompts: [
      'What did I understand well today?',
      'Which concept needs another revision?',
      'What mistake taught me the most?',
      'Did I use my study time intentionally?',
      'What is the most important next step for my preparation?',
    ],
  },
  {
    id: 'habits',
    category: 'Habits & Routines',
    prompts: [
      'Which habit supported my day the most?',
      'What made my routine easier or harder to follow?',
      'What small adjustment could make tomorrow smoother?',
    ],
  },
  {
    id: 'weekly',
    category: 'Weekly Review',
    prompts: [
      'What progress am I proud of this week?',
      'What repeatedly distracted me?',
      'Which strategy worked best?',
      'What should I stop, continue, or start next week?',
    ],
  },
];

/**
 * Calculates reflection streak metrics strictly from saved entries.
 * Definition:
 * Consecutive calendar days with at least one saved entry, ending today (if today has an entry)
 * or ending yesterday (if today's entry hasn't been written yet).
 * Multiple entries on the same date count as 1 day for streak purposes.
 */
export function calculateReflectionStreak(
  entries: ReflectionEntry[],
  todayStr: string = getTodayString()
): {
  currentStreak: number;
  longestStreak: number;
  hasEntryToday: boolean;
  totalDaysWithEntries: number;
  latestEntryDate: string | null;
} {
  if (!entries || entries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      hasEntryToday: false,
      totalDaysWithEntries: 0,
      latestEntryDate: null,
    };
  }

  // Set of unique dates with at least 1 entry
  const dateSet = new Set(entries.map(e => e.date));
  const uniqueDates = Array.from(dateSet).sort().reverse(); // descending

  const hasEntryToday = dateSet.has(todayStr);
  const latestEntryDate = uniqueDates[0] || null;

  // Compute current streak
  let currentStreak = 0;
  let checkDate = hasEntryToday ? todayStr : offsetDateString(todayStr, -1);

  while (dateSet.has(checkDate)) {
    currentStreak++;
    checkDate = offsetDateString(checkDate, -1);
  }

  // Compute longest historical streak
  let longestStreak = 0;
  let tempStreak = 0;
  const sortedDatesAsc = Array.from(dateSet).sort();

  for (let i = 0; i < sortedDatesAsc.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = sortedDatesAsc[i - 1];
      const expectedDate = offsetDateString(prevDate, 1);
      if (sortedDatesAsc[i] === expectedDate) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  return {
    currentStreak,
    longestStreak,
    hasEntryToday,
    totalDaysWithEntries: dateSet.size,
    latestEntryDate,
  };
}

/**
 * Aggregates read-only contextual summary of today's recorded activity
 * across all existing modules. Does NOT mutate or write any records.
 */
export function getContextualDayActivity(
  dateStr: string,
  studySessions: StudySession[],
  tests: TestRecord[],
  habits: Habit[],
  completions: HabitCompletion[],
  workouts: WorkoutSession[],
  tasks: Task[]
): {
  studyMinutes: number;
  studyHours: number;
  questionsCount: number;
  testsTaken: number;
  habitsCompleted: number;
  habitsScheduled: number;
  workoutsCount: number;
  tasksCompleted: number;
  tasksTotal: number;
} {
  // Study
  const daySessions = studySessions.filter(s => s.date === dateStr);
  const studyMinutes = daySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const studyHours = Math.round((studyMinutes / 60) * 10) / 10;
  const questionsCount = daySessions.reduce(
    (acc, s) => acc + (s.questionsAttempted ?? s.questionsSolved ?? 0),
    0
  );

  // Tests
  const testsTaken = tests.filter(t => t.date === dateStr).length;

  // Habits
  let habitsScheduled = 0;
  let habitsCompleted = 0;
  habits.forEach(h => {
    if (isHabitScheduledOnDate(h, dateStr)) {
      habitsScheduled++;
      if (isHabitCompletedOnDate(h.id, dateStr, completions)) {
        habitsCompleted++;
      }
    }
  });

  // Workouts
  const workoutsCount = workouts.filter(w => w.date === dateStr).length;

  // Tasks
  const dayTasks = tasks.filter(t => t.dueDate === dateStr);
  const tasksTotal = dayTasks.length;
  const tasksCompleted = dayTasks.filter(t => t.completed).length;

  return {
    studyMinutes,
    studyHours,
    questionsCount,
    testsTaken,
    habitsCompleted,
    habitsScheduled,
    workoutsCount,
    tasksCompleted,
    tasksTotal,
  };
}
