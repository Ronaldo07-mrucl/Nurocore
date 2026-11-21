import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getTodayString } from '../../utils/dates';
import {
  generateMonthlyCalendarGrid,
  getDailyWeightMap,
  formatWeight,
  getWorkoutTypeStyle,
} from '../../utils/fitness';
import { DailyFitnessDetailModal } from '../modals/DailyFitnessDetailModal';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Scale,
} from 'lucide-react';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const WorkoutCalendarSection: React.FC = () => {
  const { workouts, weightEntries, fitnessSettings } = useApp();
  const todayStr = getTodayString();
  const todayDate = new Date();

  const [currentYear, setCurrentYear] = useState<number>(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(todayDate.getMonth()); // 0-11
  const [activeDateModal, setActiveDateModal] = useState<string | null>(null);

  // Month title formatter (e.g. "October 2026")
  const monthName = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [currentYear, currentMonth]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    return generateMonthlyCalendarGrid(currentYear, currentMonth, todayStr);
  }, [currentYear, currentMonth, todayStr]);

  // Map of date -> weight
  const dailyWeightMap = useMemo(() => {
    return getDailyWeightMap(weightEntries);
  }, [weightEntries]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  return (
    <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#292936] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F3F3F7]">Training & Habit Consistency Calendar</h3>
            <span className="text-[10px] font-mono text-[#8E8EA0] px-2 py-0.5 rounded-sm bg-[#0B0B10] border border-[#292936]">
              Monday start
            </span>
          </div>
          <p className="text-xs text-[#8E8EA0] mt-0.5">
            Click any calendar day to inspect workouts, weight readings, or log a session
          </p>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs text-[#8E8EA0] hover:text-[#F3F3F7] bg-[#0B0B10] hover:bg-[#1B1B26] border border-[#292936] rounded-lg transition-colors cursor-pointer"
          >
            Today
          </button>

          <div className="flex items-center bg-[#0B0B10] border border-[#292936] rounded-lg p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-[#8E8EA0] hover:text-[#F3F3F7] rounded transition-colors cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold font-mono text-[#F3F3F7] min-w-[130px] text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 text-[#8E8EA0] hover:text-[#F3F3F7] rounded transition-colors cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-1">
        {/* Weekday Labels Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-[#8E8EA0] pb-1 font-semibold uppercase tracking-wider">
          {WEEKDAYS.map(day => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map(day => {
            const dayWorkouts = workouts.filter(w => w.date === day.date);
            const dayWeight = dailyWeightMap.get(day.date);
            const hasWorkout = dayWorkouts.length > 0;

            return (
              <div
                key={day.date}
                onClick={() => setActiveDateModal(day.date)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setActiveDateModal(day.date);
                  }
                }}
                className={`min-h-[72px] sm:min-h-[82px] p-1.5 sm:p-2 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer group ${
                  day.isToday
                    ? 'ring-1 ring-[#9B7BFF] border-[#9B7BFF]/50 bg-[#9B7BFF]/5'
                    : hasWorkout
                    ? 'border-[#43D9A3]/30 bg-[#43D9A3]/5 hover:border-[#43D9A3]/60'
                    : day.isCurrentMonth
                    ? 'border-[#292936] bg-[#0B0B10] hover:border-[#3B3B4E]'
                    : 'border-[#292936]/40 bg-[#0B0B10]/40 opacity-40 hover:opacity-80'
                }`}
              >
                {/* Day Number and Badges */}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-semibold ${
                      day.isToday
                        ? 'text-[#9B7BFF] font-bold'
                        : day.isCurrentMonth
                        ? 'text-[#F3F3F7]'
                        : 'text-[#8E8EA0]'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {/* Workout Icon Indicator */}
                  {hasWorkout && (
                    <span
                      className="w-4 h-4 rounded-full bg-[#43D9A3]/20 border border-[#43D9A3]/40 flex items-center justify-center text-[#43D9A3]"
                      title={`${dayWorkouts.length} workout(s) logged`}
                    >
                      <Dumbbell className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                {/* Workout Details Pill */}
                <div className="space-y-0.5 mt-1 overflow-hidden">
                  {hasWorkout && (
                    <div className="text-[10px] text-[#43D9A3] truncate font-medium">
                      <span className="hidden sm:inline">
                        {dayWorkouts[0].name || dayWorkouts[0].workoutType}
                      </span>
                      <span className="sm:hidden font-mono">
                        {dayWorkouts.length}W
                      </span>
                    </div>
                  )}

                  {/* Weight Entry Indicator beneath date */}
                  {dayWeight && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-[#9B7BFF] truncate">
                      <Scale className="w-2.5 h-2.5 shrink-0 hidden sm:inline" />
                      <span className="truncate">
                        {formatWeight(dayWeight.weightKg, fitnessSettings.displayWeightUnit)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Summary Info */}
      <div className="pt-2 border-t border-[#292936] flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#8E8EA0]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#43D9A3]" />
            <span>Workout Logged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9B7BFF]" />
            <span>Weigh-in Recorded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-[#9B7BFF] bg-[#9B7BFF]/20" />
            <span>Today</span>
          </div>
        </div>

        <span className="font-mono text-[10px] text-[#8E8EA0]">
          Total sessions logged: {workouts.length}
        </span>
      </div>

      {/* Daily Detail Modal */}
      {activeDateModal && (
        <DailyFitnessDetailModal
          isOpen={Boolean(activeDateModal)}
          onClose={() => setActiveDateModal(null)}
          date={activeDateModal}
        />
      )}
    </div>
  );
};
