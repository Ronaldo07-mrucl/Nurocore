import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  isHabitScheduledOnDate,
  isHabitCompletedOnDate,
  HABIT_CATEGORY_CONFIG,
} from '../../utils/habitSchedule';
import { Star, Check, Plus } from 'lucide-react';

interface NonNegotiablesSectionProps {
  todayStr: string;
  onAddHabit: () => void;
}

export const NonNegotiablesSection: React.FC<NonNegotiablesSectionProps> = ({
  todayStr,
  onAddHabit,
}) => {
  const { habits, habitCompletions, toggleHabitCompletion } = useApp();

  const nonNegotiables = habits.filter(h => h.isNonNegotiable);

  if (nonNegotiables.length === 0) {
    return (
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 space-y-3 h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#292936]">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <h3 className="text-sm font-semibold text-[#F3F3F7]">Non-Negotiables</h3>
            </div>
          </div>
          <p className="text-xs text-[#8E8EA0] mt-3">
            No core non-negotiable habits yet.
          </p>
        </div>
        <button
          onClick={onAddHabit}
          className="text-xs text-[#9B7BFF] hover:underline flex items-center gap-1 cursor-pointer self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Non-Negotiable</span>
        </button>
      </div>
    );
  }

  const dueToday = nonNegotiables.filter(h => isHabitScheduledOnDate(h, todayStr));
  const completedToday = dueToday.filter(h =>
    isHabitCompletedOnDate(h.id, todayStr, habitCompletions)
  );

  return (
    <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 space-y-3.5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#292936] gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
          <h3 className="text-sm font-semibold text-[#F3F3F7] truncate">Non-Negotiables</h3>
        </div>
        <span className="text-xs font-mono text-[#8E8EA0] tabular-nums shrink-0">
          {completedToday.length}/{dueToday.length}
        </span>
      </div>

      {/* Vertical List — Habit + Category only; background changes black -> green on completion */}
      <div className="flex flex-col gap-2">
        {nonNegotiables.map(habit => {
          const isScheduledToday = isHabitScheduledOnDate(habit, todayStr);
          const isDoneToday = isHabitCompletedOnDate(habit.id, todayStr, habitCompletions);
          const catConfig =
            HABIT_CATEGORY_CONFIG[habit.category || 'discipline'] || HABIT_CATEGORY_CONFIG.other;
          const canToggle = habit.isActive && isScheduledToday;

          return (
            <button
              key={habit.id}
              type="button"
              disabled={!canToggle}
              onClick={() => canToggle && toggleHabitCompletion(habit.id, todayStr)}
              aria-pressed={isDoneToday}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-colors flex items-center justify-between gap-2.5 ${
                !habit.isActive || !isScheduledToday
                  ? 'bg-[#0B0B10]/60 border-[#292936]/60 opacity-60 cursor-default'
                  : isDoneToday
                  ? 'bg-[#16A34A]/25 border-[#43D9A3]/60 hover:bg-[#16A34A]/30 cursor-pointer'
                  : 'bg-[#0B0B10] border-[#292936] hover:border-[#3B3B4E] cursor-pointer'
              }`}
            >
              <div className="min-w-0 space-y-0.5">
                <div className="text-xs font-semibold text-[#F3F3F7] truncate">
                  {habit.name || habit.title}
                </div>
                <div className={`text-[11px] font-medium truncate ${catConfig.textClass}`}>
                  {catConfig.label}
                </div>
              </div>

              {isScheduledToday && isDoneToday && (
                <Check className="w-4 h-4 text-[#43D9A3] shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
