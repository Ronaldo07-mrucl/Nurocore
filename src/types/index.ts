export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'not_started' | 'in_progress' | 'done';
export type ExamType = 'Mains' | 'Advanced';

export type ChapterMastery = 'nil' | 'mains' | 'advanced' | 'extreme';
export type StudyActivityType = 'theory' | 'practice' | 'revision' | 'mock_analysis';
export type DateRangeFilter = '7d' | '30d' | '90d' | 'all';

export type ErrorType =
  | 'conceptual'
  | 'calculation'
  | 'silly'
  | 'time-management'
  | 'misread-question'
  | 'guess'
  | 'unattempted'
  | 'other';

export interface Task {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  priority: Priority;
  status: TaskStatus;
  completed: boolean;
  category?: string;
  notes?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  identityStatement: string; // e.g. "I am becoming a disciplined and capable problem solver."
  description: string;
  progress: number; // 0 to 100
  targetDate: string; // YYYY-MM-DD
  imageUrl?: string;
  createdAt: string;
}

export interface MonthlyOutcome {
  id: string;
  month: string; // YYYY-MM format, e.g. "2026-10"
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  completed: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestRecord {
  id: string;
  name: string;
  examType: ExamType;
  date: string; // YYYY-MM-DD
  marksObtained: number;
  totalMarks: number;
  source?: string; // e.g. "Allen AITS", "FIITJEE AITS", "Self Mock"
  durationMinutes?: number;
  syllabusSummary?: string;
  subjectSyllabus?: Record<string, string>; // subjectId -> comma-separated chapters covered
  weakChapters?: string;
  errorLogSummary?: string;
  overallRemarks?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TestError {
  id: string;
  testId: string;
  questionNumber?: string;
  subjectId?: string;
  chapterId?: string;
  chapterName?: string;
  topic?: string;
  errorType: ErrorType;
  description: string; // required
  reason?: string;
  correctApproach?: string;
  correctiveAction?: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  mastery: ChapterMastery;
  revisionCount: number;
  isWeak: boolean;
  needsInstantRevision: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD local
  subjectId: string;
  chapterId?: string;
  durationMinutes: number;
  questionsAttempted: number;
  questionsCorrect?: number;
  activityType: StudyActivityType | string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;

  // Legacy/computed compatibility:
  subject?: string;
  topic?: string;
  questionsSolved?: number;
}

export type HabitScheduleType = 'daily' | 'weekdays' | 'custom_days';

export interface HabitSchedule {
  type: HabitScheduleType;
  daysOfWeek: number[]; // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
}

export interface Habit {
  id: string;
  name: string;
  title?: string; // backwards compatibility
  description?: string;
  icon?: string;
  color?: string;
  category?: 'study' | 'fitness' | 'mindset' | 'discipline' | 'health' | string;
  isActive: boolean;
  isNonNegotiable: boolean;
  isMustDo?: boolean; // backwards compatibility
  schedule: HabitSchedule;
  scheduledDays?: number[]; // backwards compatibility
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  streak?: number;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
  note?: string;
}

export interface ExerciseEntry {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number; // load used
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  name?: string; // e.g. "Push Day & Core", "Zone 2 Cardio"
  workoutType: string; // "strength" | "cardio" | "mobility" | "sports" | "other" or custom string
  durationMinutes?: number;
  exercises?: ExerciseEntry[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkoutRoutine {
  id: string;
  name: string; // e.g. "Push Day"
  workoutType: string;
  durationMinutes?: number;
  exercises: ExerciseEntry[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number; // canonical weight stored in kilograms
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BodyMeasurementEntry {
  id: string;
  date: string; // YYYY-MM-DD
  waistCm?: number;
  chestCm?: number;
  hipsCm?: number;
  armCm?: number;
  thighCm?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FitnessSettings {
  displayWeightUnit: 'kg' | 'lb';
  displayLengthUnit: 'cm' | 'in';
}

export interface ExamSettings {
  examName: string;
  examDate: string; // YYYY-MM-DD
  mainsTargetScore?: number;
  advancedTargetScore?: number;
}

export type Mood = 'great' | 'good' | 'neutral' | 'difficult' | 'low';

export type EnergyLevel = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';

export type ChecklistAnswer = 'yes' | 'partly' | 'not_yet' | 'skipped';

export interface DailyChecklist {
  reviewedLearning?: ChecklistAnswer;
  taskProgress?: ChecklistAnswer;
  physicalWellbeing?: ChecklistAnswer;
  reflectedOnMistake?: ChecklistAnswer;
  identifiedNextStep?: ChecklistAnswer;
}

export interface DailyHighlights {
  mainWin?: string;
  biggestChallenge?: string;
  lessonLearned?: string;
  priorityTomorrow?: string;
}

export interface ReflectionEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  mood?: Mood;
  energy?: EnergyLevel;
  tags?: string[];
  checklist?: DailyChecklist;
  highlights?: DailyHighlights;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReview {
  id: string;
  weekStartDate: string; // YYYY-MM-DD (Monday)
  content: string;
  winOfTheWeek?: string;
  challengesFaced?: string;
  adjustmentsForNextWeek?: string;
  priorityForNextWeek?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  dailyStudyTargetHours: number;
  userName: string;
  isSampleDataLoaded: boolean;
}

export type NavigationDestination = 
  | 'dashboard'
  | 'study-log'
  | 'test-error-log'
  | 'fitness'
  | 'habit-tracking'
  | 'planning'
  | 'analytics'
  | 'reflection';

export interface RouteState {
  page: NavigationDestination;
  testDetailId?: string | null;
  subjectDetailId?: string | null;
  testOriginPage?: 'dashboard' | 'test-error-log';
}

// ==========================================
// Phase 9: AI Personal Mentor Types
// ==========================================

export type MentorReportType = 'daily_debrief' | 'weekly_review' | 'monthly_review';

export interface SavedMentorReport {
  id: string;
  type: MentorReportType;
  title: string;
  targetDateOrRange: string;
  content: string;
  metricSnapshot: {
    studyHours?: number;
    questionsSolved?: number;
    tasksCompleted?: number;
    tasksTotal?: number;
    habitsRate?: number;
    workoutsCount?: number;
    testsTaken?: number;
    averageTestPercent?: number;
  };
  includedCategories: ('study' | 'tests' | 'habits' | 'fitness' | 'planning' | 'reflection')[];
  journalIncluded: boolean;
  provider: 'gemini' | 'local_deterministic';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  error?: boolean;
  referencedContextSummary?: string;
}

export interface MentorPrivacySettings {
  journalSharingConsent: boolean;
  rememberJournalConsent: boolean;
  excludedJournalEntryIds: string[];
  includeStudyContext: boolean;
  includeFitnessContext: boolean;
  includeHabitsContext: boolean;
  includePlanningContext: boolean;
  preferLocalAnalyticsOnly: boolean;
}

export interface ProviderStatus {
  isConfigured: boolean;
  providerName: string;
  model: string;
  serverEndpointAvailable: boolean;
  message?: string;
}
