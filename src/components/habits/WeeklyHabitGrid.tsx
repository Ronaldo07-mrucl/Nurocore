import React from 'react';
import { useApp } from '../../context/AppContext';
import { Habit } from '../../types';
import { formatMonthDay, parseLocalDate } from '../../utils/dates';
import {
  isHabitScheduledOnDate,
  isHabitCompletedOnDate,
  getHabitCompletionRecord,
  HABIT_CATEGORY_CONFIG,
} from '../../utils/habitSchedule';
import {
  Check,
  Plus,
  Star,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface WeeklyHabitGridProps {
  weekDates: string[]; // 7 dates: Monday to Sunday
  todayStr: string;
  selectedMondayDate: string;
  selectedSundayDate: string;
  isCurrentWeek: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  onSelectHabit: (habit: Habit) => void;
  onAddHabit: () => void;
  onEditNote: (habit: Habit, date: string, currentNote?: string) => void;
}

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const WeeklyHabitGrid: React.FC<WeeklyHabitGridProps> = ({
  weekDates,
  todayStr,
  selectedMondayDate,
  selectedSundayDate,
  isCurrentWeek,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  onSelectHabit,
  onAddHabit,
  onEditNote,
}) => {
  const { habits, habitCompletions, toggleHabitCompletion } = useApp();

  const weekLabel = `${formatMonthDay(selectedMondayDate)} – ${formatMonthDay(selectedSundayDate)}, ${parseLocalDate(selectedSundayDate).getFullYear()}`;

  // If no habits exist, render inviting empty state
  if (habits.length === 0) {
    return (
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-8 text-center flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 rounded-xl bg-[#9B7BFF]/10 border border-[#9B7BFF]/20 flex items-center justify-center text-[#9B7BFF] mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-[#F3F3F7]">No Habits Configured</h3>
        <p className="text-xs text-[#8E8EA0] max-w-md mt-1 mb-4">
          Establish daily routines, study discipline blocks, or physical fitness habits to build verifiable consistency.
        </p>
        <button
          onClick={onAddHabit}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-xl transition-colors cursor-pointer shadow-sm shadow-[#9B7BFF]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add First Habit</span>
        </button>
      </div>
    );
  }

  // Calculate day completion summary for the bottom row
  const daySummaries = weekDates.map(dateStr => {
    const isFuture = dateStr > todayStr;
    const dueHabits = habits.filter(h => isHabitScheduledOnDate(h, dateStr));
    const total = dueHabits.length;
    if (total === 0) {
      return { total: 0, completed: 0, percentage: 0, isFuture, hasScheduled: false };
    }
    const completed = dueHabits.filter(h =>
      isHabitCompletedOnDate(h.id, dateStr, habitCompletions)
    ).length;
    const percentage = Math.round((completed / total) * 100);
    return { total, completed, percentage, isFuture, hasScheduled: true };
  });

  return (
    <div className="bg-[#14141D] border border-[#292936] rounded-xl overflow-hidden h-full flex flex-col">
      {/* Top Header of the Grid with Week Navigation & New Habit Action */}
      <div className="p-4 sm:p-5 border-b border-[#292936] flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-[#F3F3F7]">Weekly Execution Matrix</h3>
            <span className="hidden xl:inline text-[11px] font-mono text-[#8E8EA0]">
              {weekLabel}
            </span>
          </div>

          {/* Week Slider Controls & New Habit */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#0B0B10] border border-[#292936] rounded-xl p-1 gap-1">
              <button
                onClick={onPrevWeek}
                className="p-1 text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] rounded-lg transition-colors cursor-pointer"
                title="Previous Week"
                aria-label="Previous Week"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onCurrentWeek}
                className={`px-2 py-0.5 text-[11px] font-mono font-medium rounded-lg transition-colors cursor-pointer ${
                  isCurrentWeek
                    ? 'bg-[#9B7BFF]/15 text-[#9B7BFF] font-semibold border border-[#9B7BFF]/30'
                    : 'text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26]'
                }`}
              >
                Today
              </button>

              <button
                onClick={onNextWeek}
                className="p-1 text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] rounded-lg transition-colors cursor-pointer"
                title="Next Week"
                aria-label="Next Week"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0B0B10] border border-[#292936] rounded-xl text-[11px] font-mono text-[#F3F3F7] xl:hidden">
              <Calendar className="w-3 h-3 text-[#9B7BFF]" />
              <span>{weekLabel}</span>
            </div>

            <button
              onClick={onAddHabit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-xl transition-colors cursor-pointer shadow-sm shadow-[#9B7BFF]/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Habit</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Legend & Hint */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8E8EA0]">
          <span>Click any cell to toggle completion. Click habit titles to inspect streaks.</span>
          <div className="flex items-center gap-3 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#43D9A3]" /> Done
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs border border-[#292936] bg-[#0B0B10]" /> Pending
            </span>
            <span className="flex items-center gap-1 text-[#8E8EA0]/50">
              <span>—</span> Unscheduled
            </span>
          </div>
        </div>
      </div>

      {/* Responsive Horizontal Scroll Container */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs border-collapse min-w-[580px]">
          {/* Header Row: Days */}
          <thead>
            <tr className="bg-[#0B0B10] border-b border-[#292936] text-[#8E8EA0]">
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] w-48 md:w-60 sticky left-0 bg-[#0B0B10] z-10 border-r border-[#292936]/60">
                Habit Routine
              </th>
              {weekDates.map((dateStr, idx) => {
                const isToday = dateStr === todayStr;
                const isFuture = dateStr > todayStr;
                const dayNum = parseLocalDate(dateStr).getDate();
                const dayName = WEEKDAY_NAMES[idx];

                return (
                  <th
                    key={dateStr}
                    className={`py-3 px-2 text-center font-mono ${
                      isToday
                        ? 'bg-[#9B7BFF]/10 text-[#9B7BFF] font-bold border-b-2 border-b-[#9B7BFF]'
                        : isFuture
                        ? 'text-[#8E8EA0]/60'
                        : 'text-[#F3F3F7]'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[10px] uppercase">{dayName}</span>
                      <span className={`text-sm ${isToday ? 'text-[#9B7BFF] font-bold' : ''}`}>
                        {dayNum}
                      </span>
                      {isToday && (
                        <span className="text-[9px] uppercase tracking-wider px-1 py-0.2 rounded-xs bg-[#9B7BFF] text-white font-sans mt-0.5">
                          TODAY
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body Rows: Habits */}
          <tbody className="divide-y divide-[#292936] bg-[#14141D]">
            {habits.map(habit => {
              const catConfig =
                HABIT_CATEGORY_CONFIG[habit.category || 'discipline'] || HABIT_CATEGORY_CONFIG.other;

              return (
                <tr key={habit.id} className="hover:bg-[#1B1B26]/40 transition-colors group">
                  {/* First Column: Habit Info */}
                  <td className="py-3 px-4 sticky left-0 bg-[#14141D] group-hover:bg-[#181822] transition-colors z-10 border-r border-[#292936]/60">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectHabit(habit)}
                        className="text-left font-medium text-[#F3F3F7] hover:text-[#9B7BFF] transition-colors truncate max-w-[200px] md:max-w-[240px] cursor-pointer flex items-center gap-1.5"
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: habit.color || catConfig.accentColor }}
                        />
                        <span className="truncate">{habit.name || habit.title}</span>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {habit.isNonNegotiable && (
                          <span
                            title="Non-Negotiable Core Habit"
                            className="text-amber-400 p-0.5"
                          >
                            <Star className="w-3 h-3 fill-amber-400" />
                          </span>
                        )}

                        {!habit.isActive && (
                          <span
                            title="Habit is currently paused"
                            className="text-[9px] font-mono text-[#8E8EA0] bg-[#1B1B26] border border-[#292936] px-1 py-0.2 rounded-xs"
                          >
                            PAUSED
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 7 Day Columns */}
                  {weekDates.map(dateStr => {
                    const isScheduled = isHabitScheduledOnDate(habit, dateStr);
                    const isDone = isHabitCompletedOnDate(habit.id, dateStr, habitCompletions);
                    const record = getHabitCompletionRecord(habit.id, dateStr, habitCompletions);
                    const isToday = dateStr === todayStr;
                    const isFuture = dateStr > todayStr;

                    if (!isScheduled) {
                      return (
                        <td
                          key={dateStr}
                          className={`py-3 px-2 text-center select-none ${
                            isToday ? 'bg-[#9B7BFF]/5' : ''
                          }`}
                        >
                          <span className="text-xs text-[#8E8EA0]/30 font-mono" title="Not scheduled on this day">
                            —
                          </span>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={dateStr}
                        className={`py-2 px-2 text-center ${isToday ? 'bg-[#9B7BFF]/5' : ''}`}
                      >
                        <div className="inline-flex flex-col items-center justify-center relative">
                          <button
                            type="button"
                            onClick={() => toggleHabitCompletion(habit.id, dateStr)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                              isDone
                                ? 'bg-[#43D9A3] text-[#0B0B10] shadow-sm shadow-[#43D9A3]/20 hover:bg-[#3ec493]'
                                : isToday
                                ? 'bg-[#0B0B10] border-2 border-[#9B7BFF]/50 hover:border-[#9B7BFF] text-transparent'
                                : isFuture
                                ? 'bg-[#0B0B10]/60 border border-[#292936] text-transparent opacity-60 hover:opacity-100 hover:border-[#9B7BFF]/40'
                                : 'bg-[#0B0B10] border border-[#292936] hover:border-[#8E8EA0] text-transparent'
                            }`}
                            title={`${habit.name}: ${isDone ? 'Completed' : 'Pending'} on ${formatMonthDay(dateStr)}`}
                            aria-label={`Toggle ${habit.name} on ${dateStr}`}
                          >
                            <Check className={`w-4 h-4 stroke-[2.5] ${isDone ? 'opacity-100' : 'opacity-0'}`} />
                          </button>

                          {record?.note && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditNote(habit, dateStr, record.note);
                              }}
                              className="absolute -top-1 -right-1 text-amber-400 hover:text-amber-300 cursor-pointer"
                              title={`Note: "${record.note}"`}
                            >
                              <FileText className="w-2.5 h-2.5 fill-amber-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

          {/* Footer Summary Row: Daily Completion Rate */}
          <tfoot>
            <tr className="bg-[#0B0B10] border-t border-[#292936] font-mono text-[11px] text-[#8E8EA0]">
              <td className="py-3 px-4 font-semibold uppercase tracking-wider sticky left-0 bg-[#0B0B10] z-10 border-r border-[#292936]/60">
                Daily Completion Rate
              </td>
              {daySummaries.map((summary, idx) => {
                const dateStr = weekDates[idx];
                const isToday = dateStr === todayStr;

                if (!summary.hasScheduled) {
                  return (
                    <td
                      key={dateStr}
                      className={`py-3 px-2 text-center text-[#8E8EA0]/40 ${
                        isToday ? 'bg-[#9B7BFF]/10 text-[#9B7BFF]' : ''
                      }`}
                    >
                      —
                    </td>
                  );
                }

                return (
                  <td
                    key={dateStr}
                    className={`py-3 px-2 text-center ${
                      isToday
                        ? 'bg-[#9B7BFF]/10 text-[#9B7BFF] font-bold'
                        : summary.percentage === 100
                        ? 'text-[#43D9A3] font-semibold'
                        : 'text-[#F3F3F7]'
                    }`}
                  >
                    <span>{summary.percentage}%</span>
                    <span className="text-[9px] text-[#8E8EA0] block">
                      {summary.completed}/{summary.total}
                    </span>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
