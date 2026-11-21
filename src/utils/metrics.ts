import {
  StudySession,
  Habit,
  HabitCompletion,
  WorkoutSession,
  Chapter,
  DateRangeFilter,
  TestRecord,
  TestError,
  ExamType,
  ErrorType,
} from '../types';
import {
  parseLocalDate,
  formatMonthDay,
  getDateRangeStartDate,
  getPrecedingDateRange,
} from './dates';
import { calculateDailyHabitCompletion } from './habitSchedule';

/**
 * Metric calculations for NEUROCORE Dashboard, Study Log & Test Log
 */

// Format total minutes into a human-readable duration string (e.g. "3h 15m" or "45m")
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

// Convert hours and minutes inputs to total minutes
export function toTotalMinutes(hours: number, minutes: number): number {
  return (Math.max(0, hours) * 60) + Math.max(0, minutes);
}

// Sum total study minutes for a given date string, return hours as a number rounded to 1 decimal
export function calculateStudyHours(sessions: StudySession[], dateString: string): number {
  const daySessions = sessions.filter(s => s.date === dateString);
  const totalMinutes = daySessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  return Math.round((totalMinutes / 60) * 10) / 10;
}

// Sum questions solved / attempted for a given date string
export function calculateQuestionsSolved(sessions: StudySession[], dateString: string): number {
  const daySessions = sessions.filter(s => s.date === dateString);
  return daySessions.reduce((acc, curr) => {
    const qCount = curr.questionsAttempted ?? curr.questionsSolved ?? 0;
    return acc + qCount;
  }, 0);
}

// Filter sessions within a given DateRangeFilter
export function filterSessionsByRange(
  sessions: StudySession[],
  filter: DateRangeFilter,
  todayString: string
): StudySession[] {
  if (filter === 'all') return sessions;
  const startDate = getDateRangeStartDate(filter, todayString);
  if (!startDate) return sessions;
  return sessions.filter(s => s.date >= startDate && s.date <= todayString);
}

// Filter sessions in the preceding equivalent period
export function filterSessionsByPrecedingRange(
  sessions: StudySession[],
  filter: DateRangeFilter,
  todayString: string
): StudySession[] {
  const preceding = getPrecedingDateRange(filter, todayString);
  if (!preceding) return [];
  return sessions.filter(s => s.date >= preceding.start && s.date <= preceding.end);
}

// Aggregate daily study hours for chart display over a continuous series of dates
export function aggregateDailyStudyHours(
  sessions: StudySession[],
  dates: string[]
): { date: string; formattedDate: string; hours: number; minutes: number; sessionCount: number }[] {
  return dates.map(d => {
    const daySessions = sessions.filter(s => s.date === d);
    const totalMinutes = daySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const hours = Math.round((totalMinutes / 60) * 10) / 10;
    return {
      date: d,
      formattedDate: formatMonthDay(d),
      hours,
      minutes: totalMinutes,
      sessionCount: daySessions.length,
    };
  });
}

// Aggregate daily questions for chart display
export function aggregateDailyQuestions(
  sessions: StudySession[],
  dates: string[]
): { date: string; formattedDate: string; attempted: number; correct: number }[] {
  return dates.map(d => {
    const daySessions = sessions.filter(s => s.date === d);
    const attempted = daySessions.reduce((sum, s) => sum + (s.questionsAttempted ?? s.questionsSolved ?? 0), 0);
    const correct = daySessions.reduce((sum, s) => sum + (s.questionsCorrect ?? 0), 0);
    return {
      date: d,
      formattedDate: formatMonthDay(d),
      attempted,
      correct,
    };
  });
}

/**
 * Mastery calculation for chapters:
 * Nil = 0%, Mains = 33%, Advanced = 67%, Extreme = 100%
 */
export function calculateMasteryProgress(chapters: Chapter[]): number {
  if (!chapters || chapters.length === 0) return 0;
  const weights: Record<string, number> = {
    nil: 0,
    mains: 33.33,
    advanced: 66.67,
    extreme: 100,
  };
  const sum = chapters.reduce((acc, ch) => acc + (weights[ch.mastery] || 0), 0);
  return Math.min(100, Math.round(sum / chapters.length));
}

// Calculate subject statistics from its chapters
export function getSubjectChapterStats(chapters: Chapter[], subjectId: string): {
  total: number;
  weak: number;
  instantRevision: number;
  masteryProgress: number;
} {
  const subjectChapters = chapters.filter(c => c.subjectId === subjectId);
  const total = subjectChapters.length;
  const weak = subjectChapters.filter(c => c.isWeak).length;
  const instantRevision = subjectChapters.filter(c => c.needsInstantRevision).length;
  const masteryProgress = calculateMasteryProgress(subjectChapters);

  return { total, weak, instantRevision, masteryProgress };
}

// Default maximum marks by test type
export function getDefaultTotalMarks(examType: ExamType): number {
  return examType === 'Mains' ? 300 : 360;
}

// Calculate test percentage
export function calculateTestPercentage(marksObtained: number, totalMarks: number): number {
  if (totalMarks <= 0) return 0;
  const pct = (marksObtained / totalMarks) * 100;
  return Math.round(pct * 10) / 10;
}

// Calculate normalized average percentage across a set of tests
export function calculateNormalizedAverage(tests: TestRecord[]): number {
  if (tests.length === 0) return 0;
  const totalPct = tests.reduce((sum, t) => sum + calculateTestPercentage(t.marksObtained, t.totalMarks), 0);
  return Math.round((totalPct / tests.length) * 10) / 10;
}

// Calculate type-specific test statistics
export function calculateExamTypeStats(tests: TestRecord[], type: ExamType): {
  count: number;
  avgMarks: number;
  avgPercentage: number;
  highestMarks: number;
} {
  const filtered = tests.filter(t => t.examType === type);
  if (filtered.length === 0) {
    return { count: 0, avgMarks: 0, avgPercentage: 0, highestMarks: 0 };
  }

  const totalMarksSum = filtered.reduce((sum, t) => sum + t.marksObtained, 0);
  const totalPctSum = filtered.reduce((sum, t) => sum + calculateTestPercentage(t.marksObtained, t.totalMarks), 0);
  const highestMarks = Math.max(...filtered.map(t => t.marksObtained));

  return {
    count: filtered.length,
    avgMarks: Math.round((totalMarksSum / filtered.length) * 10) / 10,
    avgPercentage: Math.round((totalPctSum / filtered.length) * 10) / 10,
    highestMarks,
  };
}

// Error type label map
export const ERROR_TYPE_LABELS: Record<ErrorType, string> = {
  conceptual: 'Conceptual Gap',
  calculation: 'Calculation Error',
  silly: 'Silly Mistake',
  'time-management': 'Time Management',
  'misread-question': 'Misread Question',
  guess: 'Guessing Error',
  unattempted: 'Unattempted',
  other: 'Other',
};

// Error type styling
export function getErrorTypeBadgeStyle(type: ErrorType): {
  label: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
} {
  const label = ERROR_TYPE_LABELS[type] || 'Other';
  switch (type) {
    case 'conceptual':
      return { label, textClass: 'text-amber-400', bgClass: 'bg-amber-400/10', borderClass: 'border-amber-400/30' };
    case 'calculation':
      return { label, textClass: 'text-rose-400', bgClass: 'bg-rose-400/10', borderClass: 'border-rose-400/30' };
    case 'silly':
      return { label, textClass: 'text-orange-400', bgClass: 'bg-orange-400/10', borderClass: 'border-orange-400/30' };
    case 'time-management':
      return { label, textClass: 'text-cyan-400', bgClass: 'bg-cyan-400/10', borderClass: 'border-cyan-400/30' };
    case 'misread-question':
      return { label, textClass: 'text-purple-300', bgClass: 'bg-purple-400/10', borderClass: 'border-purple-400/30' };
    case 'guess':
      return { label, textClass: 'text-pink-400', bgClass: 'bg-pink-400/10', borderClass: 'border-pink-400/30' };
    case 'unattempted':
      return { label, textClass: 'text-slate-400', bgClass: 'bg-slate-500/10', borderClass: 'border-slate-500/30' };
    case 'other':
    default:
      return { label, textClass: 'text-slate-300', bgClass: 'bg-slate-700/30', borderClass: 'border-slate-600' };
  }
}

// Calculate comprehensive error analytics across a set of error records
export function calculateErrorStats(errors: TestError[]): {
  total: number;
  resolved: number;
  unresolved: number;
  resolutionRate: number;
  topCategory: { type: ErrorType; count: number; label: string } | null;
  byType: Record<ErrorType, number>;
  bySubject: Record<string, number>;
} {
  const total = errors.length;
  const resolved = errors.filter(e => e.resolved).length;
  const unresolved = total - resolved;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

  const byType: Record<ErrorType, number> = {
    conceptual: 0,
    calculation: 0,
    silly: 0,
    'time-management': 0,
    'misread-question': 0,
    guess: 0,
    unattempted: 0,
    other: 0,
  };

  const bySubject: Record<string, number> = {};

  errors.forEach(e => {
    if (byType[e.errorType] !== undefined) {
      byType[e.errorType]++;
    } else {
      byType.other++;
    }

    if (e.subjectId) {
      bySubject[e.subjectId] = (bySubject[e.subjectId] || 0) + 1;
    }
  });

  // Find most frequent error type
  let maxCount = 0;
  let topType: ErrorType | null = null;
  (Object.keys(byType) as ErrorType[]).forEach(type => {
    if (byType[type] > maxCount) {
      maxCount = byType[type];
      topType = type;
    }
  });

  const topCategory = topType && maxCount > 0
    ? { type: topType, count: maxCount, label: ERROR_TYPE_LABELS[topType] }
    : null;

  return {
    total,
    resolved,
    unresolved,
    resolutionRate,
    topCategory,
    byType,
    bySubject,
  };
}

// Get count of mistakes for a specific test
export function getTestErrorCounts(testId: string, errors: TestError[]): {
  total: number;
  resolved: number;
  unresolved: number;
} {
  const testErrors = errors.filter(e => e.testId === testId);
  const total = testErrors.length;
  const resolved = testErrors.filter(e => e.resolved).length;
  return {
    total,
    resolved,
    unresolved: total - resolved,
  };
}

// Count completed habits for today vs scheduled habits
export function calculateHabitsProgress(
  habits: Habit[],
  completions: HabitCompletion[],
  dateString: string
): { completed: number; total: number; percentage: number } {
  const result = calculateDailyHabitCompletion(habits, completions, dateString);
  return {
    completed: result.completed,
    total: result.total,
    percentage: result.percentage,
  };
}

// Count workout sessions for a given date
export function calculateWorkoutSessions(workouts: WorkoutSession[], dateString: string): {
  count: number;
  totalMinutes: number;
  latestWorkoutType?: string;
} {
  const dayWorkouts = workouts.filter(w => w.date === dateString);
  const count = dayWorkouts.length;
  const totalMinutes = dayWorkouts.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const latestWorkoutType = dayWorkouts[dayWorkouts.length - 1]?.workoutType;
  return { count, totalMinutes, latestWorkoutType };
}

// Clamp goal progress between 0 and 100
export function clampProgress(value: number): number {
  if (isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}
