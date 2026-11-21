import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Task,
  Goal,
  MonthlyOutcome,
  TestRecord,
  TestError,
  Subject,
  Chapter,
  ChapterMastery,
  StudySession,
  Habit,
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
  NavigationDestination,
} from '../types';
import { loadInitialData, saveAllData, resetToSeedData, clearAllRecords } from '../data/storage';

interface AppContextType {
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
  activePage: NavigationDestination;
  activeTestDetailId: string | null;
  activeSubjectId: string | null;
  testOriginPage: 'dashboard' | 'test-error-log' | null;

  // Navigation
  setActivePage: (page: NavigationDestination) => void;
  navigateToTestDetail: (testId: string, origin?: 'dashboard' | 'test-error-log') => void;
  returnToDashboard: () => void;
  returnFromTestDetail: () => void;
  navigateToSubject: (subjectId: string) => void;
  returnToStudyLog: () => void;

  // Fitness & Workouts
  addWorkout: (workout: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorkout: (workout: WorkoutSession) => void;
  deleteWorkout: (id: string) => void;
  addWorkoutRoutine: (routine: Omit<WorkoutRoutine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorkoutRoutine: (routine: WorkoutRoutine) => void;
  deleteWorkoutRoutine: (id: string) => void;

  // Weight Tracking
  addWeightEntry: (entry: Omit<WeightEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWeightEntry: (entry: WeightEntry) => void;
  deleteWeightEntry: (id: string) => void;

  // Body Measurements
  addBodyMeasurement: (entry: Omit<BodyMeasurementEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBodyMeasurement: (entry: BodyMeasurementEntry) => void;
  deleteBodyMeasurement: (id: string) => void;

  // Fitness Settings
  updateFitnessSettings: (settings: Partial<FitnessSettings>) => void;

  // Habits & Completions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  toggleHabitPause: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string, note?: string) => void;
  setHabitCompletionNote: (habitId: string, date: string, note: string) => void;

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  rescheduleTask: (id: string, newDate: string) => void;

  // Monthly Key Outcomes
  addMonthlyOutcome: (outcome: Omit<MonthlyOutcome, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMonthlyOutcome: (outcome: MonthlyOutcome) => void;
  deleteMonthlyOutcome: (id: string) => void;
  toggleMonthlyOutcome: (id: string) => void;
  reorderMonthlyOutcomes: (month: string, outcomeIds: string[]) => void;

  // Goals
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;

  // Tests
  addTest: (test: Omit<TestRecord, 'id' | 'createdAt'>) => void;
  updateTest: (test: TestRecord) => void;
  deleteTest: (id: string) => void;

  // Test Errors
  addTestError: (error: Omit<TestError, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTestError: (error: TestError) => void;
  deleteTestError: (id: string) => void;
  toggleTestErrorResolved: (id: string) => void;

  // Study Sessions
  addStudySession: (session: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStudySession: (session: StudySession) => void;
  deleteStudySession: (sessionId: string) => void;

  // Subjects
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (subjectId: string) => void;

  // Chapters
  addChapter: (chapter: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateChapter: (chapter: Chapter) => void;
  deleteChapter: (chapterId: string) => void;
  updateChapterMastery: (chapterId: string, mastery: ChapterMastery) => void;
  incrementChapterRevision: (chapterId: string) => void;
  decrementChapterRevision: (chapterId: string) => void;
  toggleChapterWeak: (chapterId: string) => void;
  toggleChapterInstantRevision: (chapterId: string) => void;
  updateChapterNotes: (chapterId: string, notes: string) => void;

  // Reflection Entries
  addReflectionEntry: (entry: Omit<ReflectionEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReflectionEntry: (entry: ReflectionEntry) => void;
  deleteReflectionEntry: (id: string) => void;

  // Weekly Reviews
  addWeeklyReview: (review: Omit<WeeklyReview, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWeeklyReview: (review: WeeklyReview) => void;
  deleteWeeklyReview: (id: string) => void;

  // AI Personal Mentor
  saveMentorReport: (report: Omit<SavedMentorReport, 'id' | 'createdAt'>) => SavedMentorReport;
  deleteMentorReport: (id: string) => void;
  clearAllMentorReports: () => void;
  addMentorMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  clearMentorMessages: () => void;
  updateMentorPrivacySettings: (settings: Partial<MentorPrivacySettings>) => void;
  toggleJournalExclusion: (entryId: string) => void;
  revokeJournalConsent: () => void;

  // Settings
  updateExamSettings: (settings: Partial<ExamSettings>) => void;
  updateDailyStudyTarget: (hours: number) => void;

  // Reset
  resetDemoData: () => void;
  clearAllUserData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState(() => loadInitialData());
  const [activePage, setActivePage] = useState<NavigationDestination>('dashboard');
  const [activeTestDetailId, setActiveTestDetailId] = useState<string | null>(null);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [testOriginPage, setTestOriginPage] = useState<'dashboard' | 'test-error-log' | null>(null);

  // Sync to localStorage whenever data changes
  useEffect(() => {
    saveAllData(data);
  }, [data]);

  const navigateToTestDetail = useCallback((testId: string, origin?: 'dashboard' | 'test-error-log') => {
    setActiveTestDetailId(testId);
    setTestOriginPage(origin || 'dashboard');
    setActiveSubjectId(null);
  }, []);

  const returnToDashboard = useCallback(() => {
    setActiveTestDetailId(null);
    setTestOriginPage(null);
  }, []);

  const returnFromTestDetail = useCallback(() => {
    setActiveTestDetailId(null);
    if (testOriginPage) {
      setActivePage(testOriginPage);
    }
    setTestOriginPage(null);
  }, [testOriginPage]);

  const navigateToSubject = useCallback((subjectId: string) => {
    setActiveSubjectId(subjectId);
    setActivePage('study-log');
    setActiveTestDetailId(null);
    setTestOriginPage(null);
  }, []);

  const returnToStudyLog = useCallback(() => {
    setActiveSubjectId(null);
  }, []);

  // Handle page navigation
  const handleSetActivePage = useCallback((page: NavigationDestination) => {
    setActivePage(page);
    setActiveTestDetailId(null);
    setTestOriginPage(null);
    if (page !== 'study-log') {
      setActiveSubjectId(null);
    }
  }, []);

  // Tasks
  const addTask = useCallback((newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      tasks: [task, ...prev.tasks],
    }));
  }, []);

  const updateTask = useCallback((updated: Task) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === updated.id ? updated : t)),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
  }, []);

  const toggleTaskComplete = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            status: nextCompleted ? 'done' : 'in_progress',
          };
        }
        return t;
      }),
    }));
  }, []);

  const rescheduleTask = useCallback((id: string, newDate: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === id ? { ...t, dueDate: newDate } : t)),
    }));
  }, []);

  // Monthly Key Outcomes
  const addMonthlyOutcome = useCallback((outcomeData: Omit<MonthlyOutcome, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const outcome: MonthlyOutcome = {
      ...outcomeData,
      id: `mo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    setData(prev => ({
      ...prev,
      monthlyOutcomes: [...prev.monthlyOutcomes, outcome],
    }));
  }, []);

  const updateMonthlyOutcome = useCallback((updated: MonthlyOutcome) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      monthlyOutcomes: prev.monthlyOutcomes.map(o => (o.id === updated.id ? { ...updated, updatedAt: now } : o)),
    }));
  }, []);

  const deleteMonthlyOutcome = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      monthlyOutcomes: prev.monthlyOutcomes.filter(o => o.id !== id),
    }));
  }, []);

  const toggleMonthlyOutcome = useCallback((id: string) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      monthlyOutcomes: prev.monthlyOutcomes.map(o => (o.id === id ? { ...o, completed: !o.completed, updatedAt: now } : o)),
    }));
  }, []);

  const reorderMonthlyOutcomes = useCallback((month: string, outcomeIds: string[]) => {
    const now = new Date().toISOString();
    setData(prev => {
      const orderMap = new Map<string, number>();
      outcomeIds.forEach((id, idx) => orderMap.set(id, idx + 1));

      const updated = prev.monthlyOutcomes.map(o => {
        if (o.month === month && orderMap.has(o.id)) {
          return { ...o, order: orderMap.get(o.id)!, updatedAt: now };
        }
        return o;
      });
      return {
        ...prev,
        monthlyOutcomes: updated,
      };
    });
  }, []);

  // Goals
  const addGoal = useCallback((newGoal: Omit<Goal, 'id' | 'createdAt'>) => {
    const goal: Goal = {
      ...newGoal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      goals: [...prev.goals, goal],
    }));
  }, []);

  const updateGoal = useCallback((updated: Goal) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => (g.id === updated.id ? updated : g)),
    }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id),
    }));
  }, []);

  // Tests
  const addTest = useCallback((newTest: Omit<TestRecord, 'id' | 'createdAt'>) => {
    const test: TestRecord = {
      ...newTest,
      id: `test-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      tests: [test, ...prev.tests],
    }));
  }, []);

  const updateTest = useCallback((updated: TestRecord) => {
    setData(prev => ({
      ...prev,
      tests: prev.tests.map(t => (t.id === updated.id ? updated : t)),
    }));
  }, []);

  const deleteTest = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      tests: prev.tests.filter(t => t.id !== id),
      testErrors: prev.testErrors.filter(e => e.testId !== id),
    }));
    setActiveTestDetailId(curr => (curr === id ? null : curr));
  }, []);

  // Test Errors
  const addTestError = useCallback((errorData: Omit<TestError, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const error: TestError = {
      ...errorData,
      id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    setData(prev => ({
      ...prev,
      testErrors: [error, ...prev.testErrors],
    }));
  }, []);

  const updateTestError = useCallback((updated: TestError) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      testErrors: prev.testErrors.map(e => (e.id === updated.id ? { ...updated, updatedAt: now } : e)),
    }));
  }, []);

  const deleteTestError = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      testErrors: prev.testErrors.filter(e => e.id !== id),
    }));
  }, []);

  const toggleTestErrorResolved = useCallback((id: string) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      testErrors: prev.testErrors.map(e => (e.id === id ? { ...e, resolved: !e.resolved, updatedAt: now } : e)),
    }));
  }, []);

  // Study Sessions
  const addStudySession = useCallback((sessionData: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const session: StudySession = {
      ...sessionData,
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
      // Legacy compat:
      questionsSolved: sessionData.questionsAttempted,
    };
    setData(prev => ({
      ...prev,
      studySessions: [session, ...prev.studySessions],
    }));
  }, []);

  const updateStudySession = useCallback((updated: StudySession) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      studySessions: prev.studySessions.map(s => (s.id === updated.id ? {
        ...updated,
        updatedAt: now,
        questionsSolved: updated.questionsAttempted,
      } : s)),
    }));
  }, []);

  const deleteStudySession = useCallback((sessionId: string) => {
    setData(prev => ({
      ...prev,
      studySessions: prev.studySessions.filter(s => s.id !== sessionId),
    }));
  }, []);

  // Subjects
  const addSubject = useCallback((subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const subject: Subject = {
      ...subjectData,
      id: `subj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    setData(prev => ({
      ...prev,
      subjects: [...prev.subjects, subject],
    }));
  }, []);

  const updateSubject = useCallback((updated: Subject) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => (s.id === updated.id ? { ...updated, updatedAt: now } : s)),
    }));
  }, []);

  const deleteSubject = useCallback((subjectId: string) => {
    setData(prev => {
      // Preserve historical study session records, preserving their data without crashing
      return {
        ...prev,
        subjects: prev.subjects.filter(s => s.id !== subjectId),
        // Remove associated chapters of this subject
        chapters: prev.chapters.filter(c => c.subjectId !== subjectId),
      };
    });
    setActiveSubjectId(curr => (curr === subjectId ? null : curr));
  }, []);

  // Chapters
  const addChapter = useCallback((chapterData: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const chapter: Chapter = {
      ...chapterData,
      id: `chap-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    setData(prev => ({
      ...prev,
      chapters: [...prev.chapters, chapter],
    }));
  }, []);

  const updateChapter = useCallback((updated: Chapter) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => (c.id === updated.id ? { ...updated, updatedAt: now } : c)),
    }));
  }, []);

  const deleteChapter = useCallback((chapterId: string) => {
    setData(prev => ({
      ...prev,
      chapters: prev.chapters.filter(c => c.id !== chapterId),
      // Preserve study sessions; just unset chapterId if referenced
      studySessions: prev.studySessions.map(s => s.chapterId === chapterId ? { ...s, chapterId: undefined } : s),
    }));
  }, []);

  const updateChapterMastery = useCallback((chapterId: string, mastery: ChapterMastery) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => (c.id === chapterId ? { ...c, mastery, updatedAt: now } : c)),
    }));
  }, []);

  const incrementChapterRevision = useCallback((chapterId: string) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => (c.id === chapterId ? {
        ...c,
        revisionCount: (c.revisionCount || 0) + 1,
        updatedAt: now,
      } : c)),
    }));
  }, []);

  const decrementChapterRevision = useCallback((chapterId: string) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => (c.id === chapterId ? {
        ...c,
        revisionCount: Math.max(0, (c.revisionCount || 0) - 1),
        updatedAt: now,
      } : c)),
    }));
  }, []);

  const toggleChapterWeak = useCallback((chapterId: string) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => (c.id === chapterId ? {
        ...c,
        isWeak: !c.isWeak,
        updatedAt: now,
      } : c)),
    }));
  }, []);

  const toggleChapterInstantRevision = useCallback((chapterId: string) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => (c.id === chapterId ? {
        ...c,
        needsInstantRevision: !c.needsInstantRevision,
        updatedAt: now,
      } : c)),
    }));
  }, []);

  const updateChapterNotes = useCallback((chapterId: string, notes: string) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => (c.id === chapterId ? {
        ...c,
        notes,
        updatedAt: now,
      } : c)),
    }));
  }, []);

  // Fitness & Workouts
  const addWorkout = useCallback((workoutData: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const workout: WorkoutSession = {
      ...workoutData,
      id: `workout-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    setData(prev => ({
      ...prev,
      workouts: [workout, ...prev.workouts],
    }));
  }, []);

  const updateWorkout = useCallback((updated: WorkoutSession) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      workouts: prev.workouts.map(w => (w.id === updated.id ? { ...updated, updatedAt: now } : w)),
    }));
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      workouts: prev.workouts.filter(w => w.id !== id),
    }));
  }, []);

  // Workout Routines
  const addWorkoutRoutine = useCallback((routineData: Omit<WorkoutRoutine, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const routine: WorkoutRoutine = {
      ...routineData,
      id: `routine-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    setData(prev => ({
      ...prev,
      workoutRoutines: [routine, ...prev.workoutRoutines],
    }));
  }, []);

  const updateWorkoutRoutine = useCallback((updated: WorkoutRoutine) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      workoutRoutines: prev.workoutRoutines.map(r => (r.id === updated.id ? { ...updated, updatedAt: now } : r)),
    }));
  }, []);

  const deleteWorkoutRoutine = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      workoutRoutines: prev.workoutRoutines.filter(r => r.id !== id),
    }));
  }, []);

  // Weight Tracking
  const addWeightEntry = useCallback((entryData: Omit<WeightEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const entry: WeightEntry = {
      ...entryData,
      id: `weight-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    setData(prev => ({
      ...prev,
      weightEntries: [entry, ...prev.weightEntries],
    }));
  }, []);

  const updateWeightEntry = useCallback((updated: WeightEntry) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      weightEntries: prev.weightEntries.map(e => (e.id === updated.id ? { ...updated, updatedAt: now } : e)),
    }));
  }, []);

  const deleteWeightEntry = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      weightEntries: prev.weightEntries.filter(e => e.id !== id),
    }));
  }, []);

  // Body Measurements
  const addBodyMeasurement = useCallback((entryData: Omit<BodyMeasurementEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const entry: BodyMeasurementEntry = {
      ...entryData,
      id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    setData(prev => ({
      ...prev,
      bodyMeasurements: [entry, ...prev.bodyMeasurements],
    }));
  }, []);

  const updateBodyMeasurement = useCallback((updated: BodyMeasurementEntry) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      bodyMeasurements: prev.bodyMeasurements.map(e => (e.id === updated.id ? { ...updated, updatedAt: now } : e)),
    }));
  }, []);

  const deleteBodyMeasurement = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      bodyMeasurements: prev.bodyMeasurements.filter(e => e.id !== id),
    }));
  }, []);

  // Habits & Completions
  const addHabit = useCallback((habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const id = `habit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newHabit: Habit = {
      ...habitData,
      id,
      name: habitData.name.trim(),
      title: habitData.name.trim(),
      isActive: habitData.isActive !== undefined ? habitData.isActive : true,
      isNonNegotiable: habitData.isNonNegotiable || false,
      isMustDo: habitData.isNonNegotiable || false,
      createdAt: now,
      updatedAt: now,
    };
    setData(prev => ({
      ...prev,
      habits: [...prev.habits, newHabit],
    }));
  }, []);

  const updateHabit = useCallback((updated: Habit) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      habits: prev.habits.map(h => (h.id === updated.id ? {
        ...updated,
        name: updated.name.trim(),
        title: updated.name.trim(),
        isMustDo: updated.isNonNegotiable,
        updatedAt: now,
      } : h)),
    }));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id),
      habitCompletions: prev.habitCompletions.filter(c => c.habitId !== id),
    }));
  }, []);

  const toggleHabitPause = useCallback((id: string) => {
    const now = new Date().toISOString();
    setData(prev => ({
      ...prev,
      habits: prev.habits.map(h => (h.id === id ? {
        ...h,
        isActive: !h.isActive,
        updatedAt: now,
      } : h)),
    }));
  }, []);

  const toggleHabitCompletion = useCallback((habitId: string, date: string, note?: string) => {
    const now = new Date().toISOString();
    setData(prev => {
      const existing = prev.habitCompletions.find(c => c.habitId === habitId && c.date === date);
      if (existing) {
        const nextCompleted = !existing.completed;
        return {
          ...prev,
          habitCompletions: prev.habitCompletions.map(c => (c.id === existing.id ? {
            ...c,
            completed: nextCompleted,
            completedAt: nextCompleted ? now : undefined,
            note: note !== undefined ? note : c.note,
          } : c)),
        };
      } else {
        const newRecord: HabitCompletion = {
          id: `hc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          habitId,
          date,
          completed: true,
          completedAt: now,
          note,
        };
        return {
          ...prev,
          habitCompletions: [...prev.habitCompletions, newRecord],
        };
      }
    });
  }, []);

  const setHabitCompletionNote = useCallback((habitId: string, date: string, note: string) => {
    const now = new Date().toISOString();
    setData(prev => {
      const existing = prev.habitCompletions.find(c => c.habitId === habitId && c.date === date);
      if (existing) {
        return {
          ...prev,
          habitCompletions: prev.habitCompletions.map(c => (c.id === existing.id ? {
            ...c,
            note,
          } : c)),
        };
      } else {
        const newRecord: HabitCompletion = {
          id: `hc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          habitId,
          date,
          completed: true,
          completedAt: now,
          note,
        };
        return {
          ...prev,
          habitCompletions: [...prev.habitCompletions, newRecord],
        };
      }
    });
  }, []);

  // Fitness Settings
  const updateFitnessSettings = useCallback((settings: Partial<FitnessSettings>) => {
    setData(prev => ({
      ...prev,
      fitnessSettings: {
        ...prev.fitnessSettings,
        ...settings,
      },
    }));
  }, []);

  // Settings
  const updateExamSettings = useCallback((settings: Partial<ExamSettings>) => {
    setData(prev => ({
      ...prev,
      examSettings: {
        ...prev.examSettings,
        ...settings,
      },
    }));
  }, []);

  const updateDailyStudyTarget = useCallback((hours: number) => {
    const validHours = Math.max(0.5, Math.min(24, Number(hours) || 8));
    setData(prev => ({
      ...prev,
      appSettings: {
        ...prev.appSettings,
        dailyStudyTargetHours: validHours,
      },
    }));
  }, []);

  // Reflection Entries
  const addReflectionEntry = useCallback((newEntry: Omit<ReflectionEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const entry: ReflectionEntry = {
      ...newEntry,
      id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    setData(prev => ({
      ...prev,
      reflectionEntries: [entry, ...prev.reflectionEntries],
    }));
  }, []);

  const updateReflectionEntry = useCallback((updated: ReflectionEntry) => {
    setData(prev => ({
      ...prev,
      reflectionEntries: prev.reflectionEntries.map(e =>
        e.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : e
      ),
    }));
  }, []);

  const deleteReflectionEntry = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      reflectionEntries: prev.reflectionEntries.filter(e => e.id !== id),
    }));
  }, []);

  // Weekly Reviews
  const addWeeklyReview = useCallback((newReview: Omit<WeeklyReview, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const review: WeeklyReview = {
      ...newReview,
      id: `wr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    setData(prev => ({
      ...prev,
      weeklyReviews: [review, ...prev.weeklyReviews],
    }));
  }, []);

  const updateWeeklyReview = useCallback((updated: WeeklyReview) => {
    setData(prev => ({
      ...prev,
      weeklyReviews: prev.weeklyReviews.map(r =>
        r.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : r
      ),
    }));
  }, []);

  const deleteWeeklyReview = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      weeklyReviews: prev.weeklyReviews.filter(r => r.id !== id),
    }));
  }, []);

  // AI Mentor
  const saveMentorReport = useCallback((newReport: Omit<SavedMentorReport, 'id' | 'createdAt'>): SavedMentorReport => {
    const report: SavedMentorReport = {
      ...newReport,
      id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      mentorReports: [report, ...prev.mentorReports],
    }));
    return report;
  }, []);

  const deleteMentorReport = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      mentorReports: prev.mentorReports.filter(r => r.id !== id),
    }));
  }, []);

  const clearAllMentorReports = useCallback(() => {
    setData(prev => ({
      ...prev,
      mentorReports: [],
    }));
  }, []);

  const addMentorMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
    const message: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      mentorMessages: [...prev.mentorMessages, message],
    }));
    return message;
  }, []);

  const clearMentorMessages = useCallback(() => {
    setData(prev => ({
      ...prev,
      mentorMessages: [],
    }));
  }, []);

  const updateMentorPrivacySettings = useCallback((settings: Partial<MentorPrivacySettings>) => {
    setData(prev => ({
      ...prev,
      mentorPrivacySettings: {
        ...prev.mentorPrivacySettings,
        ...settings,
      },
    }));
  }, []);

  const toggleJournalExclusion = useCallback((entryId: string) => {
    setData(prev => {
      const current = prev.mentorPrivacySettings.excludedJournalEntryIds || [];
      const updated = current.includes(entryId)
        ? current.filter(id => id !== entryId)
        : [...current, entryId];
      return {
        ...prev,
        mentorPrivacySettings: {
          ...prev.mentorPrivacySettings,
          excludedJournalEntryIds: updated,
        },
      };
    });
  }, []);

  const revokeJournalConsent = useCallback(() => {
    setData(prev => ({
      ...prev,
      mentorPrivacySettings: {
        ...prev.mentorPrivacySettings,
        journalSharingConsent: false,
        rememberJournalConsent: false,
      },
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    const fresh = resetToSeedData();
    setData(fresh);
    setActiveTestDetailId(null);
    setActiveSubjectId(null);
  }, []);

  const clearAllUserData = useCallback(() => {
    const cleared = clearAllRecords();
    setData(cleared);
    setActiveTestDetailId(null);
    setActiveSubjectId(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        tasks: data.tasks,
        goals: data.goals,
        monthlyOutcomes: data.monthlyOutcomes,
        tests: data.tests,
        testErrors: data.testErrors,
        subjects: data.subjects,
        chapters: data.chapters,
        studySessions: data.studySessions,
        habits: data.habits,
        habitCompletions: data.habitCompletions,
        workouts: data.workouts,
        workoutRoutines: data.workoutRoutines,
        weightEntries: data.weightEntries,
        bodyMeasurements: data.bodyMeasurements,
        fitnessSettings: data.fitnessSettings,
        examSettings: data.examSettings,
        appSettings: data.appSettings,
        reflectionEntries: data.reflectionEntries,
        weeklyReviews: data.weeklyReviews,
        mentorReports: data.mentorReports,
        mentorMessages: data.mentorMessages,
        mentorPrivacySettings: data.mentorPrivacySettings,
        activePage,
        activeTestDetailId,
        activeSubjectId,
        testOriginPage,
        setActivePage: handleSetActivePage,
        navigateToTestDetail,
        returnToDashboard,
        returnFromTestDetail,
        navigateToSubject,
        returnToStudyLog,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        addWorkoutRoutine,
        updateWorkoutRoutine,
        deleteWorkoutRoutine,
        addWeightEntry,
        updateWeightEntry,
        deleteWeightEntry,
        addBodyMeasurement,
        updateBodyMeasurement,
        deleteBodyMeasurement,
        updateFitnessSettings,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitPause,
        toggleHabitCompletion,
        setHabitCompletionNote,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        rescheduleTask,
        addMonthlyOutcome,
        updateMonthlyOutcome,
        deleteMonthlyOutcome,
        toggleMonthlyOutcome,
        reorderMonthlyOutcomes,
        addGoal,
        updateGoal,
        deleteGoal,
        addTest,
        updateTest,
        deleteTest,
        addTestError,
        updateTestError,
        deleteTestError,
        toggleTestErrorResolved,
        addStudySession,
        updateStudySession,
        deleteStudySession,
        addSubject,
        updateSubject,
        deleteSubject,
        addChapter,
        updateChapter,
        deleteChapter,
        updateChapterMastery,
        incrementChapterRevision,
        decrementChapterRevision,
        toggleChapterWeak,
        toggleChapterInstantRevision,
        updateChapterNotes,
        addReflectionEntry,
        updateReflectionEntry,
        deleteReflectionEntry,
        addWeeklyReview,
        updateWeeklyReview,
        deleteWeeklyReview,
        saveMentorReport,
        deleteMentorReport,
        clearAllMentorReports,
        addMentorMessage,
        clearMentorMessages,
        updateMentorPrivacySettings,
        toggleJournalExclusion,
        revokeJournalConsent,
        updateExamSettings,
        updateDailyStudyTarget,
        resetDemoData,
        clearAllUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
