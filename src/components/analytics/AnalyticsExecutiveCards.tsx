import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  HelpCircle,
  Award,
  CheckSquare,
  Dumbbell,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
} from 'lucide-react';
import {
  DateRange,
  getPrecedingDateRangeForAnalytics,
  calculateStudyMetrics,
  calculateTestMetrics,
  calculateFitnessMetrics,
  calculateHabitsAnalytics,
  computePeriodComparison,
  PeriodComparison,
} from '../../utils/analytics';
import { NavigationDestination } from '../../types';

interface AnalyticsExecutiveCardsProps {
  currentRange: DateRange;
}

export const AnalyticsExecutiveCards: React.FC<AnalyticsExecutiveCardsProps> = ({
  currentRange,
}) => {
  const {
    studySessions,
    subjects,
    tests,
    workouts,
    weightEntries,
    bodyMeasurements,
    fitnessSettings,
    habits,
    habitCompletions,
    setActivePage,
  } = useApp();

  const priorRange = getPrecedingDateRangeForAnalytics(currentRange);

  // 1. Current Period Metrics
  const currentStudy = calculateStudyMetrics(
    studySessions,
    subjects,
    currentRange.startDate,
    currentRange.endDate
  );

  const currentTest = calculateTestMetrics(
    tests,
    currentRange.startDate,
    currentRange.endDate
  );

  const currentFitness = calculateFitnessMetrics(
    workouts,
    weightEntries,
    bodyMeasurements,
    fitnessSettings,
    currentRange.startDate,
    currentRange.endDate
  );

  const currentHabits = calculateHabitsAnalytics(
    habits,
    habitCompletions,
    currentRange.startDate,
    currentRange.endDate
  );

  // 2. Prior Period Metrics (if available)
  const priorStudy = priorRange
    ? calculateStudyMetrics(studySessions, subjects, priorRange.startDate, priorRange.endDate)
    : null;

  const priorTest = priorRange
    ? calculateTestMetrics(tests, priorRange.startDate, priorRange.endDate)
    : null;

  const priorFitness = priorRange
    ? calculateFitnessMetrics(workouts, weightEntries, bodyMeasurements, fitnessSettings, priorRange.startDate, priorRange.endDate)
    : null;

  const priorHabits = priorRange
    ? calculateHabitsAnalytics(habits, habitCompletions, priorRange.startDate, priorRange.endDate)
    : null;

  // 3. Comparisons
  const studyHoursComp = computePeriodComparison(
    currentStudy.totalHours,
    priorStudy ? priorStudy.totalHours : null
  );

  const questionsComp = computePeriodComparison(
    currentStudy.totalQuestions,
    priorStudy ? priorStudy.totalQuestions : null
  );

  const testsCountComp = computePeriodComparison(
    currentTest.totalTests,
    priorTest ? priorTest.totalTests : null
  );

  const testScoreComp = computePeriodComparison(
    currentTest.weightedAveragePercentage,
    priorTest && priorTest.totalTests > 0 ? priorTest.weightedAveragePercentage : null
  );

  const habitComp = computePeriodComparison(
    currentHabits.overallConsistency,
    priorHabits && priorHabits.overallScheduled > 0 ? priorHabits.overallConsistency : null
  );

  const workoutsComp = computePeriodComparison(
    currentFitness.totalWorkouts,
    priorFitness ? priorFitness.totalWorkouts : null
  );

  const renderDeltaBadge = (comp: PeriodComparison) => {
    if (comp.status === 'na') {
      return (
        <span className="text-[11px] text-[#8E8EA0] flex items-center gap-0.5">
          <Minus className="w-3 h-3 text-[#8E8EA0]" />
          <span>N/A</span>
        </span>
      );
    }

    if (comp.percentageChange === null) {
      return (
        <span className="text-[11px] text-[#8E8EA0]">
          {comp.label}
        </span>
      );
    }

    const isPositive = comp.status === 'positive';
    const isNegative = comp.status === 'negative';

    return (
      <span
        className={`text-[11px] font-medium flex items-center gap-0.5 ${
          isPositive
            ? 'text-[#43D9A3]'
            : isNegative
            ? 'text-rose-400'
            : 'text-[#8E8EA0]'
        }`}
      >
        {isPositive && <ArrowUpRight className="w-3.5 h-3.5" />}
        {isNegative && <ArrowDownRight className="w-3.5 h-3.5" />}
        {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
        <span>{comp.label}</span>
      </span>
    );
  };

  const handleCardClick = (target: NavigationDestination) => {
    setActivePage(target);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {/* 1. Total Study Hours */}
      <div
        onClick={() => handleCardClick('study-log')}
        className="bg-[#14141D] border border-[#292936] hover:border-[#3E3E52] p-4 rounded-xl flex flex-col justify-between shadow-sm cursor-pointer transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#8E8EA0] uppercase tracking-wider">
            Study Hours
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#9B7BFF]/10 text-[#9B7BFF] flex items-center justify-center group-hover:bg-[#9B7BFF]/20 transition-colors">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#F3F3F7]">
              {currentStudy.totalHours}
            </span>
            <span className="text-xs text-[#8E8EA0]">hrs</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#292936]/60">
            <span className="text-[10px] text-[#8E8EA0] truncate">{currentStudy.formattedHours}</span>
            {renderDeltaBadge(studyHoursComp)}
          </div>
        </div>
      </div>

      {/* 2. Questions Solved */}
      <div
        onClick={() => handleCardClick('study-log')}
        className="bg-[#14141D] border border-[#292936] hover:border-[#3E3E52] p-4 rounded-xl flex flex-col justify-between shadow-sm cursor-pointer transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#8E8EA0] uppercase tracking-wider">
            Questions
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center group-hover:bg-[#38BDF8]/20 transition-colors">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#F3F3F7]">
              {currentStudy.totalQuestions.toLocaleString()}
            </span>
            <span className="text-xs text-[#8E8EA0]">solved</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#292936]/60">
            <span className="text-[10px] text-[#8E8EA0]">
              {currentStudy.accuracyPercentage !== null ? `${currentStudy.accuracyPercentage}% acc` : `${currentStudy.totalSessions} sessions`}
            </span>
            {renderDeltaBadge(questionsComp)}
          </div>
        </div>
      </div>

      {/* 3. Tests Taken */}
      <div
        onClick={() => handleCardClick('test-error-log')}
        className="bg-[#14141D] border border-[#292936] hover:border-[#3E3E52] p-4 rounded-xl flex flex-col justify-between shadow-sm cursor-pointer transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#8E8EA0] uppercase tracking-wider">
            Tests Taken
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#F3F3F7]">
              {currentTest.totalTests}
            </span>
            <span className="text-xs text-[#8E8EA0]">tests</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#292936]/60">
            <span className="text-[10px] text-[#8E8EA0]">
              {currentTest.mainsCount}M • {currentTest.advancedCount}Adv
            </span>
            {renderDeltaBadge(testsCountComp)}
          </div>
        </div>
      </div>

      {/* 4. Average Test Performance */}
      <div
        onClick={() => handleCardClick('test-error-log')}
        className="bg-[#14141D] border border-[#292936] hover:border-[#3E3E52] p-4 rounded-xl flex flex-col justify-between shadow-sm cursor-pointer transition-all group relative"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium text-[#8E8EA0] uppercase tracking-wider">
              Avg Test Score
            </span>
            <span
              title="Weighted percentage: Total Obtained Marks divided by Total Maximum Marks across all valid tests in this range."
              className="text-[#8E8EA0] hover:text-[#F3F3F7] cursor-help"
            >
              <Info className="w-3 h-3" />
            </span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-[#9B7BFF]/10 text-[#9B7BFF] flex items-center justify-center group-hover:bg-[#9B7BFF]/20 transition-colors">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#F3F3F7]">
              {currentTest.totalTests > 0 ? `${currentTest.weightedAveragePercentage}%` : 'N/A'}
            </span>
            <span className="text-xs text-[#8E8EA0]">weighted</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#292936]/60">
            <span className="text-[10px] text-[#8E8EA0]">
              {currentTest.bestPercentage > 0 ? `Best: ${currentTest.bestPercentage}%` : 'No test records'}
            </span>
            {renderDeltaBadge(testScoreComp)}
          </div>
        </div>
      </div>

      {/* 5. Habit Consistency */}
      <div
        onClick={() => handleCardClick('habit-tracking')}
        className="bg-[#14141D] border border-[#292936] hover:border-[#3E3E52] p-4 rounded-xl flex flex-col justify-between shadow-sm cursor-pointer transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#8E8EA0] uppercase tracking-wider">
            Habit Consistency
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#43D9A3]/10 text-[#43D9A3] flex items-center justify-center group-hover:bg-[#43D9A3]/20 transition-colors">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#F3F3F7]">
              {currentHabits.overallScheduled > 0 ? `${currentHabits.overallConsistency}%` : 'N/A'}
            </span>
            <span className="text-xs text-[#8E8EA0]">rate</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#292936]/60">
            <span className="text-[10px] text-[#8E8EA0]">
              {currentHabits.overallCompleted}/{currentHabits.overallScheduled} done
            </span>
            {renderDeltaBadge(habitComp)}
          </div>
        </div>
      </div>

      {/* 6. Workouts Completed */}
      <div
        onClick={() => handleCardClick('fitness')}
        className="bg-[#14141D] border border-[#292936] hover:border-[#3E3E52] p-4 rounded-xl flex flex-col justify-between shadow-sm cursor-pointer transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#8E8EA0] uppercase tracking-wider">
            Workouts
          </span>
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
            <Dumbbell className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#F3F3F7]">
              {currentFitness.totalWorkouts}
            </span>
            <span className="text-xs text-[#8E8EA0]">sessions</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#292936]/60">
            <span className="text-[10px] text-[#8E8EA0]">
              {currentFitness.totalWorkoutMinutes > 0 ? `${Math.round(currentFitness.totalWorkoutMinutes / 60)}h total` : '0 min'}
            </span>
            {renderDeltaBadge(workoutsComp)}
          </div>
        </div>
      </div>
    </div>
  );
};
