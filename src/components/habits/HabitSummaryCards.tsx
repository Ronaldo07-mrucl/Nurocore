import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  calculateDailyHabitCompletion,
  calculateHabitCurrentStreak,
  calculateHabitLongestStreak,
  calculateHabit30DayConsistency,
} from '../../utils/habitSchedule';
import { CheckSquare, Flame, Trophy, TrendingUp, Info } from 'lucide-react';

interface HabitSummaryCardsProps {
  todayStr: string;
}

export const HabitSummaryCards: React.FC<HabitSummaryCardsProps> = ({ todayStr }) => {
  const { habits, habitCompletions } = useApp();

  const todayStatus = calculateDailyHabitCompletion(habits, habitCompletions, todayStr);
  const currentStreak = calculateHabitCurrentStreak(habits, habitCompletions, todayStr);
  const longestStreak = calculateHabitLongestStreak(habits, habitCompletions, todayStr);
  const consistency = calculateHabit30DayConsistency(habits, habitCompletions, todayStr);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Today's Completion */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#8E8EA0]">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Today's Completion
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#43D9A3]/10 border border-[#43D9A3]/20 flex items-center justify-center text-[#43D9A3]">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          {todayStatus.hasScheduled ? (
            <div>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl font-bold text-[#F3F3F7] tabular-nums">
                  {todayStatus.percentage}%
                </span>
                <span className="text-xs text-[#8E8EA0] tabular-nums">
                  ({todayStatus.completed}/{todayStatus.total} due)
                </span>
              </div>
              <div className="w-full bg-[#0B0B10] h-1.5 rounded-full overflow-hidden mt-2 border border-[#292936]">
                <div
                  className="bg-[#43D9A3] h-full transition-all duration-300"
                  style={{ width: `${todayStatus.percentage}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="py-1">
              <span className="text-sm font-medium text-[#8E8EA0] italic">
                No habits scheduled
              </span>
              <p className="text-[11px] text-[#8E8EA0]/70 mt-1">
                Rest day or no active routines due today
              </p>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-[#292936]/60 flex items-center justify-between text-[11px] text-[#8E8EA0]">
          <span>Scheduled today</span>
          <span className="font-mono text-[#43D9A3]">
            {todayStatus.hasScheduled
              ? `${todayStatus.completed} of ${todayStatus.total} completed`
              : '0 due'}
          </span>
        </div>
      </div>

      {/* 2. Current Streak */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#8E8EA0]">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Current Streak
            </span>
            <div className="group relative">
              <Info className="w-3.5 h-3.5 text-[#8E8EA0]/70 cursor-help" />
              <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block w-48 p-2 bg-[#0B0B10] border border-[#292936] rounded-lg text-[10px] text-[#8E8EA0] shadow-xl z-20 pointer-events-none">
                Consecutive eligible days with all scheduled habits completed. Rest days without scheduled habits do not penalize streak.
              </div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-[#F3F3F7] tabular-nums">
              {currentStreak}
            </span>
            <span className="text-xs text-[#8E8EA0]">
              {currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#292936]/60 flex items-center justify-between text-[11px] text-[#8E8EA0]">
          <span>Discipline run</span>
          <span className="font-mono text-amber-400">
            {currentStreak > 0 ? `${currentStreak}d active` : 'Start today'}
          </span>
        </div>
      </div>

      {/* 3. Longest Streak */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#8E8EA0]">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Longest Streak
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#9B7BFF]/10 border border-[#9B7BFF]/20 flex items-center justify-center text-[#9B7BFF]">
            <Trophy className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-[#F3F3F7] tabular-nums">
              {longestStreak}
            </span>
            <span className="text-xs text-[#8E8EA0]">
              {longestStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#292936]/60 flex items-center justify-between text-[11px] text-[#8E8EA0]">
          <span>Historical peak</span>
          <span className="font-mono text-[#9B7BFF]">ALL-TIME RECORD</span>
        </div>
      </div>

      {/* 4. Trailing 30-Day Consistency */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#8E8EA0]">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Consistency
          </span>
          <div className="w-7 h-7 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-[#F3F3F7] tabular-nums">
              {consistency.percentage}%
            </span>
            <span className="text-xs text-[#8E8EA0]">execution</span>
          </div>
          <div className="w-full bg-[#0B0B10] h-1.5 rounded-full overflow-hidden mt-2 border border-[#292936]">
            <div
              className="bg-cyan-400 h-full transition-all duration-300"
              style={{ width: `${consistency.percentage}%` }}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-[#292936]/60 flex items-center justify-between text-[11px] text-[#8E8EA0]">
          <span>{consistency.periodLabel}</span>
          <span className="font-mono text-cyan-400">
            {consistency.completedOccurrences}/{consistency.scheduledOccurrences} done
          </span>
        </div>
      </div>
    </div>
  );
};
