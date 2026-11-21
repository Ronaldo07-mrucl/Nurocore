import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  calculateStudyHours,
  calculateQuestionsSolved,
  calculateHabitsProgress,
  calculateWorkoutSessions,
} from '../../utils/metrics';
import { getTodayString } from '../../utils/dates';
import { BookOpen, Target, CheckSquare, Dumbbell } from 'lucide-react';

export const SummaryWidgets: React.FC = () => {
  const { studySessions, habits, habitCompletions, workouts, appSettings } = useApp();
  const today = getTodayString();

  const studyHours = calculateStudyHours(studySessions, today);
  const targetStudyHours = appSettings.dailyStudyTargetHours || 8;
  const studyPercent = targetStudyHours > 0 ? Math.round((studyHours / targetStudyHours) * 100) : 0;

  const questionsSolved = calculateQuestionsSolved(studySessions, today);

  const habitsProgress = calculateHabitsProgress(habits, habitCompletions, today);

  const workoutStats = calculateWorkoutSessions(workouts, today);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Study Hours */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between hover:border-[#3B3B4E] transition-all">
        <div className="flex items-center justify-between text-[#8E8EA0] mb-3">
          <span className="text-xs font-medium uppercase tracking-wider">Study Hours</span>
          <div className="w-8 h-8 rounded-lg bg-[#9B7BFF]/10 text-[#9B7BFF] flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-bold font-mono tabular-nums text-[#F3F3F7]">
              {studyHours}
            </span>
            <span className="text-xs text-[#8E8EA0] font-medium">hours</span>
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-[#8E8EA0]">
            <span className="text-[#9B7BFF] font-mono tabular-nums font-semibold">
              {studyPercent}%
            </span>
            <span>of {targetStudyHours}h daily target</span>
          </div>
        </div>
      </div>

      {/* 2. Questions Solved */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between hover:border-[#3B3B4E] transition-all">
        <div className="flex items-center justify-between text-[#8E8EA0] mb-3">
          <span className="text-xs font-medium uppercase tracking-wider">Questions Solved</span>
          <div className="w-8 h-8 rounded-lg bg-[#9B7BFF]/10 text-[#9B7BFF] flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-bold font-mono tabular-nums text-[#F3F3F7]">
              {questionsSolved}
            </span>
            <span className="text-xs text-[#8E8EA0] font-medium">problems</span>
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-[#8E8EA0]">
            <span>Today's logged practice</span>
          </div>
        </div>
      </div>

      {/* 3. Habits Completed */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between hover:border-[#3B3B4E] transition-all">
        <div className="flex items-center justify-between text-[#8E8EA0] mb-3">
          <span className="text-xs font-medium uppercase tracking-wider">Habits Completed</span>
          <div className="w-8 h-8 rounded-lg bg-[#43D9A3]/10 text-[#43D9A3] flex items-center justify-center">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-bold font-mono tabular-nums text-[#F3F3F7]">
              {habitsProgress.completed}
            </span>
            <span className="text-sm font-mono text-[#8E8EA0]">/ {habitsProgress.total}</span>
            <span className="text-xs text-[#8E8EA0] font-medium ml-1">habits</span>
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-[#8E8EA0]">
            <span className="text-[#43D9A3] font-mono tabular-nums font-semibold">
              {habitsProgress.percentage}%
            </span>
            <span>daily execution rate</span>
          </div>
        </div>
      </div>

      {/* 4. Workouts */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between hover:border-[#3B3B4E] transition-all">
        <div className="flex items-center justify-between text-[#8E8EA0] mb-3">
          <span className="text-xs font-medium uppercase tracking-wider">Workouts</span>
          <div className="w-8 h-8 rounded-lg bg-[#43D9A3]/10 text-[#43D9A3] flex items-center justify-center">
            <Dumbbell className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-bold font-mono tabular-nums text-[#F3F3F7]">
              {workoutStats.count}
            </span>
            <span className="text-xs text-[#8E8EA0] font-medium">
              {workoutStats.count === 1 ? 'session' : 'sessions'}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-[#8E8EA0] truncate">
            {workoutStats.count > 0 ? (
              <span className="truncate">
                {workoutStats.totalMinutes} min · {workoutStats.latestWorkoutType || 'Completed'}
              </span>
            ) : (
              <span>No workout logged today</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
