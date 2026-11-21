import {
  Task,
  Goal,
  MonthlyOutcome,
  TestRecord,
  TestError,
  Subject,
  Chapter,
  StudySession,
  Habit,
  HabitSchedule,
  HabitCompletion,
  WorkoutSession,
  WorkoutRoutine,
  WeightEntry,
  BodyMeasurementEntry,
  FitnessSettings,
  ExamSettings,
  AppSettings,
  ReflectionEntry,
  WeeklyReview,
  SavedMentorReport,
  ChatMessage,
  MentorPrivacySettings,
} from '../types';
import { getInitialSeedData } from './seedData';

const STORAGE_PREFIX = 'neurocore_';

export const STORAGE_KEYS = {
  TASKS: `${STORAGE_PREFIX}tasks`,
  GOALS: `${STORAGE_PREFIX}goals`,
  MONTHLY_OUTCOMES: `${STORAGE_PREFIX}monthly_outcomes`,
  TESTS: `${STORAGE_PREFIX}tests`,
  TEST_ERRORS: `${STORAGE_PREFIX}test_errors`,
  SUBJECTS: `${STORAGE_PREFIX}subjects`,
  CHAPTERS: `${STORAGE_PREFIX}chapters`,
  STUDY_SESSIONS: `${STORAGE_PREFIX}study_sessions`,
  HABITS: `${STORAGE_PREFIX}habits`,
  HABIT_COMPLETIONS: `${STORAGE_PREFIX}habit_completions`,
  WORKOUTS: `${STORAGE_PREFIX}workouts`,
  WORKOUT_ROUTINES: `${STORAGE_PREFIX}workout_routines`,
  WEIGHT_ENTRIES: `${STORAGE_PREFIX}weight_entries`,
  BODY_MEASUREMENTS: `${STORAGE_PREFIX}body_measurements`,
  FITNESS_SETTINGS: `${STORAGE_PREFIX}fitness_settings`,
  EXAM_SETTINGS: `${STORAGE_PREFIX}exam_settings`,
  APP_SETTINGS: `${STORAGE_PREFIX}app_settings`,
  REFLECTION_ENTRIES: `${STORAGE_PREFIX}reflection_entries`,
  WEEKLY_REVIEWS: `${STORAGE_PREFIX}weekly_reviews`,
  MENTOR_REPORTS: `${STORAGE_PREFIX}mentor_reports`,
  MENTOR_MESSAGES: `${STORAGE_PREFIX}mentor_messages`,
  MENTOR_PRIVACY_SETTINGS: `${STORAGE_PREFIX}mentor_privacy_settings`,
  INITIALIZED: `${STORAGE_PREFIX}initialized_clean_v2`,
};

const LEGACY_INITIALIZED_KEY = `${STORAGE_PREFIX}initialized_v1`;

export const DEFAULT_MENTOR_PRIVACY_SETTINGS: MentorPrivacySettings = {
  journalSharingConsent: false,
  rememberJournalConsent: false,
  excludedJournalEntryIds: [],
  includeStudyContext: true,
  includeFitnessContext: true,
  includeHabitsContext: true,
  includePlanningContext: true,
  preferLocalAnalyticsOnly: false,
};

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Failed to parse localStorage item for key "${key}":`, err);
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to set localStorage item for key "${key}":`, err);
  }
}

export interface AppDataState {
  tasks: Task[];
  goals: Goal[];
  monthlyOutcomes: MonthlyOutcome[];
  tests: TestRecord[];
  testErrors: TestError[];
  subjects: Subject[];
  chapters: Chapter[];
  studySessions: StudySession[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  workouts: WorkoutSession[];
  workoutRoutines: WorkoutRoutine[];
  weightEntries: WeightEntry[];
  bodyMeasurements: BodyMeasurementEntry[];
  fitnessSettings: FitnessSettings;
  examSettings: ExamSettings;
  appSettings: AppSettings;
  reflectionEntries: ReflectionEntry[];
  weeklyReviews: WeeklyReview[];
  mentorReports: SavedMentorReport[];
  mentorMessages: ChatMessage[];
  mentorPrivacySettings: MentorPrivacySettings;
}

/**
 * Loads all state from localStorage or initializes with a clean blank slate on first run.
 */
export function loadInitialData(): AppDataState {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);

  if (!isInitialized) {
    try {
      localStorage.removeItem(LEGACY_INITIALIZED_KEY);
    } catch {
      // Ignore storage removal errors
    }
    return clearAllRecords();
  }

  const todayIso = new Date().toISOString();
  const todayDate = todayIso.split('T')[0];

  const storedSubjects = safeGetItem<Subject[]>(STORAGE_KEYS.SUBJECTS, []);
  const storedChapters = safeGetItem<Chapter[]>(STORAGE_KEYS.CHAPTERS, []);
  const storedTestErrors = safeGetItem<TestError[]>(STORAGE_KEYS.TEST_ERRORS, []);
  const storedSessions = safeGetItem<StudySession[]>(STORAGE_KEYS.STUDY_SESSIONS, []);
  const storedWorkouts = safeGetItem<WorkoutSession[]>(STORAGE_KEYS.WORKOUTS, []);
  const storedWorkoutRoutines = safeGetItem<WorkoutRoutine[]>(STORAGE_KEYS.WORKOUT_ROUTINES, []);
  const storedWeightEntries = safeGetItem<WeightEntry[]>(STORAGE_KEYS.WEIGHT_ENTRIES, []);
  const storedMeasurements = safeGetItem<BodyMeasurementEntry[]>(STORAGE_KEYS.BODY_MEASUREMENTS, []);
  const storedOutcomes = safeGetItem<MonthlyOutcome[]>(STORAGE_KEYS.MONTHLY_OUTCOMES, []);
  const storedReflectionEntries = safeGetItem<ReflectionEntry[]>(STORAGE_KEYS.REFLECTION_ENTRIES, []);
  const storedWeeklyReviews = safeGetItem<WeeklyReview[]>(STORAGE_KEYS.WEEKLY_REVIEWS, []);
  const storedMentorReports = safeGetItem<SavedMentorReport[]>(STORAGE_KEYS.MENTOR_REPORTS, []);
  const storedMentorMessages = safeGetItem<ChatMessage[]>(STORAGE_KEYS.MENTOR_MESSAGES, []);
  const storedMentorPrivacy = safeGetItem<MentorPrivacySettings>(
    STORAGE_KEYS.MENTOR_PRIVACY_SETTINGS,
    DEFAULT_MENTOR_PRIVACY_SETTINGS
  );

  const normalizedWorkouts = storedWorkouts.map(w => ({
    ...w,
    name: w.name || w.workoutType || 'Workout Session',
    workoutType: w.workoutType || 'strength',
    durationMinutes: w.durationMinutes !== undefined ? w.durationMinutes : 45,
    exercises: w.exercises || [],
  }));

  const normalizedSessions = storedSessions.map(s => ({
    ...s,
    questionsAttempted: s.questionsAttempted ?? s.questionsSolved ?? 0,
    activityType: s.activityType || 'practice',
  }));

  const storedHabits = safeGetItem<Habit[]>(STORAGE_KEYS.HABITS, []);
  const storedCompletions = safeGetItem<HabitCompletion[]>(STORAGE_KEYS.HABIT_COMPLETIONS, []);

  const normalizedHabits: Habit[] = storedHabits.map((h, idx) => {
    const scheduledDays = h.scheduledDays || [0, 1, 2, 3, 4, 5, 6];
    const defaultType: 'daily' | 'custom_days' = scheduledDays.length === 7 ? 'daily' : 'custom_days';
    const schedule: HabitSchedule = h.schedule || {
      type: defaultType,
      daysOfWeek: scheduledDays,
    };
    return {
      ...h,
      name: h.name || h.title || `Habit ${idx + 1}`,
      title: h.title || h.name || `Habit ${idx + 1}`,
      description: h.description ?? '',
      category: h.category || 'discipline',
      icon: h.icon || 'CheckSquare',
      color: h.color || '#9B7BFF',
      isActive: h.isActive !== undefined ? h.isActive : true,
      isNonNegotiable: h.isNonNegotiable !== undefined ? h.isNonNegotiable : Boolean(h.isMustDo),
      isMustDo: h.isMustDo !== undefined ? h.isMustDo : Boolean(h.isNonNegotiable),
      schedule,
      scheduledDays,
      startDate: h.startDate || todayDate,
      createdAt: h.createdAt || todayIso,
      updatedAt: h.updatedAt || todayIso,
      streak: h.streak ?? 0,
    };
  });

  const normalizedOutcomes: MonthlyOutcome[] = storedOutcomes.map((o, idx) => ({
    ...o,
    id: o.id || `mo-${Date.now()}-${idx}`,
    month: o.month || todayDate.slice(0, 7),
    title: o.title || 'Key Outcome',
    description: o.description || '',
    dueDate: o.dueDate,
    completed: Boolean(o.completed),
    order: typeof o.order === 'number' ? o.order : idx + 1,
    createdAt: o.createdAt || todayIso,
    updatedAt: o.updatedAt || todayIso,
  }));

  return {
    tasks: safeGetItem<Task[]>(STORAGE_KEYS.TASKS, []),
    goals: safeGetItem<Goal[]>(STORAGE_KEYS.GOALS, []),
    monthlyOutcomes: normalizedOutcomes,
    tests: safeGetItem<TestRecord[]>(STORAGE_KEYS.TESTS, []),
    testErrors: storedTestErrors,
    subjects: storedSubjects,
    chapters: storedChapters,
    studySessions: normalizedSessions,
    habits: normalizedHabits,
    habitCompletions: storedCompletions,
    workouts: normalizedWorkouts,
    workoutRoutines: storedWorkoutRoutines,
    weightEntries: storedWeightEntries,
    bodyMeasurements: storedMeasurements,
    fitnessSettings: {
      displayWeightUnit: 'kg',
      displayLengthUnit: 'in',
    },
    examSettings: safeGetItem<ExamSettings>(STORAGE_KEYS.EXAM_SETTINGS, {
      examName: '',
      examDate: '',
    }),
    appSettings: safeGetItem<AppSettings>(STORAGE_KEYS.APP_SETTINGS, {
      dailyStudyTargetHours: 8.0,
      userName: 'Student',
      isSampleDataLoaded: false,
    }),
    reflectionEntries: storedReflectionEntries,
    weeklyReviews: storedWeeklyReviews,
    mentorReports: storedMentorReports,
    mentorMessages: storedMentorMessages,
    mentorPrivacySettings: storedMentorPrivacy,
  };
}

/**
 * Saves all state properties to their respective localStorage keys.
 */
export function saveAllData(data: AppDataState): void {
  safeSetItem(STORAGE_KEYS.TASKS, data.tasks);
  safeSetItem(STORAGE_KEYS.GOALS, data.goals);
  safeSetItem(STORAGE_KEYS.MONTHLY_OUTCOMES, data.monthlyOutcomes);
  safeSetItem(STORAGE_KEYS.TESTS, data.tests);
  safeSetItem(STORAGE_KEYS.TEST_ERRORS, data.testErrors);
  safeSetItem(STORAGE_KEYS.SUBJECTS, data.subjects);
  safeSetItem(STORAGE_KEYS.CHAPTERS, data.chapters);
  safeSetItem(STORAGE_KEYS.STUDY_SESSIONS, data.studySessions);
  safeSetItem(STORAGE_KEYS.HABITS, data.habits);
  safeSetItem(STORAGE_KEYS.HABIT_COMPLETIONS, data.habitCompletions);
  safeSetItem(STORAGE_KEYS.WORKOUTS, data.workouts);
  safeSetItem(STORAGE_KEYS.WORKOUT_ROUTINES, data.workoutRoutines);
  safeSetItem(STORAGE_KEYS.WEIGHT_ENTRIES, data.weightEntries);
  safeSetItem(STORAGE_KEYS.BODY_MEASUREMENTS, data.bodyMeasurements);
  safeSetItem(STORAGE_KEYS.FITNESS_SETTINGS, data.fitnessSettings);
  safeSetItem(STORAGE_KEYS.EXAM_SETTINGS, data.examSettings);
  safeSetItem(STORAGE_KEYS.APP_SETTINGS, data.appSettings);
  safeSetItem(STORAGE_KEYS.REFLECTION_ENTRIES, data.reflectionEntries);
  safeSetItem(STORAGE_KEYS.WEEKLY_REVIEWS, data.weeklyReviews);
  safeSetItem(STORAGE_KEYS.MENTOR_REPORTS, data.mentorReports);
  safeSetItem(STORAGE_KEYS.MENTOR_MESSAGES, data.mentorMessages);
  safeSetItem(STORAGE_KEYS.MENTOR_PRIVACY_SETTINGS, data.mentorPrivacySettings);
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

/**
 * Reset application data to initial sample seed dataset.
 */
export function resetToSeedData(): AppDataState {
  const seed = getInitialSeedData();
  saveAllData(seed);
  return seed;
}

/**
 * Clear all demo records, providing completely blank state.
 */
export function clearAllRecords(): AppDataState {
  const blankState: AppDataState = {
    tasks: [],
    goals: [],
    monthlyOutcomes: [],
    tests: [],
    testErrors: [],
    subjects: [],
    chapters: [],
    studySessions: [],
    habits: [],
    habitCompletions: [],
    workouts: [],
    workoutRoutines: [],
    weightEntries: [],
    bodyMeasurements: [],
    fitnessSettings: {
      displayWeightUnit: 'kg',
      displayLengthUnit: 'in',
    },
    examSettings: {
      examName: '',
      examDate: '',
    },
    appSettings: {
      dailyStudyTargetHours: 8.0,
      userName: 'Student',
      isSampleDataLoaded: false,
    },
    reflectionEntries: [],
    weeklyReviews: [],
    mentorReports: [],
    mentorMessages: [],
    mentorPrivacySettings: DEFAULT_MENTOR_PRIVACY_SETTINGS,
  };
  saveAllData(blankState);
  return blankState;
}
