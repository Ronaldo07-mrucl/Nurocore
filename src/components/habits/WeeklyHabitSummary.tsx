import React from 'react';
import { useApp } from '../../context/AppContext';
import { Habit } from '../../types';
import {
  isHabitScheduledOnDate,
  isHabitCompletedOnDate,
  HABIT_CATEGORY_CONFIG,
} from '../../utils/habitSchedule';
import { formatMonthDay, parseLocalDate } from '../../utils/dates';
import { BarChart3, CheckCircle2, Clock, Calendar } from 'lucide-react';

interface WeeklyHabitSummaryProps {
  weekDates: string[]; // 7 dates: Monday to Sunday
  todayStr: string;
  isCurrentWeek: boolean;
}

export const WeeklyHabitSummary: React.FC<WeeklyHabitSummaryProps> = ({
  weekDates,
  todayStr,
  isCurrentWeek,
}) => {
  const { habits, habitCompletions } = useApp();

  // If no habits exist, return null
  if (habits.length === 0) return null;

  // Elapsed dates in this week up to today (inclusive)
  const elapsedDates = weekDates.filter(d => d <= todayStr);
  const futureDates = weekDates.filter(d => d > todayStr);

  // Total scheduled occurrences in elapsed dates (denominator for actual completion rate)
  let totalElapsedScheduled = 0;
  let totalElapsedCompleted = 0;

  // Future scheduled occurrences in this week
  let totalFutureScheduled = 0;

  habits.forEach(habit => {
    elapsedDates.forEach(d => {
      if (isHabitScheduledOnDate(habit, d)) {
        totalElapsedScheduled++;
        if (isHabitCompletedOnDate(habit.id, d, habitCompletions)) {
          totalElapsedCompleted++;
        }
      }
    });

    futureDates.forEach(d => {
      if (isHabitScheduledOnDate(habit, d)) {
        totalFutureScheduled++;
      }
    });
  });

  const weeklyRate =
    totalElapsedScheduled > 0
      ? Math.round((totalElapsedCompleted / totalElapsedScheduled) * 100)
      : 0;

  // Per-habit breakdown for this week
  const habitBreakdowns = habits.map(habit => {
    let habitScheduled = 0;
    let habitCompleted = 0;
    let habitFuture = 0;

    elapsedDates.forEach(d => {
      if (isHabitScheduledOnDate(habit, d)) {
        habitScheduled++;
        if (isHabitCompletedOnDate(habit.id, d, habitCompletions)) {
          habitCompleted++;
        }
      }
    });

    futureDates.forEach(d => {
      if (isHabitScheduledOnDate(habit, d)) {
        habitFuture++;
      }
    });

    const rate = habitScheduled > 0 ? Math.round((habitCompleted / habitScheduled) * 100) : 0;
    const catConfig = HABIT_CATEGORY_CONFIG[habit.category || 'discipline'] || HABIT_CATEGORY_CONFIG.other;

    return {
      habit,
      scheduled: habitScheduled,
      completed: habitCompleted,
      future: habitFuture,
      rate,
      catConfig,
    };
  });

  return (
    <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#292936] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#9B7BFF]" />
            <h3 className="text-sm font-semibold text-[#F3F3F7]">Selected Week Execution Summary</h3>
          </div>
          <p className="text-xs text-[#8E8EA0] mt-0.5">
            {isCurrentWeek
              ? 'Elapsed days execution rate (future scheduled dates are strictly excluded from completion denominator)'
              : 'Full week performance report across all scheduled habit occurrences'}
          </p>
        </div>

        {/* Global Week Rate Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-mono text-[#8E8EA0] block">
              {totalElapsedCompleted} of {totalElapsedScheduled} elapsed done
            </span>
            {isCurrentWeek && futureDates.length > 0 && (
              <span className="text-[10px] font-mono text-[#8E8EA0]/60 block">
                +{totalFutureScheduled} upcoming in week
              </span>
            )}
          </div>
          <div className="px-3 py-1 bg-[#9B7BFF]/15 border border-[#9B7BFF]/30 rounded-xl text-center">
            <span className="text-lg font-bold font-mono text-[#9B7BFF] tabular-nums">
              {weeklyRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Per-Habit Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {habitBreakdowns.map(item => (
          <div
            key={item.habit.id}
            className="p-3 bg-[#0B0B10] border border-[#292936] rounded-xl flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.habit.color || item.catConfig.accentColor }}
                />
                <span className="text-xs font-medium text-[#F3F3F7] truncate">
                  {item.habit.name || item.habit.title}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                <span className="text-[#8E8EA0] text-[11px]">
                  {item.completed}/{item.scheduled}
                </span>
                <span
                  className={`font-semibold ${
                    item.rate === 100 ? 'text-[#43D9A3]' : 'text-[#F3F3F7]'
                  }`}
                >
                  {item.rate}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[#14141D] h-1.5 rounded-full overflow-hidden border border-[#292936]/80">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${item.rate}%`,
                  backgroundColor: item.habit.color || item.catConfig.accentColor,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
