import {
  StudySession,
  Subject,
  Chapter,
  TestRecord,
  TestError,
  ExamType,
  ErrorType,
  WorkoutSession,
  WeightEntry,
  BodyMeasurementEntry,
  FitnessSettings,
  Habit,
  HabitCompletion,
  Task,
  Goal,
  MonthlyOutcome,
} from '../types';
import {
  parseLocalDate,
  formatLocalDate,
  formatShortDate,
  formatMonthDay,
  formatMonthYear,
  getTodayString,
  offsetDateString,
  generateDateSeries,
  getDaysDifference,
} from './dates';
import { isHabitScheduledOnDate, isHabitCompletedOnDate } from './habitSchedule';
import { calculateTestPercentage, ERROR_TYPE_LABELS } from './metrics';

export type AnalyticsRangePreset =
  | 'last-7d'
  | 'last-30d'
  | 'last-90d'
  | 'this-month'
  | 'prev-month'
  | 'this-year'
  | 'all-time'
  | 'custom';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  label: string;
  preset: AnalyticsRangePreset;
  dayCount: number;
}

export interface PeriodComparison<T = number> {
  current: T;
  previous: T | null;
  absoluteChange: number | null;
  percentageChange: number | null;
  status: 'positive' | 'negative' | 'neutral' | 'na';
  label: string;
}

/**
 * Calculates start and end dates for any analytics range preset.
 */
export function getAnalyticsDateRange(
  preset: AnalyticsRangePreset,
  customStart?: string,
  customEnd?: string,
  todayStr: string = getTodayString()
): DateRange {
  const today = parseLocalDate(todayStr);

  switch (preset) {
    case 'last-7d': {
      const startDate = offsetDateString(todayStr, -6);
      return {
        startDate,
        endDate: todayStr,
        label: 'Last 7 Days',
        preset,
        dayCount: 7,
      };
    }

    case 'last-30d': {
      const startDate = offsetDateString(todayStr, -29);
      return {
        startDate,
        endDate: todayStr,
        label: 'Last 30 Days',
        preset,
        dayCount: 30,
      };
    }

    case 'last-90d': {
      const startDate = offsetDateString(todayStr, -89);
      return {
        startDate,
        endDate: todayStr,
        label: 'Last 90 Days',
        preset,
        dayCount: 90,
      };
    }

    case 'this-month': {
      const year = today.getFullYear();
      const month = today.getMonth();
      const startDate = formatLocalDate(new Date(year, month, 1));
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = formatLocalDate(new Date(year, month, lastDay));
      const dayCount = getDaysDifference(endDate, startDate) + 1;
      return {
        startDate,
        endDate,
        label: 'This Month',
        preset,
        dayCount,
      };
    }

    case 'prev-month': {
      const year = today.getFullYear();
      const month = today.getMonth();
      const firstOfPrevMonth = new Date(year, month - 1, 1);
      const startDate = formatLocalDate(firstOfPrevMonth);
      const lastDayOfPrevMonth = new Date(year, month, 0).getDate();
      const endDate = formatLocalDate(new Date(year, month - 1, lastDayOfPrevMonth));
      const dayCount = getDaysDifference(endDate, startDate) + 1;
      return {
        startDate,
        endDate,
        label: 'Previous Month',
        preset,
        dayCount,
      };
    }

    case 'this-year': {
      const year = today.getFullYear();
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      const dayCount = getDaysDifference(endDate, startDate) + 1;
      return {
        startDate,
        endDate,
        label: 'This Year',
        preset,
        dayCount,
      };
    }

    case 'all-time': {
      // Default to 180 days ago if no data, or early 2026
      const startDate = '2026-01-01';
      const endDate = todayStr;
      const dayCount = Math.max(1, getDaysDifference(endDate, startDate) + 1);
      return {
        startDate,
        endDate,
        label: 'All Time',
        preset,
        dayCount,
      };
    }

    case 'custom': {
      const start = customStart && customStart <= (customEnd || todayStr) ? customStart : offsetDateString(todayStr, -29);
      const end = customEnd && customEnd >= start ? customEnd : todayStr;
      const dayCount = Math.max(1, getDaysDifference(end, start) + 1);
      return {
        startDate: start,
        endDate: end,
        label: 'Custom Range',
        preset,
        dayCount,
      };
    }
  }
}

/**
 * Returns the immediately preceding equivalent period for comparison.
 */
export function getPrecedingDateRangeForAnalytics(
  range: DateRange,
  todayStr: string = getTodayString()
): { startDate: string; endDate: string; dayCount: number } | null {
  if (range.preset === 'all-time') {
    return null;
  }

  if (range.preset === 'this-month') {
    // Preceding is previous month
    const start = parseLocalDate(range.startDate);
    const prevMonthFirst = new Date(start.getFullYear(), start.getMonth() - 1, 1);
    const prevMonthLastDay = new Date(start.getFullYear(), start.getMonth(), 0).getDate();
    const prevMonthEnd = new Date(start.getFullYear(), start.getMonth() - 1, prevMonthLastDay);
    return {
      startDate: formatLocalDate(prevMonthFirst),
      endDate: formatLocalDate(prevMonthEnd),
      dayCount: prevMonthLastDay,
    };
  }

  if (range.preset === 'prev-month') {
    // Preceding is two months ago
    const start = parseLocalDate(range.startDate);
    const twoMonthsFirst = new Date(start.getFullYear(), start.getMonth() - 1, 1);
    const twoMonthsLastDay = new Date(start.getFullYear(), start.getMonth(), 0).getDate();
    const twoMonthsEnd = new Date(start.getFullYear(), start.getMonth() - 1, twoMonthsLastDay);
    return {
      startDate: formatLocalDate(twoMonthsFirst),
      endDate: formatLocalDate(twoMonthsEnd),
      dayCount: twoMonthsLastDay,
    };
  }

  if (range.preset === 'this-year') {
    const year = parseLocalDate(range.startDate).getFullYear() - 1;
    return {
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      dayCount: 365,
    };
  }

  // For arbitrary day count (e.g. 7d, 30d, 90d, custom):
  // Preceding end date is 1 day before current start date
  const precedingEnd = offsetDateString(range.startDate, -1);
  const precedingStart = offsetDateString(precedingEnd, -(range.dayCount - 1));

  return {
    startDate: precedingStart,
    endDate: precedingEnd,
    dayCount: range.dayCount,
  };
}

/**
 * Shifts date range forward or backward by its day length.
 */
export function shiftDateRange(
  range: DateRange,
  direction: 'prev' | 'next'
): { startDate: string; endDate: string } {
  const delta = direction === 'next' ? range.dayCount : -range.dayCount;

  if (range.preset === 'this-month' || range.preset === 'prev-month') {
    const start = parseLocalDate(range.startDate);
    const monthDelta = direction === 'next' ? 1 : -1;
    const newMonthFirst = new Date(start.getFullYear(), start.getMonth() + monthDelta, 1);
    const newMonthLastDay = new Date(start.getFullYear(), start.getMonth() + monthDelta + 1, 0).getDate();
    const newMonthEnd = new Date(start.getFullYear(), start.getMonth() + monthDelta, newMonthLastDay);
    return {
      startDate: formatLocalDate(newMonthFirst),
      endDate: formatLocalDate(newMonthEnd),
    };
  }

  return {
    startDate: offsetDateString(range.startDate, delta),
    endDate: offsetDateString(range.endDate, delta),
  };
}

/**
 * Pure helper to compute comparative percentage change between two values.
 */
export function computePeriodComparison(
  current: number,
  previous: number | null | undefined,
  invertGoodBad = false
): PeriodComparison {
  if (previous === null || previous === undefined || isNaN(previous)) {
    return {
      current,
      previous: null,
      absoluteChange: null,
      percentageChange: null,
      status: 'na',
      label: 'No prior period data',
    };
  }

  const absoluteChange = Math.round((current - previous) * 10) / 10;

  if (previous === 0) {
    if (current === 0) {
      return {
        current,
        previous,
        absoluteChange: 0,
        percentageChange: 0,
        status: 'neutral',
        label: 'No change (0 vs 0)',
      };
    }
    return {
      current,
      previous,
      absoluteChange,
      percentageChange: null,
      status: current > 0 ? (invertGoodBad ? 'negative' : 'positive') : 'neutral',
      label: `+${current} from 0`,
    };
  }

  const percentageChange = Math.round(((current - previous) / Math.abs(previous)) * 100);

  let status: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (percentageChange > 0) {
    status = invertGoodBad ? 'negative' : 'positive';
  } else if (percentageChange < 0) {
    status = invertGoodBad ? 'positive' : 'negative';
  }

  const sign = percentageChange > 0 ? '+' : '';
  const label = `${sign}${percentageChange}% vs prior`;

  return {
    current,
    previous,
    absoluteChange,
    percentageChange,
    status,
    label,
  };
}

// ----------------------------------------------------
// STUDY ANALYTICS CALCULATIONS
// ----------------------------------------------------

export interface StudyMetricsResult {
  totalMinutes: number;
  totalHours: number;
  formattedHours: string;
  totalQuestions: number;
  questionsCorrect: number;
  accuracyPercentage: number | null;
  totalSessions: number;
  activeStudyDays: number;
  avgMinutesPerActiveDay: number;
  avgHoursPerActiveDay: number;
  revisionSessionsCount: number;
  revisionPercentage: number;
  mostStudiedSubject: { id: string; name: string; minutes: number; percentage: number } | null;
  highestStudyDay: { date: string; formattedDate: string; hours: number } | null;
}

export function calculateStudyMetrics(
  sessions: StudySession[],
  subjects: Subject[],
  startDate: string,
  endDate: string
): StudyMetricsResult {
  const filtered = sessions.filter(s => s.date >= startDate && s.date <= endDate);

  const totalMinutes = filtered.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const hoursPart = Math.floor(totalMinutes / 60);
  const minsPart = totalMinutes % 60;
  const formattedHours = hoursPart > 0 ? `${hoursPart}h ${minsPart}m` : `${minsPart}m`;

  const totalQuestions = filtered.reduce(
    (acc, s) => acc + (s.questionsAttempted ?? s.questionsSolved ?? 0),
    0
  );
  const questionsCorrect = filtered.reduce((acc, s) => acc + (s.questionsCorrect ?? 0), 0);
  const accuracyPercentage =
    totalQuestions > 0 ? Math.round((questionsCorrect / totalQuestions) * 100) : null;

  const totalSessions = filtered.length;

  // Active study days
  const activeDaysSet = new Set(filtered.filter(s => s.durationMinutes > 0).map(s => s.date));
  const activeStudyDays = activeDaysSet.size;
  const avgMinutesPerActiveDay =
    activeStudyDays > 0 ? Math.round(totalMinutes / activeStudyDays) : 0;
  const avgHoursPerActiveDay =
    Math.round((avgMinutesPerActiveDay / 60) * 10) / 10;

  // Revision sessions
  const revisionSessionsCount = filtered.filter(
    s => s.activityType === 'revision' || s.activityType === 'mock_analysis'
  ).length;
  const revisionPercentage =
    totalSessions > 0 ? Math.round((revisionSessionsCount / totalSessions) * 100) : 0;

  // Most studied subject
  const subjectTimeMap: Record<string, number> = {};
  filtered.forEach(s => {
    const id = s.subjectId || 'subj-other';
    subjectTimeMap[id] = (subjectTimeMap[id] || 0) + (s.durationMinutes || 0);
  });

  let topSubjId: string | null = null;
  let topMinutes = 0;
  Object.keys(subjectTimeMap).forEach(id => {
    if (subjectTimeMap[id] > topMinutes) {
      topMinutes = subjectTimeMap[id];
      topSubjId = id;
    }
  });

  let mostStudiedSubject: StudyMetricsResult['mostStudiedSubject'] = null;
  if (topSubjId && topMinutes > 0) {
    const found = subjects.find(s => s.id === topSubjId);
    const name = found ? found.name : topSubjId;
    const pct = totalMinutes > 0 ? Math.round((topMinutes / totalMinutes) * 100) : 0;
    mostStudiedSubject = { id: topSubjId, name, minutes: topMinutes, percentage: pct };
  }

  // Highest study day
  const dailyTimeMap: Record<string, number> = {};
  filtered.forEach(s => {
    dailyTimeMap[s.date] = (dailyTimeMap[s.date] || 0) + (s.durationMinutes || 0);
  });

  let highestDate: string | null = null;
  let maxDayMinutes = 0;
  Object.keys(dailyTimeMap).forEach(d => {
    if (dailyTimeMap[d] > maxDayMinutes) {
      maxDayMinutes = dailyTimeMap[d];
      highestDate = d;
    }
  });

  const highestStudyDay =
    highestDate && maxDayMinutes > 0
      ? {
          date: highestDate,
          formattedDate: formatMonthDay(highestDate),
          hours: Math.round((maxDayMinutes / 60) * 10) / 10,
        }
      : null;

  return {
    totalMinutes,
    totalHours,
    formattedHours,
    totalQuestions,
    questionsCorrect,
    accuracyPercentage,
    totalSessions,
    activeStudyDays,
    avgMinutesPerActiveDay,
    avgHoursPerActiveDay,
    revisionSessionsCount,
    revisionPercentage,
    mostStudiedSubject,
    highestStudyDay,
  };
}

/**
 * Builds study timeline series (daily or aggregated).
 */
export function buildStudyTimeSeries(
  sessions: StudySession[],
  startDate: string,
  endDate: string,
  dayCount: number
): {
  date: string;
  formattedDate: string;
  hours: number;
  minutes: number;
  questions: number;
}[] {
  const dates = generateDateSeries(startDate, endDate);

  return dates.map(d => {
    const daySessions = sessions.filter(s => s.date === d);
    const minutes = daySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const questions = daySessions.reduce(
      (acc, s) => acc + (s.questionsAttempted ?? s.questionsSolved ?? 0),
      0
    );
    return {
      date: d,
      formattedDate: dayCount > 35 ? formatShortDate(d) : formatMonthDay(d),
      hours: Math.round((minutes / 60) * 10) / 10,
      minutes,
      questions,
    };
  });
}

/**
 * Builds subject distribution breakdown.
 */
export function buildSubjectDistribution(
  sessions: StudySession[],
  subjects: Subject[],
  startDate: string,
  endDate: string
): {
  id: string;
  name: string;
  minutes: number;
  hours: number;
  percentage: number;
  questions: number;
  sessionsCount: number;
  color: string;
}[] {
  const filtered = sessions.filter(s => s.date >= startDate && s.date <= endDate);
  const totalMinutes = filtered.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  const subjectMap = new Map<string, Subject>();
  subjects.forEach(s => subjectMap.set(s.id, s));

  const statsMap: Record<string, { minutes: number; questions: number; count: number }> = {};

  filtered.forEach(s => {
    const subjId = s.subjectId || 'subj-other';
    if (!statsMap[subjId]) {
      statsMap[subjId] = { minutes: 0, questions: 0, count: 0 };
    }
    statsMap[subjId].minutes += s.durationMinutes || 0;
    statsMap[subjId].questions += s.questionsAttempted ?? s.questionsSolved ?? 0;
    statsMap[subjId].count += 1;
  });

  const subjectColors = [
    '#9B7BFF', // Purple
    '#43D9A3', // Green
    '#38BDF8', // Sky Blue
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#8B5CF6', // Violet
  ];

  return Object.keys(statsMap)
    .map((subjId, idx) => {
      const item = statsMap[subjId];
      const subj = subjectMap.get(subjId);
      const name = subj ? subj.name : subjId === 'subj-other' ? 'Other' : subjId;
      const hours = Math.round((item.minutes / 60) * 10) / 10;
      const percentage = totalMinutes > 0 ? Math.round((item.minutes / totalMinutes) * 100) : 0;
      const color = subjectColors[idx % subjectColors.length];

      return {
        id: subjId,
        name,
        minutes: item.minutes,
        hours,
        percentage,
        questions: item.questions,
        sessionsCount: item.count,
        color,
      };
    })
    .sort((a, b) => b.minutes - a.minutes);
}

// ----------------------------------------------------
// TEST & EXAM ANALYTICS CALCULATIONS
// ----------------------------------------------------

export interface TestMetricsResult {
  totalTests: number;
  totalMarksObtained: number;
  totalMaxMarks: number;
  weightedAveragePercentage: number;
  bestPercentage: number;
  mainsCount: number;
  mainsAvgPercentage: number;
  mainsBestPercentage: number;
  advancedCount: number;
  advancedAvgPercentage: number;
  advancedBestPercentage: number;
  testsList: TestRecord[];
}

export function calculateTestMetrics(
  tests: TestRecord[],
  startDate: string,
  endDate: string
): TestMetricsResult {
  const filtered = tests
    .filter(t => t.date >= startDate && t.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalTests = filtered.length;

  if (totalTests === 0) {
    return {
      totalTests: 0,
      totalMarksObtained: 0,
      totalMaxMarks: 0,
      weightedAveragePercentage: 0,
      bestPercentage: 0,
      mainsCount: 0,
      mainsAvgPercentage: 0,
      mainsBestPercentage: 0,
      advancedCount: 0,
      advancedAvgPercentage: 0,
      advancedBestPercentage: 0,
      testsList: [],
    };
  }

  const validTests = filtered.filter(t => t.totalMarks > 0);
  const totalMarksObtained = validTests.reduce((sum, t) => sum + t.marksObtained, 0);
  const totalMaxMarks = validTests.reduce((sum, t) => sum + t.totalMarks, 0);

  // Weighted average: total obtained / total max marks * 100
  const weightedAveragePercentage =
    totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 1000) / 10 : 0;

  const percentages = validTests.map(t => calculateTestPercentage(t.marksObtained, t.totalMarks));
  const bestPercentage = percentages.length > 0 ? Math.max(...percentages) : 0;

  // Mains
  const mains = validTests.filter(t => t.examType === 'Mains');
  const mainsCount = mains.length;
  const mainsObtained = mains.reduce((sum, t) => sum + t.marksObtained, 0);
  const mainsMax = mains.reduce((sum, t) => sum + t.totalMarks, 0);
  const mainsAvgPercentage =
    mainsMax > 0 ? Math.round((mainsObtained / mainsMax) * 1000) / 10 : 0;
  const mainsPcts = mains.map(t => calculateTestPercentage(t.marksObtained, t.totalMarks));
  const mainsBestPercentage = mainsPcts.length > 0 ? Math.max(...mainsPcts) : 0;

  // Advanced
  const advanced = validTests.filter(t => t.examType === 'Advanced');
  const advancedCount = advanced.length;
  const advObtained = advanced.reduce((sum, t) => sum + t.marksObtained, 0);
  const advMax = advanced.reduce((sum, t) => sum + t.totalMarks, 0);
  const advancedAvgPercentage =
    advMax > 0 ? Math.round((advObtained / advMax) * 1000) / 10 : 0;
  const advPcts = advanced.map(t => calculateTestPercentage(t.marksObtained, t.totalMarks));
  const advancedBestPercentage = advPcts.length > 0 ? Math.max(...advPcts) : 0;

  return {
    totalTests,
    totalMarksObtained,
    totalMaxMarks,
    weightedAveragePercentage,
    bestPercentage,
    mainsCount,
    mainsAvgPercentage,
    mainsBestPercentage,
    advancedCount,
    advancedAvgPercentage,
    advancedBestPercentage,
    testsList: filtered,
  };
}

export interface ErrorMetricsResult {
  totalErrors: number;
  resolvedCount: number;
  unresolvedCount: number;
  resolutionRate: number;
  categoryBreakdown: { type: ErrorType; label: string; count: number; percentage: number }[];
  subjectBreakdown: { subjectId: string; subjectName: string; count: number }[];
}

export function calculateErrorMetrics(
  errors: TestError[],
  tests: TestRecord[],
  subjects: Subject[],
  startDate: string,
  endDate: string
): ErrorMetricsResult {
  // Test error dates can be determined by the test date it belongs to, or createdAt
  const testMap = new Map<string, TestRecord>();
  tests.forEach(t => testMap.set(t.id, t));

  const filtered = errors.filter(e => {
    const parentTest = testMap.get(e.testId);
    const dateToCheck = parentTest ? parentTest.date : e.createdAt.slice(0, 10);
    return dateToCheck >= startDate && dateToCheck <= endDate;
  });

  const totalErrors = filtered.length;
  const resolvedCount = filtered.filter(e => e.resolved).length;
  const unresolvedCount = totalErrors - resolvedCount;
  const resolutionRate = totalErrors > 0 ? Math.round((resolvedCount / totalErrors) * 100) : 100;

  // Category breakdown
  const catCounts: Record<ErrorType, number> = {
    conceptual: 0,
    calculation: 0,
    silly: 0,
    'time-management': 0,
    'misread-question': 0,
    guess: 0,
    unattempted: 0,
    other: 0,
  };

  filtered.forEach(e => {
    if (catCounts[e.errorType] !== undefined) {
      catCounts[e.errorType]++;
    } else {
      catCounts.other++;
    }
  });

  const categoryBreakdown = (Object.keys(catCounts) as ErrorType[])
    .map(type => {
      const count = catCounts[type];
      const percentage = totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0;
      return {
        type,
        label: ERROR_TYPE_LABELS[type] || type,
        count,
        percentage,
      };
    })
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);

  // Subject breakdown
  const subjMap = new Map<string, Subject>();
  subjects.forEach(s => subjMap.set(s.id, s));
  const subjCounts: Record<string, number> = {};

  filtered.forEach(e => {
    if (e.subjectId) {
      subjCounts[e.subjectId] = (subjCounts[e.subjectId] || 0) + 1;
    }
  });

  const subjectBreakdown = Object.keys(subjCounts)
    .map(subjId => {
      const s = subjMap.get(subjId);
      return {
        subjectId: subjId,
        subjectName: s ? s.name : subjId,
        count: subjCounts[subjId],
      };
    })
    .sort((a, b) => b.count - a.count);

  return {
    totalErrors,
    resolvedCount,
    unresolvedCount,
    resolutionRate,
    categoryBreakdown,
    subjectBreakdown,
  };
}

// ----------------------------------------------------
// FITNESS ANALYTICS CALCULATIONS
// ----------------------------------------------------

export interface FitnessMetricsResult {
  totalWorkouts: number;
  totalWorkoutMinutes: number;
  workoutsByType: { type: string; count: number; percentage: number }[];
  latestWeightKg: number | null;
  earliestWeightKg: number | null;
  netWeightChangeKg: number | null;
  weightTrendSeries: { date: string; formattedDate: string; weightKg: number; weightDisplay: number }[];
  measurementTrendSeries: {
    date: string;
    formattedDate: string;
    waist?: number;
    chest?: number;
    hips?: number;
    arm?: number;
    thigh?: number;
  }[];
}

export function calculateFitnessMetrics(
  workouts: WorkoutSession[],
  weights: WeightEntry[],
  measurements: BodyMeasurementEntry[],
  settings: FitnessSettings,
  startDate: string,
  endDate: string
): FitnessMetricsResult {
  const filteredWorkouts = workouts.filter(w => w.date >= startDate && w.date <= endDate);
  const totalWorkouts = filteredWorkouts.length;
  const totalWorkoutMinutes = filteredWorkouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0);

  // Workouts by type
  const typeMap: Record<string, number> = {};
  filteredWorkouts.forEach(w => {
    const t = w.workoutType || 'strength';
    typeMap[t] = (typeMap[t] || 0) + 1;
  });

  const workoutsByType = Object.keys(typeMap)
    .map(type => ({
      type,
      count: typeMap[type],
      percentage: totalWorkouts > 0 ? Math.round((typeMap[type] / totalWorkouts) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Weights
  const filteredWeights = weights
    .filter(w => w.date >= startDate && w.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  const isLb = settings.displayWeightUnit === 'lb';
  const toDisplay = (kg: number) => (isLb ? Math.round(kg * 2.20462 * 10) / 10 : Math.round(kg * 10) / 10);

  const weightTrendSeries = filteredWeights.map(w => ({
    date: w.date,
    formattedDate: formatMonthDay(w.date),
    weightKg: w.weightKg,
    weightDisplay: toDisplay(w.weightKg),
  }));

  const earliestWeightKg = filteredWeights.length > 0 ? filteredWeights[0].weightKg : null;
  const latestWeightKg =
    filteredWeights.length > 0 ? filteredWeights[filteredWeights.length - 1].weightKg : null;
  const netWeightChangeKg =
    latestWeightKg !== null && earliestWeightKg !== null
      ? Math.round((latestWeightKg - earliestWeightKg) * 10) / 10
      : null;

  // Measurements
  const filteredMeasurements = measurements
    .filter(m => m.date >= startDate && m.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  const isInch = settings.displayLengthUnit === 'in';
  const toLengthDisplay = (cm?: number) => {
    if (cm === undefined || cm === null) return undefined;
    return isInch ? Math.round((cm / 2.54) * 10) / 10 : Math.round(cm * 10) / 10;
  };

  const measurementTrendSeries = filteredMeasurements.map(m => ({
    date: m.date,
    formattedDate: formatMonthDay(m.date),
    waist: toLengthDisplay(m.waistCm),
    chest: toLengthDisplay(m.chestCm),
    hips: toLengthDisplay(m.hipsCm),
    arm: toLengthDisplay(m.armCm),
    thigh: toLengthDisplay(m.thighCm),
  }));

  return {
    totalWorkouts,
    totalWorkoutMinutes,
    workoutsByType,
    latestWeightKg,
    earliestWeightKg,
    netWeightChangeKg,
    weightTrendSeries,
    measurementTrendSeries,
  };
}

// ----------------------------------------------------
// HABIT ANALYTICS CALCULATIONS
// ----------------------------------------------------

export interface PerHabitAnalytics {
  id: string;
  name: string;
  category: string;
  scheduledOccurrences: number;
  completedOccurrences: number;
  consistencyPercentage: number;
  isActive: boolean;
  isNonNegotiable: boolean;
}

export interface HabitAnalyticsResult {
  overallScheduled: number;
  overallCompleted: number;
  overallConsistency: number;
  habitsList: PerHabitAnalytics[];
  bestPerformingHabits: PerHabitAnalytics[];
  dailyTrendSeries: {
    date: string;
    formattedDate: string;
    scheduledCount: number;
    completedCount: number;
    percentage: number;
  }[];
}

export function calculateHabitsAnalytics(
  habits: Habit[],
  completions: HabitCompletion[],
  startDate: string,
  endDate: string,
  todayStr: string = getTodayString()
): HabitAnalyticsResult {
  // Cap date evaluation at today to not penalize future days
  const effectiveEnd = endDate > todayStr ? todayStr : endDate;
  const dates = startDate <= effectiveEnd ? generateDateSeries(startDate, effectiveEnd) : [];

  let overallScheduled = 0;
  let overallCompleted = 0;

  // Per habit map
  const habitMap: Record<
    string,
    { scheduled: number; completed: number; habit: Habit }
  > = {};

  habits.forEach(h => {
    habitMap[h.id] = { scheduled: 0, completed: 0, habit: h };
  });

  const dailyTrendSeries: HabitAnalyticsResult['dailyTrendSeries'] = [];

  dates.forEach(d => {
    let dayScheduled = 0;
    let dayCompleted = 0;

    habits.forEach(h => {
      if (isHabitScheduledOnDate(h, d)) {
        dayScheduled++;
        habitMap[h.id].scheduled++;

        if (isHabitCompletedOnDate(h.id, d, completions)) {
          dayCompleted++;
          habitMap[h.id].completed++;
        }
      }
    });

    overallScheduled += dayScheduled;
    overallCompleted += dayCompleted;

    const pct = dayScheduled > 0 ? Math.round((dayCompleted / dayScheduled) * 100) : 0;
    dailyTrendSeries.push({
      date: d,
      formattedDate: formatMonthDay(d),
      scheduledCount: dayScheduled,
      completedCount: dayCompleted,
      percentage: pct,
    });
  });

  const overallConsistency =
    overallScheduled > 0 ? Math.round((overallCompleted / overallScheduled) * 100) : 0;

  const habitsList: PerHabitAnalytics[] = habits
    .map(h => {
      const stats = habitMap[h.id] || { scheduled: 0, completed: 0 };
      const pct =
        stats.scheduled > 0 ? Math.round((stats.completed / stats.scheduled) * 100) : 0;
      return {
        id: h.id,
        name: h.name || h.title || 'Untitled Habit',
        category: h.category || 'discipline',
        scheduledOccurrences: stats.scheduled,
        completedOccurrences: stats.completed,
        consistencyPercentage: pct,
        isActive: h.isActive,
        isNonNegotiable: h.isNonNegotiable,
      };
    })
    .sort((a, b) => b.consistencyPercentage - a.consistencyPercentage);

  const bestPerformingHabits = habitsList
    .filter(h => h.scheduledOccurrences > 0)
    .slice(0, 5);

  return {
    overallScheduled,
    overallCompleted,
    overallConsistency,
    habitsList,
    bestPerformingHabits,
    dailyTrendSeries,
  };
}

// ----------------------------------------------------
// PRODUCTIVITY & PLANNING ANALYTICS CALCULATIONS
// ----------------------------------------------------

export interface ProductivityMetricsResult {
  tasksDueInPeriod: number;
  tasksCompletedInPeriod: number;
  taskCompletionRate: number;
  overdueTasksCount: number;
  tasksByPriority: { priority: string; count: number; completedCount: number }[];
  monthlyOutcomesSummary: {
    total: number;
    completed: number;
    percentage: number;
  };
  goalsSummary: {
    totalGoals: number;
    averageProgress: number;
    completedGoalsCount: number;
  };
}

export function calculateProductivityMetrics(
  tasks: Task[],
  outcomes: MonthlyOutcome[],
  goals: Goal[],
  startDate: string,
  endDate: string,
  todayStr: string = getTodayString()
): ProductivityMetricsResult {
  // Tasks due within range
  const dueTasks = tasks.filter(t => t.dueDate >= startDate && t.dueDate <= endDate);
  const tasksDueInPeriod = dueTasks.length;
  const tasksCompletedInPeriod = dueTasks.filter(t => t.completed).length;
  const taskCompletionRate =
    tasksDueInPeriod > 0 ? Math.round((tasksCompletedInPeriod / tasksDueInPeriod) * 100) : 0;

  // Overdue tasks: dueDate < today and not completed
  const overdueTasksCount = tasks.filter(t => t.dueDate < todayStr && !t.completed).length;

  // By Priority
  const priorityMap: Record<string, { total: number; completed: number }> = {
    high: { total: 0, completed: 0 },
    medium: { total: 0, completed: 0 },
    low: { total: 0, completed: 0 },
  };

  dueTasks.forEach(t => {
    const p = t.priority || 'medium';
    if (!priorityMap[p]) priorityMap[p] = { total: 0, completed: 0 };
    priorityMap[p].total++;
    if (t.completed) priorityMap[p].completed++;
  });

  const tasksByPriority = Object.keys(priorityMap).map(p => ({
    priority: p,
    count: priorityMap[p].total,
    completedCount: priorityMap[p].completed,
  }));

  // Monthly Outcomes (filter by months that intersect with range)
  const rangeMonths = new Set<string>();
  const dates = generateDateSeries(startDate, endDate);
  dates.forEach(d => rangeMonths.add(d.slice(0, 7)));

  const periodOutcomes = outcomes.filter(o => rangeMonths.has(o.month));
  const totalOutcomes = periodOutcomes.length;
  const completedOutcomes = periodOutcomes.filter(o => o.completed).length;
  const outcomePct = totalOutcomes > 0 ? Math.round((completedOutcomes / totalOutcomes) * 100) : 0;

  // Goals
  const totalGoals = goals.length;
  const averageProgress =
    totalGoals > 0 ? Math.round(goals.reduce((acc, g) => acc + (g.progress || 0), 0) / totalGoals) : 0;
  const completedGoalsCount = goals.filter(g => g.progress >= 100).length;

  return {
    tasksDueInPeriod,
    tasksCompletedInPeriod,
    taskCompletionRate,
    overdueTasksCount,
    tasksByPriority,
    monthlyOutcomesSummary: {
      total: totalOutcomes,
      completed: completedOutcomes,
      percentage: outcomePct,
    },
    goalsSummary: {
      totalGoals,
      averageProgress,
      completedGoalsCount,
    },
  };
}

// ----------------------------------------------------
// MONTHLY OVERVIEW MULTI-METRIC AGGREGATION
// ----------------------------------------------------

export interface MonthlyOverviewRow {
  monthKey: string; // YYYY-MM
  label: string; // e.g. "October 2026"
  isPartial: boolean;
  studyHours: number;
  questionsSolved: number;
  testsTaken: number;
  avgTestScore: number | null;
  workoutsCount: number;
  habitConsistency: number;
}

export function buildMonthlyOverview(
  sessions: StudySession[],
  tests: TestRecord[],
  workouts: WorkoutSession[],
  habits: Habit[],
  completions: HabitCompletion[],
  numberOfMonths = 6,
  todayStr: string = getTodayString()
): MonthlyOverviewRow[] {
  const currentMonthKey = todayStr.slice(0, 7);
  const rows: MonthlyOverviewRow[] = [];

  const today = parseLocalDate(todayStr);

  for (let i = numberOfMonths - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const lastDayOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const startDate = `${monthKey}-01`;
    const endDate = `${monthKey}-${String(lastDayOfMonth).padStart(2, '0')}`;

    const isPartial = monthKey === currentMonthKey;

    // Study
    const mSessions = sessions.filter(s => s.date >= startDate && s.date <= endDate);
    const studyMinutes = mSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const studyHours = Math.round((studyMinutes / 60) * 10) / 10;
    const questionsSolved = mSessions.reduce(
      (acc, s) => acc + (s.questionsAttempted ?? s.questionsSolved ?? 0),
      0
    );

    // Tests
    const mTests = tests.filter(t => t.date >= startDate && t.date <= endDate && t.totalMarks > 0);
    const testsTaken = mTests.length;
    let avgTestScore: number | null = null;
    if (testsTaken > 0) {
      const obtained = mTests.reduce((sum, t) => sum + t.marksObtained, 0);
      const totalMax = mTests.reduce((sum, t) => sum + t.totalMarks, 0);
      avgTestScore = totalMax > 0 ? Math.round((obtained / totalMax) * 1000) / 10 : null;
    }

    // Workouts
    const mWorkouts = workouts.filter(w => w.date >= startDate && w.date <= endDate);
    const workoutsCount = mWorkouts.length;

    // Habit consistency
    const habitStats = calculateHabitsAnalytics(
      habits,
      completions,
      startDate,
      endDate,
      todayStr
    );

    rows.push({
      monthKey,
      label: formatMonthYear(monthKey),
      isPartial,
      studyHours,
      questionsSolved,
      testsTaken,
      avgTestScore,
      workoutsCount,
      habitConsistency: habitStats.overallConsistency,
    });
  }

  return rows;
}
