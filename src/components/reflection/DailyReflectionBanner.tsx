import React, { useState } from 'react';
import { ReflectionEntry } from '../../types';
import { StreakResult } from '../../utils/reflectionStats';
import { formatShortDate, getTodayString } from '../../utils/dates';
import {
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  PenLine,
  HelpCircle,
  BookOpen,
  CheckSquare,
  Dumbbell,
  ArrowRight,
} from 'lucide-react';

interface DailyReflectionBannerProps {
  streakInfo: StreakResult;
  todayEntry?: ReflectionEntry;
  onNewTodayEntry: () => void;
  onViewEntry: (entry: ReflectionEntry) => void;
  todayStudyHours: number;
  todayTasksCompleted: { completed: number; total: number };
  todayHabitsCompleted: { completed: number; total: number };
  todayWorkoutLogged: boolean;
}

export const DailyReflectionBanner: React.FC<DailyReflectionBannerProps> = ({
  streakInfo,
  todayEntry,
  onNewTodayEntry,
  onViewEntry,
  todayStudyHours,
  todayTasksCompleted,
  todayHabitsCompleted,
  todayWorkoutLogged,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 md:p-5 shadow-sm space-y-4">
      {/* Top Banner Row: Today's Status & Streak */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Today's Reflection Status */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              todayEntry
                ? 'bg-[#43D9A3]/10 border-[#43D9A3]/30 text-[#43D9A3]'
                : 'bg-[#9B7BFF]/10 border-[#9B7BFF]/30 text-[#9B7BFF]'
            }`}
          >
            {todayEntry ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <PenLine className="w-5 h-5 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8E8EA0]">
                Today's Reflection Status
              </span>
              {todayEntry ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#43D9A3]/15 text-[#43D9A3] border border-[#43D9A3]/30 uppercase">
                  Logged
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30 uppercase">
                  Pending
                </span>
              )}
            </div>

            {todayEntry ? (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onViewEntry(todayEntry)}
                  className="text-sm font-semibold text-[#F3F3F7] hover:text-[#9B7BFF] transition-colors text-left line-clamp-1"
                >
                  {todayEntry.title}
                </button>
                <span className="text-xs text-[#8E8EA0]">
                  · {todayEntry.mood ? `${todayEntry.mood} state` : 'recorded'}
                </span>
              </div>
            ) : (
              <div className="mt-1">
                <p className="text-sm text-[#C5C5D2]">
                  Take 3 minutes to capture today's key wins, challenges, and lessons learned.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Action & Streak Pill */}
        <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
          {/* Streak indicator */}
          <div className="relative">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-help transition-colors ${
                streakInfo.currentStreak > 0
                  ? 'bg-[#9B7BFF]/10 border-[#9B7BFF]/30 text-[#F3F3F7]'
                  : 'bg-[#181824] border-[#292936] text-[#8E8EA0]'
              }`}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
            >
              <Flame
                className={`w-4 h-4 ${
                  streakInfo.currentStreak > 0 ? 'text-[#9B7BFF]' : 'text-[#8E8EA0]'
                }`}
              />
              <span className="font-semibold text-sm text-[#F3F3F7]">
                {streakInfo.currentStreak}
              </span>
              <span className="text-[#8E8EA0] text-[11px]">
                {streakInfo.currentStreak === 1 ? 'day streak' : 'days streak'}
              </span>
              <HelpCircle className="w-3.5 h-3.5 text-[#8E8EA0]" />
            </div>

            {/* Streak tooltip */}
            {showTooltip && (
              <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#181824] border border-[#292936] rounded-xl shadow-xl z-20 text-xs text-[#C5C5D2] space-y-1.5 animate-in fade-in duration-100">
                <div className="font-semibold text-[#F3F3F7] flex items-center justify-between">
                  <span>Reflection Streak Rule</span>
                  <span className="text-[#9B7BFF]">Best: {streakInfo.longestStreak}d</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#8E8EA0]">
                  Counts consecutive calendar days with at least one saved reflection entry. If you haven't written today yet, your streak from yesterday stays active until midnight!
                </p>
              </div>
            )}
          </div>

          {/* New / View today's button */}
          {todayEntry ? (
            <button
              type="button"
              onClick={() => onViewEntry(todayEntry)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#181824] hover:bg-[#292936] text-[#F3F3F7] border border-[#292936] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>View Today's Notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onNewTodayEntry}
              className="px-4 py-1.5 text-xs font-semibold bg-[#9B7BFF] hover:bg-[#8A67FF] text-white rounded-lg shadow-sm shadow-[#9B7BFF]/30 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reflect on Today</span>
            </button>
          )}
        </div>
      </div>

      {/* System Context Row: What happened today */}
      <div className="pt-3 border-t border-[#292936]/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* Study Hours */}
        <div className="p-2.5 bg-[#181824]/60 border border-[#292936]/40 rounded-lg flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-[#9B7BFF] shrink-0" />
          <div className="overflow-hidden">
            <span className="text-[10px] text-[#8E8EA0] block uppercase tracking-wider truncate">
              Study Time Today
            </span>
            <span className="font-semibold text-[#F3F3F7]">
              {todayStudyHours.toFixed(1)} hrs
            </span>
          </div>
        </div>

        {/* Tasks completed */}
        <div className="p-2.5 bg-[#181824]/60 border border-[#292936]/40 rounded-lg flex items-center gap-2.5">
          <CheckSquare className="w-4 h-4 text-[#43D9A3] shrink-0" />
          <div className="overflow-hidden">
            <span className="text-[10px] text-[#8E8EA0] block uppercase tracking-wider truncate">
              Tasks Completed
            </span>
            <span className="font-semibold text-[#F3F3F7]">
              {todayTasksCompleted.completed} / {todayTasksCompleted.total}
            </span>
          </div>
        </div>

        {/* Habits completed */}
        <div className="p-2.5 bg-[#181824]/60 border border-[#292936]/40 rounded-lg flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#38BDF8] shrink-0" />
          <div className="overflow-hidden">
            <span className="text-[10px] text-[#8E8EA0] block uppercase tracking-wider truncate">
              Habits Checked
            </span>
            <span className="font-semibold text-[#F3F3F7]">
              {todayHabitsCompleted.completed} / {todayHabitsCompleted.total}
            </span>
          </div>
        </div>

        {/* Workout logged */}
        <div className="p-2.5 bg-[#181824]/60 border border-[#292936]/40 rounded-lg flex items-center gap-2.5">
          <Dumbbell className="w-4 h-4 text-[#F43F5E] shrink-0" />
          <div className="overflow-hidden">
            <span className="text-[10px] text-[#8E8EA0] block uppercase tracking-wider truncate">
              Physical Workout
            </span>
            <span className="font-semibold text-[#F3F3F7]">
              {todayWorkoutLogged ? 'Logged' : 'Rest / Not logged'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
