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
  HabitCompletion,
  WorkoutSession,
  WorkoutRoutine,
  ExerciseEntry,
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
import { formatLocalDate, parseLocalDate, getCurrentMonthString } from '../utils/dates';

// Helper to get relative date string (e.g. today + offsetDays)
function getOffsetDateString(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return formatLocalDate(date);
}

export function getInitialSeedData(): {
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
} {
  const today = formatLocalDate(new Date());

  const subjects: Subject[] = [
    {
      id: 'subj-physics',
      name: 'Physics',
      imageUrl: '/src/assets/images/subject_physics_thumb_1792286782569.jpg',
      description: 'Mechanics, Electrodynamics, Wave Optics, Thermodynamics & Modern Physics',
      createdAt: getOffsetDateString(-30),
      updatedAt: getOffsetDateString(-1),
    },
    {
      id: 'subj-chemistry',
      name: 'Chemistry',
      imageUrl: '/src/assets/images/subject_chemistry_thumb_1792286782829.jpg',
      description: 'Physical Chemistry, Organic Reaction Mechanisms & Inorganic Bonding',
      createdAt: getOffsetDateString(-30),
      updatedAt: getOffsetDateString(-2),
    },
    {
      id: 'subj-mathematics',
      name: 'Mathematics',
      imageUrl: '/src/assets/images/subject_mathematics_thumb_1792286782592.jpg',
      description: 'Calculus, Vectors & 3D Geometry, Coordinate Geometry & Algebra',
      createdAt: getOffsetDateString(-30),
      updatedAt: getOffsetDateString(-1),
    },
  ];

  const chapters: Chapter[] = [
    // Physics Chapters
    {
      id: 'chap-p1',
      subjectId: 'subj-physics',
      name: 'Laws of Motion & Friction',
      mastery: 'mains',
      revisionCount: 3,
      isWeak: false,
      needsInstantRevision: false,
      notes: 'Remember pseudo forces in accelerating frames. Wedge constraints require projecting acceleration along surface normals.',
      createdAt: getOffsetDateString(-25),
      updatedAt: getOffsetDateString(-2),
    },
    {
      id: 'chap-p2',
      subjectId: 'subj-physics',
      name: 'Rotational Dynamics & Inertia',
      mastery: 'mains',
      revisionCount: 4,
      isWeak: true,
      needsInstantRevision: true,
      notes: 'Weak on rolling with slipping friction direction and angular momentum about instantaneous center.',
      createdAt: getOffsetDateString(-24),
      updatedAt: getOffsetDateString(-1),
    },
    {
      id: 'chap-p3',
      subjectId: 'subj-physics',
      name: 'Work, Energy & Power',
      mastery: 'advanced',
      revisionCount: 2,
      isWeak: false,
      needsInstantRevision: false,
      notes: 'Work-energy theorem with conservative vs non-conservative fields. Vertical circle minimum critical velocity derivation.',
      createdAt: getOffsetDateString(-23),
      updatedAt: getOffsetDateString(-5),
    },
    {
      id: 'chap-p4',
      subjectId: 'subj-physics',
      name: 'Current Electricity & Circuits',
      mastery: 'advanced',
      revisionCount: 3,
      isWeak: false,
      needsInstantRevision: false,
      notes: 'Nodal analysis and symmetry rules for 3D resistive cubes. Temperature dependence of resistance.',
      createdAt: getOffsetDateString(-20),
      updatedAt: getOffsetDateString(-3),
    },
    {
      id: 'chap-p5',
      subjectId: 'subj-physics',
      name: 'Wave Optics & Interference',
      mastery: 'mains',
      revisionCount: 1,
      isWeak: false,
      needsInstantRevision: false,
      notes: 'YDSE fringe width shifts with thin dielectric sheets.',
      createdAt: getOffsetDateString(-18),
      updatedAt: getOffsetDateString(-6),
    },
    {
      id: 'chap-p6',
      subjectId: 'subj-physics',
      name: 'Modern Physics & Photoelectric Effect',
      mastery: 'extreme',
      revisionCount: 5,
      isWeak: false,
      needsInstantRevision: false,
      notes: 'Einstein photoelectric equations, de Broglie matter waves, and hydrogen emission spectra series.',
      createdAt: getOffsetDateString(-28),
      updatedAt: getOffsetDateString(-1),
    },

    // Chemistry Chapters
    {
      id: 'chap-c1',
      subjectId: 'subj-chemistry',
      name: 'General Organic Chemistry (GOC)',
      mastery: 'advanced',
      revisionCount: 4,
      isWeak: false,
      needsInstantRevision: false,
      notes: 'Hyperconjugation stability ordering in carbocations vs free radicals. Ortho effect in substituted benzoic acids.',
      createdAt: getOffsetDateString(-28),
      updatedAt: getOffsetDateString(-3),
    },
    {
      id: 'chap-c2',
      subjectId: 'subj-chemistry',
      name: 'Chemical Thermodynamics & Energetics',
      mastery: 'mains',
      revisionCount: 2,
      isWeak: true,
      needsInstantRevision: true,
      notes: 'Struggling with reversible adiabatic work expressions and entropy change of isolated systems.',
      createdAt: getOffsetDateString(-22),
      updatedAt: getOffsetDateString(-1),
    },
    {
      id: 'chap-c3',
      subjectId: 'subj-chemistry',
      name: 'Chemical Kinetics & Rate Laws',
      mastery: 'extreme',
      revisionCount: 3,
      isWeak: false,
      needsInstantRevision: false,
      notes: 'Arrhenius activation energy graphs and pseudo first-order reaction mechanisms.',
      createdAt: getOffsetDateString(-26),
      updatedAt: getOffsetDateString(-4),
    },
    {
      id: 'chap-c4',
      subjectId: 'subj-chemistry',
      name: 'Coordination Compounds & Isomerism',
      mastery: 'nil',
      revisionCount: 0,
      isWeak: false,
      needsInstantRevision: false,
      notes: 'High-priority chapter to cover: Werner theory, IUPAC naming, and Crystal Field Theory (CFT).',
      createdAt: getOffsetDateString(-10),
      updatedAt: getOffsetDateString(-10),
    },

    // Mathematics Chapters
    {
      id: 'chap-m1',
      subjectId: 'subj-mathematics',
      name: 'Definite Integrals & Properties',
      mastery: 'advanced',
      revisionCount: 3,
      isWeak: false,
      needsInstantRevision: false,
      notes: 'King property integral shortcuts and periodic integration properties.',
      createdAt: getOffsetDateString(-26),
      updatedAt: getOffsetDateString(-1),
    },
    {
      id: 'chap-m2',
      subjectId: 'subj-mathematics',
      name: 'Vectors & 3D Geometry',
      mastery: 'mains',
      revisionCount: 2,
      isWeak: true,
      needsInstantRevision: false,
      notes: 'Shortest distance formula between skew lines in vector form. Intersection of line and plane.',
      createdAt: getOffsetDateString(-20),
      updatedAt: getOffsetDateString(-2),
    },
    {
      id: 'chap-m3',
      subjectId: 'subj-mathematics',
      name: 'Matrices & Determinants',
      mastery: 'extreme',
      revisionCount: 4,
      isWeak: false,
      needsInstantRevision: false,
      notes: 'Adjoint properties: adj(adj A) = |A|^(n-2) A. Consistency checks with rank method.',
      createdAt: getOffsetDateString(-29),
      updatedAt: getOffsetDateString(-5),
    },
    {
      id: 'chap-m4',
      subjectId: 'subj-mathematics',
      name: 'Permutations & Combinations',
      mastery: 'nil',
      revisionCount: 1,
      isWeak: true,
      needsInstantRevision: true,
      notes: 'Partitioning into distinct vs identical groups. Need to practice derangement problems.',
      createdAt: getOffsetDateString(-15),
      updatedAt: getOffsetDateString(-2),
    },
  ];

  const tests: TestRecord[] = [
    {
      id: 'test-1',
      name: 'AITS Mains Phase Test 01',
      examType: 'Mains',
      date: getOffsetDateString(-24),
      marksObtained: 214,
      totalMarks: 300,
      source: 'Allen AITS',
      durationMinutes: 180,
      syllabusSummary: 'Mechanics 1 (Kinematics, NLM), Stoichiometry & GOC, Functions & Limits',
      weakChapters: 'Rotational dynamics, GOC acidic strength ranking',
      errorLogSummary: '5 calculation slips, 3 questions left unattempted due to poor section time allotment.',
      overallRemarks: 'Good foundation in kinematics and functions. Speed in chemistry needs tightening.',
      createdAt: getOffsetDateString(-24),
      updatedAt: getOffsetDateString(-24),
    },
    {
      id: 'test-2',
      name: 'Advanced Mock Challenge 01',
      examType: 'Advanced',
      date: getOffsetDateString(-17),
      marksObtained: 228,
      totalMarks: 360,
      source: 'FIITJEE AITS',
      durationMinutes: 360,
      syllabusSummary: 'Comprehensive Class 11 Core Physics & Chemistry, Differential Calculus',
      weakChapters: 'Multi-correct section in Physics; Negative marking in organic chemistry',
      errorLogSummary: 'Lost 12 marks due to partial marking omission. Need to build stamina for Paper 2 afternoon slot.',
      overallRemarks: 'Stamina dropped noticeably in Paper 2 math section. Need better hydration and glucose management during break.',
      createdAt: getOffsetDateString(-17),
      updatedAt: getOffsetDateString(-17),
    },
    {
      id: 'test-3',
      name: 'AITS Mains Phase Test 02',
      examType: 'Mains',
      date: getOffsetDateString(-11),
      marksObtained: 242,
      totalMarks: 300,
      source: 'Allen AITS',
      durationMinutes: 180,
      syllabusSummary: 'Electromagnetism basics, Chemical Bonding, Permutations & Matrices',
      weakChapters: 'Permutations & Combinations edge cases',
      errorLogSummary: 'Sign error on 2 algebra questions. Physics accuracy was 92%.',
      overallRemarks: 'Physics score was very strong (88/100). Chemistry bonding was clean. Math algebra needs less haste.',
      createdAt: getOffsetDateString(-11),
      updatedAt: getOffsetDateString(-11),
    },
    {
      id: 'test-4',
      name: 'Advanced Mock Challenge 02',
      examType: 'Advanced',
      date: getOffsetDateString(-6),
      marksObtained: 256,
      totalMarks: 360,
      source: 'FIITJEE AITS',
      durationMinutes: 360,
      syllabusSummary: 'Full Syllabi Simulation (Paper 1 & Paper 2 combined)',
      weakChapters: 'Fluid mechanics surface tension, Inorganic coordination isomerism',
      errorLogSummary: 'Misread question 14 ("which statement is INCORRECT"). Speed in math section improved significantly.',
      overallRemarks: 'Crossed 70% threshold in Advanced format for the first time. Physics multi-correct accuracy improved to 78%.',
      createdAt: getOffsetDateString(-6),
      updatedAt: getOffsetDateString(-6),
    },
    {
      id: 'test-5',
      name: 'AITS Mains All India Test 03',
      examType: 'Mains',
      date: getOffsetDateString(-2),
      marksObtained: 258,
      totalMarks: 300,
      source: 'Allen Leader',
      durationMinutes: 180,
      syllabusSummary: 'Wave Optics, Thermodynamics, Electrochemistry, Vectors & 3D',
      weakChapters: 'Plane-line intersection 3D vector algebra',
      errorLogSummary: 'Achieved 89% net accuracy. 1 negative penalty in Chemistry.',
      overallRemarks: 'Overall accuracy is stabilizing near 90%. Time left for review in last 15 minutes proved decisive.',
      createdAt: getOffsetDateString(-2),
      updatedAt: getOffsetDateString(-2),
    },
  ];

  const testErrors: TestError[] = [
    {
      id: 'err-1',
      testId: 'test-1',
      questionNumber: 'Q14',
      subjectId: 'subj-physics',
      chapterId: 'chap-p1',
      topic: 'Pulley System Tension',
      errorType: 'calculation',
      description: 'Arithmetic sign slip when resolving tension equations for connected masses on double incline',
      reason: 'Rushed the algebra in the final step without drawing clean isolated free body diagrams',
      correctApproach: 'Write separate FBD equilibrium equations for both blocks along the plane before substituting numbers',
      correctiveAction: 'Always box the acceleration direction before writing sigma F = ma',
      resolved: true,
      createdAt: getOffsetDateString(-24),
      updatedAt: getOffsetDateString(-20),
    },
    {
      id: 'err-2',
      testId: 'test-1',
      questionNumber: 'Q28',
      subjectId: 'subj-chemistry',
      chapterId: 'chap-c1',
      topic: 'Ortho Effect in Substituted Benzoic Acids',
      errorType: 'conceptual',
      description: 'Ranked acidity of ortho-methyl benzoic acid lower than para-methyl benzoic acid',
      reason: 'Forgot that ortho effect operates regardless of whether the group is electron withdrawing or donating',
      correctApproach: 'Ortho-substituted benzoic acids are stronger than benzoic acid due to steric inhibition of resonance',
      correctiveAction: 'Created flashcard for ortho effect exceptions in aromatic carboxylic acids',
      resolved: false,
      createdAt: getOffsetDateString(-24),
      updatedAt: getOffsetDateString(-24),
    },
    {
      id: 'err-3',
      testId: 'test-1',
      questionNumber: 'Q42',
      subjectId: 'subj-mathematics',
      chapterId: 'chap-m4',
      topic: 'Multiset Partitions',
      errorType: 'unattempted',
      description: 'Left last 3 mathematics numerical response questions completely unattempted',
      reason: 'Spent 16 minutes fighting a tedious coordinate geometry locus problem in Section 1',
      correctApproach: 'Strict 4-minute maximum cap on single-choice algebra; scan all 10 integers first to grab easy calculations',
      correctiveAction: 'Execute 50-minute strict checkpoint per subject in next mock',
      resolved: false,
      createdAt: getOffsetDateString(-24),
      updatedAt: getOffsetDateString(-24),
    },
    {
      id: 'err-4',
      testId: 'test-2',
      questionNumber: 'Q08',
      subjectId: 'subj-physics',
      chapterId: 'chap-p2',
      topic: 'Instantaneous Axis of Rotation (IAOR)',
      errorType: 'conceptual',
      description: 'Did not use IAOR to compute angular acceleration of cylinder rolling down moving wedge',
      reason: 'Got confused taking torque about center of mass while forgetting wedge acceleration produces pseudo torque',
      correctApproach: 'Take torque about the instantaneous point of contact where contact force torque vanishes',
      correctiveAction: 'Solved 12 dedicated IAOR rolling problems from Irodov and advanced material',
      resolved: true,
      createdAt: getOffsetDateString(-17),
      updatedAt: getOffsetDateString(-12),
    },
    {
      id: 'err-5',
      testId: 'test-2',
      questionNumber: 'Q19',
      subjectId: 'subj-chemistry',
      chapterId: 'chap-c2',
      topic: 'Spontaneity Criteria (Delta G vs Delta S)',
      errorType: 'misread-question',
      description: 'Selected correct thermodynamic statement when question explicitly asked for the INCORRECT condition',
      reason: 'Did not underline or circle negative keywords in the question stem',
      correctApproach: 'Active pencil marking: Circle NOT, FALSE, INCORRECT on paper before inspecting options',
      correctiveAction: 'Enforce question-stem keyword circling protocol in all timed papers',
      resolved: true,
      createdAt: getOffsetDateString(-17),
      updatedAt: getOffsetDateString(-15),
    },
    {
      id: 'err-6',
      testId: 'test-2',
      questionNumber: 'Q31',
      subjectId: 'subj-mathematics',
      chapterId: 'chap-m1',
      topic: 'Definite Integral Limits',
      errorType: 'silly',
      description: 'Integrated correctly with substitution t = tan x, but forgot to transform limits from x to t',
      reason: 'Turned the rough page midway through the step and copied the original limits [0, pi/4] onto the new page',
      correctApproach: 'Always write transformed limits immediately adjacent to dt before proceeding with antiderivative',
      correctiveAction: 'Draw a boundary box on rough sheet containing substitution key and limits',
      resolved: false,
      createdAt: getOffsetDateString(-17),
      updatedAt: getOffsetDateString(-17),
    },
    {
      id: 'err-7',
      testId: 'test-4',
      questionNumber: 'Q11',
      subjectId: 'subj-physics',
      chapterId: 'chap-p2',
      topic: 'Rotational Angular Momentum',
      errorType: 'time-management',
      description: 'Verified options A and B correctly in multi-correct question, but missed option D before bell',
      reason: 'Paper 2 multi-correct section had lengthy calculations; lost time in optics section',
      correctApproach: 'Eliminate options using dimensional analysis and limit cases (e.g. theta = 0, infinity) before computing full integral',
      correctiveAction: 'Apply boundary condition checking before calculating full algebra in Advanced multi-correct',
      resolved: false,
      createdAt: getOffsetDateString(-6),
      updatedAt: getOffsetDateString(-6),
    },
    {
      id: 'err-8',
      testId: 'test-4',
      questionNumber: 'Q35',
      subjectId: 'subj-mathematics',
      chapterId: 'chap-m2',
      topic: 'Skew Lines Shortest Distance',
      errorType: 'guess',
      description: 'Attempted to guess whether two parameterized lines intersected and lost -2 negative marks',
      reason: 'Felt anxiety about attempting fewer questions in Paper 2 Math',
      correctApproach: 'Zero-tolerance rule for guessing in negative-marking multi-correct and single-choice sections',
      correctiveAction: 'Skip any question where confidence is below 90% in negative marking zone',
      resolved: true,
      createdAt: getOffsetDateString(-6),
      updatedAt: getOffsetDateString(-3),
    },
  ];

  const studySessions: StudySession[] = [
    {
      id: 'session-1',
      date: today,
      subjectId: 'subj-physics',
      chapterId: 'chap-p1',
      durationMinutes: 195, // 3h 15m
      questionsAttempted: 68,
      questionsCorrect: 59,
      activityType: 'practice',
      notes: 'Solved HC Verma Chapter 5 Newton Laws advanced problem set',
      createdAt: today,
      subject: 'Physics',
      topic: 'Laws of Motion & Friction',
      questionsSolved: 68,
    },
    {
      id: 'session-2',
      date: today,
      subjectId: 'subj-mathematics',
      chapterId: 'chap-m1',
      durationMinutes: 150, // 2h 30m
      questionsAttempted: 52,
      questionsCorrect: 45,
      activityType: 'practice',
      notes: 'Mastered King property integration and Leibniz rule problems',
      createdAt: today,
      subject: 'Mathematics',
      topic: 'Definite Integrals & Properties',
      questionsSolved: 52,
    },
    {
      id: 'session-prev-1',
      date: getOffsetDateString(-1),
      subjectId: 'subj-chemistry',
      chapterId: 'chap-c2',
      durationMinutes: 240, // 4h
      questionsAttempted: 65,
      questionsCorrect: 52,
      activityType: 'theory',
      notes: 'Thermodynamics enthalpy, entropy of mixing and free energy derivations',
      createdAt: getOffsetDateString(-1),
      subject: 'Chemistry',
      topic: 'Chemical Thermodynamics',
      questionsSolved: 65,
    },
    {
      id: 'session-prev-2',
      date: getOffsetDateString(-2),
      subjectId: 'subj-physics',
      chapterId: 'chap-p2',
      durationMinutes: 210, // 3h 30m
      questionsAttempted: 55,
      questionsCorrect: 41,
      activityType: 'mock_analysis',
      notes: 'Analyzed rotational dynamics mistakes from AITS Mock Test 03',
      createdAt: getOffsetDateString(-2),
      subject: 'Physics',
      topic: 'Rotational Dynamics & Inertia',
      questionsSolved: 55,
    },
    {
      id: 'session-prev-3',
      date: getOffsetDateString(-3),
      subjectId: 'subj-mathematics',
      chapterId: 'chap-m2',
      durationMinutes: 180, // 3h
      questionsAttempted: 45,
      questionsCorrect: 38,
      activityType: 'revision',
      notes: '3D geometry skew lines and projection formulas rapid flashcard recall',
      createdAt: getOffsetDateString(-3),
      subject: 'Mathematics',
      topic: 'Vectors & 3D Geometry',
      questionsSolved: 45,
    },
    {
      id: 'session-prev-4',
      date: getOffsetDateString(-4),
      subjectId: 'subj-chemistry',
      chapterId: 'chap-c1',
      durationMinutes: 220, // 3h 40m
      questionsAttempted: 70,
      questionsCorrect: 64,
      activityType: 'practice',
      notes: 'Organic aromaticity, resonance hybrids and inductive effects',
      createdAt: getOffsetDateString(-4),
      subject: 'Chemistry',
      topic: 'General Organic Chemistry (GOC)',
      questionsSolved: 70,
    },
    {
      id: 'session-prev-5',
      date: getOffsetDateString(-5),
      subjectId: 'subj-physics',
      chapterId: 'chap-p6',
      durationMinutes: 165, // 2h 45m
      questionsAttempted: 50,
      questionsCorrect: 47,
      activityType: 'theory',
      notes: 'Photoelectric effect stopping potential and de Broglie wavelengths',
      createdAt: getOffsetDateString(-5),
      subject: 'Physics',
      topic: 'Modern Physics & Photoelectric Effect',
      questionsSolved: 50,
    },
    {
      id: 'session-prev-6',
      date: getOffsetDateString(-6),
      subjectId: 'subj-mathematics',
      chapterId: 'chap-m3',
      durationMinutes: 190, // 3h 10m
      questionsAttempted: 60,
      questionsCorrect: 56,
      activityType: 'practice',
      notes: 'System of linear equations and determinant properties timed drill',
      createdAt: getOffsetDateString(-6),
      subject: 'Mathematics',
      topic: 'Matrices & Determinants',
      questionsSolved: 60,
    },
  ];

  const tasks: Task[] = [
    {
      id: 'task-1',
      title: 'Complete Physics Module 3 — Laws of Motion & Friction',
      dueDate: today,
      priority: 'high',
      status: 'in_progress',
      completed: false,
      category: 'Physics',
      notes: 'Focus on pulley systems and wedge constraints',
      createdAt: getOffsetDateString(-2),
    },
    {
      id: 'task-2',
      title: 'Solve 50 Mathematics problems (Definite Integrals)',
      dueDate: today,
      priority: 'high',
      status: 'done',
      completed: true,
      category: 'Mathematics',
      notes: 'King property and Leibniz rule practice',
      createdAt: getOffsetDateString(-1),
    },
    {
      id: 'task-3',
      title: 'Revise Organic Reaction Mechanisms (GOC & Hydrocarbons)',
      dueDate: today,
      priority: 'medium',
      status: 'not_started',
      completed: false,
      category: 'Chemistry',
      notes: 'Carbocation rearrangements and markovnikov additions',
      createdAt: today,
    },
    {
      id: 'task-4',
      title: 'Analyze mistakes from Advanced Mock Test 02',
      dueDate: today,
      priority: 'medium',
      status: 'done',
      completed: true,
      category: 'Analysis',
      notes: 'Log all calculation errors into the weak chapter notes',
      createdAt: today,
    },
    {
      id: 'task-5',
      title: 'Chemistry Thermodynamics & Equilibrium Sectional Test',
      dueDate: getOffsetDateString(1),
      priority: 'high',
      status: 'not_started',
      completed: false,
      category: 'Chemistry',
      notes: '60 minute timed test on delta G and phase equilibria',
      createdAt: today,
    },
    {
      id: 'task-6',
      title: 'Full Syllabus JEE Mains Simulation Mock #05',
      dueDate: getOffsetDateString(3),
      priority: 'high',
      status: 'not_started',
      completed: false,
      category: 'Mock Test',
      notes: 'Timed 3 hours with exact exam morning slot',
      createdAt: today,
    },
    {
      id: 'task-7',
      title: 'Physics Rotation & Angular Momentum Advanced Problems',
      dueDate: getOffsetDateString(5),
      priority: 'medium',
      status: 'not_started',
      completed: false,
      category: 'Physics',
      notes: 'Irodov chapter 1 problems 240-270',
      createdAt: today,
    },
    {
      id: 'task-8',
      title: 'Weekly Error Log Consolidation & Formula Revision',
      dueDate: getOffsetDateString(6),
      priority: 'low',
      status: 'not_started',
      completed: false,
      category: 'Revision',
      notes: 'Condense week notes into high-yield formula sheets',
      createdAt: today,
    },
    {
      id: 'task-9',
      title: 'Calculus Limits & Continuity High-Speed Drill',
      dueDate: getOffsetDateString(1),
      priority: 'medium',
      status: 'not_started',
      completed: false,
      category: 'Mathematics',
      notes: 'L Hospital expansions and squeeze theorem edge cases',
      createdAt: today,
    },
    {
      id: 'task-10',
      title: 'Wave Optics & Double Slit Interference Derivations',
      dueDate: getOffsetDateString(2),
      priority: 'high',
      status: 'not_started',
      completed: false,
      category: 'Physics',
      notes: 'Fringe width variations with immersion liquid and optical path length',
      createdAt: today,
    },
    {
      id: 'task-11',
      title: 'Legs & Core Strength Workout Session',
      dueDate: getOffsetDateString(2),
      priority: 'low',
      status: 'done',
      completed: true,
      category: 'Fitness',
      notes: 'Squats 4x8, Romanian deadlifts, hanging leg raises',
      createdAt: getOffsetDateString(-1),
    },
    {
      id: 'task-12',
      title: 'Inorganic Coordination Compounds Crystal Field Splitting Drill',
      dueDate: getOffsetDateString(3),
      priority: 'medium',
      status: 'not_started',
      completed: false,
      category: 'Chemistry',
      notes: 'High spin vs low spin d-orbital electron configurations',
      createdAt: today,
    },
    {
      id: 'task-13',
      title: '3D Geometry Skew Lines & Shortest Distance Problem Set',
      dueDate: getOffsetDateString(4),
      priority: 'high',
      status: 'not_started',
      completed: false,
      category: 'Mathematics',
      notes: 'Vector triple product and plane equations practice',
      createdAt: today,
    },
    {
      id: 'task-14',
      title: 'Upper Body Push & Mobility Session',
      dueDate: getOffsetDateString(4),
      priority: 'low',
      status: 'not_started',
      completed: false,
      category: 'Fitness',
      notes: 'Bench press, overhead press, thoracic spine mobility',
      createdAt: today,
    },
    {
      id: 'task-15',
      title: 'Chemistry Mock Analysis & Systematic Error Tagging',
      dueDate: getOffsetDateString(5),
      priority: 'medium',
      status: 'not_started',
      completed: false,
      category: 'Analysis',
      notes: 'Categorize silly calculation slips vs knowledge gaps',
      createdAt: today,
    },
    {
      id: 'task-16',
      title: 'Full JEE Advanced Paper 1 Simulation (Timed 3 Hours)',
      dueDate: getOffsetDateString(6),
      priority: 'high',
      status: 'not_started',
      completed: false,
      category: 'Mock Test',
      notes: 'Strict exam conditions: 9:00 AM to 12:00 PM',
      createdAt: today,
    },
  ];

  const currentMonthStr = getCurrentMonthString(); // e.g. "2026-10"

  const monthlyOutcomes: MonthlyOutcome[] = [
    // Current month outcomes
    {
      id: 'mo-1',
      month: currentMonthStr,
      title: 'Master 100% of Rotational Dynamics & Electrodynamics High-Yield Problem Sets',
      description: 'Solve and review 150 Level-2 and Level-3 questions with detailed error documentation.',
      dueDate: `${currentMonthStr}-28`,
      completed: false,
      order: 1,
      createdAt: getOffsetDateString(-20),
      updatedAt: getOffsetDateString(-2),
    },
    {
      id: 'mo-2',
      month: currentMonthStr,
      title: 'Score ≥ 220/300 on Sunday Full Syllabus Mocks (Rank Top 2%)',
      description: 'Maintain accuracy above 85% in Physics and Mathematics with under 5 negative marking errors.',
      dueDate: `${currentMonthStr}-25`,
      completed: true,
      order: 2,
      createdAt: getOffsetDateString(-20),
      updatedAt: getOffsetDateString(-1),
    },
    {
      id: 'mo-3',
      month: currentMonthStr,
      title: 'Complete Organic Chemistry Reaction Mechanisms Synthesis Drills',
      description: 'Map out all named reactions, electrophilic aromatic substitutions, and reagent charts.',
      dueDate: `${currentMonthStr}-20`,
      completed: true,
      order: 3,
      createdAt: getOffsetDateString(-20),
      updatedAt: getOffsetDateString(-3),
    },
    {
      id: 'mo-4',
      month: currentMonthStr,
      title: 'Log 20+ Workout Sessions & Maintain 72kg Target Bodyweight',
      description: 'Sustain strength progression on compound lifts and 10k daily step baseline.',
      dueDate: `${currentMonthStr}-31`,
      completed: true,
      order: 4,
      createdAt: getOffsetDateString(-20),
      updatedAt: today,
    },
    {
      id: 'mo-5',
      month: currentMonthStr,
      title: 'Zero Missed Morning Deep Work Blocks (28/28 Consecutive Days)',
      description: 'Protect 7:00 AM – 9:30 AM deep study session before digital communication.',
      dueDate: `${currentMonthStr}-31`,
      completed: false,
      order: 5,
      createdAt: getOffsetDateString(-20),
      updatedAt: today,
    },
    // Previous month outcomes (for historical navigation)
    {
      id: 'mo-prev-1',
      month: '2026-09',
      title: 'Finish Differential & Integral Calculus Mastery Module',
      description: 'Conquer limits, derivatives, integrals, and differential equations.',
      dueDate: '2026-09-28',
      completed: true,
      order: 1,
      createdAt: '2026-09-01T08:00:00Z',
      updatedAt: '2026-09-28T18:00:00Z',
    },
    {
      id: 'mo-prev-2',
      month: '2026-09',
      title: 'Establish 7.5 hr daily average study baseline',
      description: 'Consistent tracking without burnout; hit weekly study targets.',
      dueDate: '2026-09-30',
      completed: true,
      order: 2,
      createdAt: '2026-09-01T08:00:00Z',
      updatedAt: '2026-09-30T20:00:00Z',
    },
    {
      id: 'mo-prev-3',
      month: '2026-09',
      title: 'Complete Physical Chemistry Equilibrium & Thermodynamics Revision',
      description: 'Solidify Gibbs free energy and chemical kinetics problem types.',
      dueDate: '2026-09-24',
      completed: true,
      order: 3,
      createdAt: '2026-09-01T08:00:00Z',
      updatedAt: '2026-09-24T15:00:00Z',
    },
    // Next month outcomes (for forward planning navigation)
    {
      id: 'mo-next-1',
      month: '2026-11',
      title: 'Begin Full Syllabus Advanced Mock Test Series (2 mocks / week)',
      description: 'Simulate rigorous 6-hour paper sessions with time allocations.',
      dueDate: '2026-11-20',
      completed: false,
      order: 1,
      createdAt: today,
      updatedAt: today,
    },
    {
      id: 'mo-next-2',
      month: '2026-11',
      title: 'Complete Inorganic Chemistry Block-Chemistry Fact Cards',
      description: 'Memorize periodic trends, coordination isomerism, and metallurgy steps.',
      dueDate: '2026-11-15',
      completed: false,
      order: 2,
      createdAt: today,
      updatedAt: today,
    },
    {
      id: 'mo-next-3',
      month: '2026-11',
      title: 'Eliminate calculation errors in Mathematics Sectional Timed Sprints',
      description: 'Target zero negative marks in algebraic and trigonometric steps.',
      dueDate: '2026-11-28',
      completed: false,
      order: 3,
      createdAt: today,
      updatedAt: today,
    },
  ];

  const goals: Goal[] = [
    {
      id: 'goal-1',
      title: 'Academic Excellence',
      identityStatement: 'I am becoming a disciplined and capable problem solver.',
      description: 'Master advanced problem solving across Physics, Chemistry, and Mathematics with deliberate practice and strict error analysis.',
      progress: 74,
      targetDate: getOffsetDateString(90),
      imageUrl: '/src/assets/images/goal_academic_excellence_1792260639043.jpg',
      createdAt: getOffsetDateString(-30),
    },
    {
      id: 'goal-2',
      title: 'Consistent Fitness',
      identityStatement: 'I am building strength through sustainable habits.',
      description: 'Maintain 5x weekly strength and mobility training sessions to sustain peak mental endurance and physical energy.',
      progress: 62,
      targetDate: getOffsetDateString(75),
      imageUrl: '/src/assets/images/goal_fitness_strength_1792260638560.jpg',
      createdAt: getOffsetDateString(-25),
    },
    {
      id: 'goal-3',
      title: 'Cognitive Stamina & Focus',
      identityStatement: 'I am cultivating unwavering clarity under high exam pressure.',
      description: 'Train sustained attention spans during 3-hour uninterrupted problem-solving blocks without mental fatigue.',
      progress: 80,
      targetDate: getOffsetDateString(60),
      createdAt: getOffsetDateString(-20),
    },
    {
      id: 'goal-4',
      title: 'Top 500 All-India Rank in JEE Advanced',
      identityStatement: 'I am executing deliberate mastery daily with relentless consistency.',
      description: 'Systematically eliminate chapter weaknesses and solidify top-percentile test execution accuracy.',
      progress: 68,
      targetDate: getOffsetDateString(180),
      createdAt: getOffsetDateString(-15),
    },
  ];

  const habits: Habit[] = [
    {
      id: 'habit-1',
      name: 'Deep Morning Study Block (2.5h)',
      title: 'Deep Morning Study Block (2.5h)',
      description: 'First high-cognitive session of the day before any distractions or phone usage.',
      category: 'study',
      icon: 'BookOpen',
      color: '#9B7BFF',
      isActive: true,
      isNonNegotiable: true,
      isMustDo: true,
      schedule: { type: 'daily', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
      scheduledDays: [0, 1, 2, 3, 4, 5, 6],
      startDate: getOffsetDateString(-45),
      createdAt: getOffsetDateString(-45),
      updatedAt: getOffsetDateString(-2),
      streak: 18,
    },
    {
      id: 'habit-2',
      name: '50+ High-Yield Problem Sets',
      title: '50+ High-Yield Problem Sets',
      description: 'Deliberate practice with timed numericals and multi-concept questions.',
      category: 'study',
      icon: 'Target',
      color: '#9B7BFF',
      isActive: true,
      isNonNegotiable: true,
      isMustDo: true,
      schedule: { type: 'custom_days', daysOfWeek: [1, 2, 3, 4, 5, 6] }, // Mon–Sat
      scheduledDays: [1, 2, 3, 4, 5, 6],
      startDate: getOffsetDateString(-45),
      createdAt: getOffsetDateString(-45),
      updatedAt: getOffsetDateString(-2),
      streak: 12,
    },
    {
      id: 'habit-3',
      name: 'No Social Feeds / Phone Before 9 AM',
      title: 'No Social Feeds / Phone Before 9 AM',
      description: 'Preserve dopamine baseline and focus state during prime morning hours.',
      category: 'discipline',
      icon: 'Sparkles',
      color: '#06B6D4',
      isActive: true,
      isNonNegotiable: true,
      isMustDo: true,
      schedule: { type: 'daily', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
      scheduledDays: [0, 1, 2, 3, 4, 5, 6],
      startDate: getOffsetDateString(-45),
      createdAt: getOffsetDateString(-45),
      updatedAt: getOffsetDateString(-2),
      streak: 15,
    },
    {
      id: 'habit-4',
      name: 'Error Log & Conceptual Review',
      title: 'Error Log & Conceptual Review',
      description: 'Log every wrong question into the error taxonomy and note root cause.',
      category: 'mindset',
      icon: 'Brain',
      color: '#F59E0B',
      isActive: true,
      isNonNegotiable: false,
      isMustDo: false,
      schedule: { type: 'daily', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
      scheduledDays: [0, 1, 2, 3, 4, 5, 6],
      startDate: getOffsetDateString(-40),
      createdAt: getOffsetDateString(-40),
      updatedAt: getOffsetDateString(-2),
      streak: 9,
    },
    {
      id: 'habit-5',
      name: 'Hydration Target (3L Water)',
      title: 'Hydration Target (3L Water)',
      description: 'Adequate hydration to prevent cognitive fatigue and midday brain fog.',
      category: 'health',
      icon: 'Droplets',
      color: '#F43F5E',
      isActive: true,
      isNonNegotiable: false,
      isMustDo: false,
      schedule: { type: 'daily', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
      scheduledDays: [0, 1, 2, 3, 4, 5, 6],
      startDate: getOffsetDateString(-45),
      createdAt: getOffsetDateString(-45),
      updatedAt: getOffsetDateString(-2),
      streak: 24,
    },
    {
      id: 'habit-6',
      name: 'Strength / Mobility Training (45m)',
      title: 'Strength / Mobility Training (45m)',
      description: 'Physical conditioning to maintain spinal health and mental stamina.',
      category: 'fitness',
      icon: 'Dumbbell',
      color: '#43D9A3',
      isActive: true,
      isNonNegotiable: false,
      isMustDo: false,
      schedule: { type: 'custom_days', daysOfWeek: [1, 2, 3, 4, 5, 6] }, // Mon–Sat
      scheduledDays: [1, 2, 3, 4, 5, 6],
      startDate: getOffsetDateString(-45),
      createdAt: getOffsetDateString(-45),
      updatedAt: getOffsetDateString(-2),
      streak: 8,
    },
    {
      id: 'habit-7',
      name: 'Evening Plan & Priority Setup',
      title: 'Evening Plan & Priority Setup',
      description: 'Define top 3 academic priorities before sleep to avoid morning decision paralysis.',
      category: 'discipline',
      icon: 'CheckSquare',
      color: '#06B6D4',
      isActive: true,
      isNonNegotiable: false,
      isMustDo: false,
      schedule: { type: 'daily', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
      scheduledDays: [0, 1, 2, 3, 4, 5, 6],
      startDate: getOffsetDateString(-45),
      createdAt: getOffsetDateString(-45),
      updatedAt: getOffsetDateString(-2),
      streak: 21,
    },
  ];

  // Generate historical completion records across the past 28 days + today
  const habitCompletions: HabitCompletion[] = [];
  let completionCounter = 1;

  for (let offset = -28; offset <= 0; offset++) {
    const dateStr = getOffsetDateString(offset);
    const dayOfWeek = parseLocalDate(dateStr).getDay();

    habits.forEach(h => {
      // Check if habit is scheduled on this day
      const isScheduled =
        h.schedule.type === 'daily' ||
        (h.schedule.type === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) ||
        (h.schedule.type === 'custom_days' && h.schedule.daysOfWeek.includes(dayOfWeek));

      if (!isScheduled) return;

      let isDone = false;
      let note: string | undefined = undefined;

      if (offset === 0) {
        // Exact today states:
        if (h.id === 'habit-1') {
          isDone = true;
          note = 'Completed 6:30 AM – 9:00 AM uninterrupted';
        } else if (h.id === 'habit-2') {
          isDone = true;
          note = 'Solved 52 questions in mechanics & matrices';
        } else if (h.id === 'habit-3') {
          isDone = true;
          note = 'Device kept outside bedroom until morning block finished';
        } else if (h.id === 'habit-4') {
          isDone = false;
        } else if (h.id === 'habit-5') {
          isDone = true;
          note = '3.2L logged throughout the day';
        } else if (h.id === 'habit-6') {
          isDone = true;
          note = 'Push & core session completed at 4:30 PM';
        } else if (h.id === 'habit-7') {
          isDone = false;
        }
      } else {
        // Historical days:
        // habit-1: completed every scheduled day
        // habit-2: completed 95% of days
        // habit-3: completed 95% of days
        // habit-5: completed 95% of days
        // habit-6: completed ~85% of days
        // habit-4: completed ~80% of days
        // habit-7: completed ~85% of days
        const pseudoRandom = Math.abs((offset * 17 + h.id.charCodeAt(h.id.length - 1) * 31) % 100);

        if (h.id === 'habit-1' || h.id === 'habit-3' || h.id === 'habit-5') {
          isDone = pseudoRandom > 8; // ~92%
        } else if (h.id === 'habit-2') {
          isDone = pseudoRandom > 12; // ~88%
        } else if (h.id === 'habit-6') {
          isDone = pseudoRandom > 15; // ~85%
        } else {
          isDone = pseudoRandom > 20; // ~80%
        }

        // Add occasional notes on historical days
        if (isDone && offset === -1 && h.id === 'habit-1') {
          note = 'Completed on schedule';
        }
      }

      habitCompletions.push({
        id: `hc-${completionCounter++}`,
        habitId: h.id,
        date: dateStr,
        completed: isDone,
        note,
      });
    });
  }

  const workouts: WorkoutSession[] = [
    {
      id: 'workout-1',
      date: today,
      name: 'Push Day & Core Stability',
      workoutType: 'strength',
      durationMinutes: 45,
      exercises: [
        { id: 'ex-1-1', name: 'Incline Dumbbell Bench Press', sets: 4, reps: 10, weight: 26, notes: 'Felt clean on all sets' },
        { id: 'ex-1-2', name: 'Seated Dumbbell Shoulder Press', sets: 3, reps: 12, weight: 18, notes: 'Controlled tempo' },
        { id: 'ex-1-3', name: 'Cable Lateral Raises', sets: 4, reps: 15, weight: 7.5, notes: 'Strict form, no momentum' },
        { id: 'ex-1-4', name: 'Hanging Knee Raises & Planks', sets: 3, reps: 15, notes: '3 x 45s planks' },
      ],
      notes: 'Overhead press, dumbbell bench, lateral raises, hollow body holds. Excellent mind-muscle connection.',
      createdAt: today,
      updatedAt: today,
    },
    {
      id: 'workout-prev-1',
      date: getOffsetDateString(-2),
      name: 'Pull Day & Hamstrings',
      workoutType: 'strength',
      durationMinutes: 50,
      exercises: [
        { id: 'ex-2-1', name: 'Weighted Pull-ups', sets: 4, reps: 6, weight: 10, notes: 'Bodyweight + 10kg belt' },
        { id: 'ex-2-2', name: 'Chest-Supported Row', sets: 3, reps: 10, weight: 32 },
        { id: 'ex-2-3', name: 'Romanian Deadlifts', sets: 4, reps: 8, weight: 70, notes: 'Hips high, deep hamstring stretch' },
        { id: 'ex-2-4', name: 'Incline Dumbbell Curls', sets: 3, reps: 12, weight: 12 },
      ],
      notes: 'Weighted pullups, Romanian deadlifts, chest-supported rows.',
      createdAt: getOffsetDateString(-2),
      updatedAt: getOffsetDateString(-2),
    },
    {
      id: 'workout-prev-2',
      date: getOffsetDateString(-4),
      name: 'Legs & Lower Body Power',
      workoutType: 'strength',
      durationMinutes: 55,
      exercises: [
        { id: 'ex-3-1', name: 'Barbell Back Squats', sets: 4, reps: 8, weight: 85, notes: 'Below parallel depth' },
        { id: 'ex-3-2', name: 'Bulgarian Split Squats', sets: 3, reps: 10, weight: 16 },
        { id: 'ex-3-3', name: 'Standing Calf Raises', sets: 4, reps: 15, weight: 45 },
      ],
      notes: 'Heavy squat session. Felt strong throughout.',
      createdAt: getOffsetDateString(-4),
      updatedAt: getOffsetDateString(-4),
    },
    {
      id: 'workout-prev-3',
      date: getOffsetDateString(-6),
      name: 'Zone 2 Cardio & Aerobic Base',
      workoutType: 'cardio',
      durationMinutes: 35,
      exercises: [
        { id: 'ex-4-1', name: 'Outdoor Continuous Run', sets: 1, reps: 1, notes: 'Pace: 5:45 min/km · Heart rate 135-142 bpm' },
      ],
      notes: 'Steady cadence, conversational pace for brain oxygenation.',
      createdAt: getOffsetDateString(-6),
      updatedAt: getOffsetDateString(-6),
    },
    {
      id: 'workout-prev-4',
      date: getOffsetDateString(-9),
      name: 'Upper Hypertrophy & Arms',
      workoutType: 'strength',
      durationMinutes: 50,
      exercises: [
        { id: 'ex-5-1', name: 'Flat Barbell Bench Press', sets: 4, reps: 8, weight: 65 },
        { id: 'ex-5-2', name: 'Cable Tricep Pushdowns', sets: 3, reps: 12, weight: 22.5 },
      ],
      notes: 'High volume push and pull accessory work.',
      createdAt: getOffsetDateString(-9),
      updatedAt: getOffsetDateString(-9),
    },
    {
      id: 'workout-prev-5',
      date: getOffsetDateString(-13),
      name: 'Active Mobility & Hip Opening',
      workoutType: 'mobility',
      durationMinutes: 30,
      notes: 'Couch stretch, 90/90 hip flow, thoracic foam rolling.',
      createdAt: getOffsetDateString(-13),
      updatedAt: getOffsetDateString(-13),
    },
    {
      id: 'workout-prev-6',
      date: getOffsetDateString(-16),
      name: 'Full Body Functional Strength',
      workoutType: 'strength',
      durationMinutes: 48,
      notes: 'Trap bar deadlift, push press, kettlebell swings.',
      createdAt: getOffsetDateString(-16),
      updatedAt: getOffsetDateString(-16),
    },
  ];

  const weightEntries: WeightEntry[] = [
    {
      id: 'weight-1',
      date: today,
      weightKg: 71.8,
      notes: 'Fasted morning weigh-in after hydration.',
      createdAt: today,
      updatedAt: today,
    },
    {
      id: 'weight-2',
      date: getOffsetDateString(-3),
      weightKg: 72.0,
      notes: 'Morning weigh-in.',
      createdAt: getOffsetDateString(-3),
      updatedAt: getOffsetDateString(-3),
    },
    {
      id: 'weight-3',
      date: getOffsetDateString(-7),
      weightKg: 72.2,
      notes: 'Post-rest day.',
      createdAt: getOffsetDateString(-7),
      updatedAt: getOffsetDateString(-7),
    },
    {
      id: 'weight-4',
      date: getOffsetDateString(-11),
      weightKg: 72.4,
      createdAt: getOffsetDateString(-11),
      updatedAt: getOffsetDateString(-11),
    },
    {
      id: 'weight-5',
      date: getOffsetDateString(-15),
      weightKg: 72.6,
      createdAt: getOffsetDateString(-15),
      updatedAt: getOffsetDateString(-15),
    },
    {
      id: 'weight-6',
      date: getOffsetDateString(-20),
      weightKg: 72.9,
      notes: 'Weekly baseline check.',
      createdAt: getOffsetDateString(-20),
      updatedAt: getOffsetDateString(-20),
    },
    {
      id: 'weight-7',
      date: getOffsetDateString(-25),
      weightKg: 73.1,
      createdAt: getOffsetDateString(-25),
      updatedAt: getOffsetDateString(-25),
    },
    {
      id: 'weight-8',
      date: getOffsetDateString(-28),
      weightKg: 73.4,
      notes: 'Initial starting measurement for Phase 4.',
      createdAt: getOffsetDateString(-28),
      updatedAt: getOffsetDateString(-28),
    },
  ];

  const bodyMeasurements: BodyMeasurementEntry[] = [
    {
      id: 'bm-1',
      date: today,
      waistCm: 80.5,
      chestCm: 100.0,
      hipsCm: 95.0,
      armCm: 34.5,
      thighCm: 56.0,
      notes: 'Waist down 2cm from starting baseline.',
      createdAt: today,
      updatedAt: today,
    },
    {
      id: 'bm-2',
      date: getOffsetDateString(-14),
      waistCm: 81.5,
      chestCm: 99.5,
      hipsCm: 95.5,
      armCm: 34.2,
      thighCm: 56.2,
      createdAt: getOffsetDateString(-14),
      updatedAt: getOffsetDateString(-14),
    },
    {
      id: 'bm-3',
      date: getOffsetDateString(-28),
      waistCm: 82.5,
      chestCm: 99.0,
      hipsCm: 96.0,
      armCm: 34.0,
      thighCm: 56.5,
      notes: 'Phase 4 baseline measurement.',
      createdAt: getOffsetDateString(-28),
      updatedAt: getOffsetDateString(-28),
    },
  ];

  const workoutRoutines: WorkoutRoutine[] = [
    {
      id: 'routine-push-day',
      name: 'Push Day',
      workoutType: 'strength',
      durationMinutes: 40,
      exercises: [
        { id: 'r-ex-1', name: 'Push Up', sets: 3, reps: 10 },
        { id: 'r-ex-2', name: 'Tricep Dips', sets: 3, reps: 10 },
        { id: 'r-ex-3', name: 'Lateral Raises', sets: 3, reps: 10 },
      ],
      notes: 'Controlled eccentric, 60-90s rest between sets.',
      createdAt: today,
      updatedAt: today,
    },
  ];

  const fitnessSettings: FitnessSettings = {
    displayWeightUnit: 'kg',
    displayLengthUnit: 'in',
  };

  const examSettings: ExamSettings = {
    examName: 'JEE Advanced 2027',
    examDate: getOffsetDateString(218), // ~7 months out
    mainsTargetScore: 250,
    advancedTargetScore: 260,
  };

  const appSettings: AppSettings = {
    dailyStudyTargetHours: 8.0,
    userName: 'Student',
    isSampleDataLoaded: true,
  };

  const reflectionEntries: ReflectionEntry[] = [
    {
      id: 'ref-1',
      date: today,
      title: 'High-Cognitive Momentum & Flow State Calibration',
      content: 'Morning deep-work block on Rotational Dynamics went exceptionally well. Cleared 45 questions without breaking flow state. In the afternoon, noticed energy dipping slightly during the organic synthesis drill—switching to timed 25-minute Pomodoro intervals helped regain sharpness. Evening workout was solid; hit 4x8 on compound lifts. Mind feels clear and ready for tomorrow\'s test simulations.',
      mood: 'great',
      energy: 'high',
      tags: ['DeepWork', 'Physics', 'Momentum', 'Fitness'],
      highlights: {
        mainWin: 'Cleared rotational mechanics level 3 problems without looking at hints',
        biggestChallenge: 'Afternoon energy drop around 3 PM',
        lessonLearned: 'Keep lunch light and hydrate before complex problem-solving sessions',
        priorityTomorrow: 'Full Mains Simulation Mock 05 morning slot',
      },
      checklist: {
        reviewedLearning: 'yes',
        taskProgress: 'yes',
        physicalWellbeing: 'yes',
        reflectedOnMistake: 'yes',
        identifiedNextStep: 'yes',
      },
      createdAt: `${today}T19:30:00Z`,
      updatedAt: `${today}T19:30:00Z`,
    },
    {
      id: 'ref-2',
      date: getOffsetDateString(-1),
      title: 'Calculus Precision and Error Log Extraction',
      content: 'Dedicated the entire second session to reviewing the Advanced Mock Test 02. Found 3 recurring calculation slips in definite integrals where I rushed algebraic signs. Logged all into weak chapter notes. Feeling grounded—facing mistakes directly removes exam anxiety.',
      mood: 'good',
      energy: 'moderate',
      tags: ['ErrorAnalysis', 'Maths', 'Discipline'],
      highlights: {
        mainWin: 'Cataloged all negative marks from mock test systematically',
        biggestChallenge: 'Staying patient during repetitive algebra checks',
        lessonLearned: 'Write intermediate algebraic bounds explicitly rather than doing them mentally',
        priorityTomorrow: 'Laws of motion pulley constraints and friction drills',
      },
      checklist: {
        reviewedLearning: 'yes',
        taskProgress: 'yes',
        physicalWellbeing: 'partly',
        reflectedOnMistake: 'yes',
        identifiedNextStep: 'yes',
      },
      createdAt: `${getOffsetDateString(-1)}T20:15:00Z`,
      updatedAt: `${getOffsetDateString(-1)}T20:15:00Z`,
    },
    {
      id: 'ref-3',
      date: getOffsetDateString(-2),
      title: 'Managing Fatigue & Protecting Recovery',
      content: 'Solid study volume today. Covered General Organic Chemistry aromaticity and isomerism charts. Felt mental fatigue around 7 PM, so decided to honor recovery by doing mobility stretching and getting 8 hours of sleep rather than forced cramming.',
      mood: 'neutral',
      energy: 'moderate',
      tags: ['Chemistry', 'Recovery', 'Sleep'],
      highlights: {
        mainWin: 'Completed full aromatic reaction matrix cleanly',
        biggestChallenge: 'Managing fatigue without reaching for caffeine late in the day',
        lessonLearned: 'Sleep hygiene directly affects next-morning problem-solving speed',
        priorityTomorrow: 'Maths integration drill and mock analysis',
      },
      checklist: {
        reviewedLearning: 'yes',
        taskProgress: 'partly',
        physicalWellbeing: 'yes',
        reflectedOnMistake: 'partly',
        identifiedNextStep: 'yes',
      },
      createdAt: `${getOffsetDateString(-2)}T21:00:00Z`,
      updatedAt: `${getOffsetDateString(-2)}T21:00:00Z`,
    },
    {
      id: 'ref-4',
      date: getOffsetDateString(-3),
      title: 'Breakthrough in 3D Geometry Skew Lines',
      content: 'Finally clicked with vector cross product projections for finding the shortest distance between skew lines. Used visual flashcards. Daily habit streak is holding strong at 18 days.',
      mood: 'great',
      energy: 'very_high',
      tags: ['Maths', 'Habits', 'Breakthrough'],
      highlights: {
        mainWin: 'Mastered 3D geometry skew lines without hesitation',
        biggestChallenge: 'Distraction from phone notifications early morning',
        lessonLearned: 'Leave phone in another room during the first 2 hours',
        priorityTomorrow: 'Chemistry aromatic synthesis charts',
      },
      checklist: {
        reviewedLearning: 'yes',
        taskProgress: 'yes',
        physicalWellbeing: 'yes',
        reflectedOnMistake: 'yes',
        identifiedNextStep: 'yes',
      },
      createdAt: `${getOffsetDateString(-3)}T19:00:00Z`,
      updatedAt: `${getOffsetDateString(-3)}T19:00:00Z`,
    },
  ];

  const currentMondayStr = today; // 2026-10-19 is Monday
  const prevMondayStr = getOffsetDateString(-7);

  const weeklyReviews: WeeklyReview[] = [
    {
      id: 'wr-1',
      weekStartDate: currentMondayStr,
      content: 'Strong start to the week. Consistency across morning study blocks has been the anchor. Physics mechanics questions are becoming second nature. Need to protect afternoon focus blocks more aggressively.',
      winOfTheWeek: '100% adherence to morning deep-work study blocks',
      challengesFaced: 'Mid-afternoon energy dips after heavy lunch',
      adjustmentsForNextWeek: 'Lighten lunch carbohydrates and schedule 15m brisk walks between sessions',
      priorityForNextWeek: 'Full syllabus timed simulation mock test',
      createdAt: `${currentMondayStr}T21:00:00Z`,
      updatedAt: `${currentMondayStr}T21:00:00Z`,
    },
    {
      id: 'wr-2',
      weekStartDate: prevMondayStr,
      content: 'Great progress on calculus and physical chemistry equilibrium. Hit 42 hours of total study time and 5 workout sessions. Error log is proving to be the highest-ROI activity in my preparation.',
      winOfTheWeek: 'Reduced calculation slips on sectional tests by 40%',
      challengesFaced: 'Skipped one mobility session due to late mock analysis',
      adjustmentsForNextWeek: 'Lock in workout times on the weekly scheduler before the week starts',
      priorityForNextWeek: 'Master rotational dynamics and inorganic coordination chemistry',
      createdAt: `${prevMondayStr}T20:30:00Z`,
      updatedAt: `${prevMondayStr}T20:30:00Z`,
    },
  ];

  const mentorPrivacySettings: MentorPrivacySettings = {
    journalSharingConsent: false,
    rememberJournalConsent: false,
    excludedJournalEntryIds: [],
    includeStudyContext: true,
    includeFitnessContext: true,
    includeHabitsContext: true,
    includePlanningContext: true,
    preferLocalAnalyticsOnly: false,
  };

  const mentorReports: SavedMentorReport[] = [
    {
      id: 'report-sample-1',
      type: 'daily_debrief',
      title: `Daily Debrief · ${getOffsetDateString(-1)}`,
      targetDateOrRange: getOffsetDateString(-1),
      content: `### Today's Snapshot\nRecorded 6.5 hours of high-focus study across Physics and Mathematics, completing 38 practice questions. Morning kinematics session showed excellent flow state. Evening habit execution achieved 100% completion across all active disciplines.\n\n### What Went Well\n- Consistent deep-work block adhered to scheduled start time without delay.\n- Strong error logging in Calculus integrals—noted 2 algebraic sign slips instead of skipping analysis.\n- Hydration and recovery protocol maintained throughout the study block.\n\n### What Deserves Attention\n- A 45-minute afternoon energy dip occurred around 3:30 PM following lunch.\n- Inorganic chemistry revision block was postponed to the evening.\n\n### A Useful Lesson\nComplex analytical drills yield higher accuracy when scheduled in the morning block. Lightening carbohydrate intake at lunch may help stabilize afternoon cognitive stamina.\n\n### Tomorrow's Next Steps\n1. Target the first 90-minute block on rotational dynamics problems.\n2. Complete 20 questions in physical chemistry thermodynamics.\n3. Take a 15-minute brisk walk between session 2 and session 3.\n\n### One Reflection Question\n*What specific environmental trigger helped you maintain flow during today's calculus practice?*`,
      metricSnapshot: {
        studyHours: 6.5,
        questionsSolved: 38,
        tasksCompleted: 4,
        tasksTotal: 5,
        habitsRate: 100,
        workoutsCount: 1,
      },
      includedCategories: ['study', 'tests', 'habits', 'fitness', 'planning'],
      journalIncluded: false,
      provider: 'local_deterministic',
      createdAt: `${getOffsetDateString(-1)}T21:30:00Z`,
    },
    {
      id: 'report-sample-2',
      type: 'weekly_review',
      title: `Weekly Retrospective · Sprint Starting ${getOffsetDateString(-7)}`,
      targetDateOrRange: `${getOffsetDateString(-7)} to ${getOffsetDateString(-1)}`,
      content: `### Week at a Glance\nTotal study volume reached 42.5 hours with 260 questions solved across Physics, Chemistry, and Mathematics. Average mock test performance stabilized at 78.4%. Workout frequency was consistent at 4 sessions, and habit adherence averaged 91.4%.\n\n### Key Wins\n- 42.5 hours logged represents a 12% increase in structured problem-solving volume.\n- Zero missed days on core morning discipline habits.\n- Marked 2 weak chapters as revised after targeted error drills.\n\n### Observed Patterns\nOn days with afternoon resistance training (Tuesday, Thursday, Saturday), evening study endurance was notably sharper than on sedentary days. Post-lunch fatigue remained the primary friction point across 4 of the 7 days.\n\n### Recommendations for Next Sprint\n1. Schedule 15-minute active recovery breaks between 3 PM and 4 PM.\n2. Prioritize organic reaction mechanism synthesis cards before attempting full sectional tests.\n3. Maintain the current sleep window (10:30 PM - 6:30 AM) as the foundational performance anchor.\n\n### Reflection Question\n*Which completed task this week gave you the greatest sense of genuine cognitive progress?*`,
      metricSnapshot: {
        studyHours: 42.5,
        questionsSolved: 260,
        tasksCompleted: 22,
        tasksTotal: 25,
        habitsRate: 91.4,
        workoutsCount: 4,
        testsTaken: 2,
        averageTestPercent: 78.4,
      },
      includedCategories: ['study', 'tests', 'habits', 'fitness', 'planning'],
      journalIncluded: false,
      provider: 'local_deterministic',
      createdAt: `${getOffsetDateString(-1)}T22:00:00Z`,
    },
  ];

  const mentorMessages: ChatMessage[] = [
    {
      id: 'msg-seed-1',
      role: 'assistant',
      content: `Hello! I'm your NEUROCORE mentor. I'm here to help you reflect on your academic progress, calibrate routines, analyze error patterns, and plan sustainable next steps.\n\nYou can ask me about study patterns, routine balance, or upcoming goals. Your journal reflections remain private on your device unless you explicitly choose to include them. How can I assist your focus today?`,
      timestamp: `${today}T08:00:00Z`,
    },
  ];

  return {
    tasks,
    goals,
    monthlyOutcomes,
    tests,
    testErrors,
    subjects,
    chapters,
    studySessions,
    habits,
    habitCompletions,
    workouts,
    workoutRoutines,
    weightEntries,
    bodyMeasurements,
    fitnessSettings,
    examSettings,
    appSettings,
    reflectionEntries,
    weeklyReviews,
    mentorReports,
    mentorMessages,
    mentorPrivacySettings,
  };
}
