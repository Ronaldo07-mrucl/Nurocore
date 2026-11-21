import React, { useState } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { useApp } from '../../context/AppContext';
import { Habit } from '../../types';
import { formatShortDate, formatLongDate, getTodayString, offsetDateString, formatMonthDay } from '../../utils/dates';
import {
  calculateIndividualHabitStats,
  getScheduleDescription,
  HABIT_CATEGORY_CONFIG,
  isHabitScheduledOnDate,
  isHabitCompletedOnDate,
} from '../../utils/habitSchedule';
import { ConfirmDialog } from './ConfirmDialog';
import {
  CheckSquare,
  Flame,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  Edit3,
  Pause,
  Play,
  Trash2,
  CheckCircle2,
  Circle,
  FileText,
} from 'lucide-react';

interface HabitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  onEdit: (habit: Habit) => void;
}

export const HabitDetailModal: React.FC<HabitDetailModalProps> = ({
  isOpen,
  onClose,
  habit,
  onEdit,
}) => {
  const {
    habitCompletions,
    toggleHabitCompletion,
    toggleHabitPause,
    deleteHabit,
    setHabitCompletionNote,
  } = useApp();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [editingNoteDate, setEditingNoteDate] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  if (!habit) return null;

  const todayStr = getTodayString();
  const stats = calculateIndividualHabitStats(habit, habitCompletions, todayStr);
  const scheduleDesc = getScheduleDescription(habit.schedule, habit.scheduledDays);
  const catConfig = HABIT_CATEGORY_CONFIG[habit.category || 'discipline'] || HABIT_CATEGORY_CONFIG.other;

  // Last 14 days strip (newest on right)
  const last14Days: { date: string; isScheduled: boolean; isDone: boolean; isToday: boolean }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = offsetDateString(todayStr, -i);
    last14Days.push({
      date: d,
      isScheduled: isHabitScheduledOnDate(habit, d),
      isDone: isHabitCompletedOnDate(habit.id, d, habitCompletions),
      isToday: d === todayStr,
    });
  }

  // Filter completions for this habit (newest first, up to 20 records)
  const sortedCompletions = [...habitCompletions]
    .filter(c => c.habitId === habit.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20);

  const handleSaveNote = (date: string) => {
    setHabitCompletionNote(habit.id, date, noteText.trim());
    setEditingNoteDate(null);
    setNoteText('');
  };

  const handleOpenNoteEditor = (date: string, currentNote?: string) => {
    setEditingNoteDate(date);
    setNoteText(currentNote || '');
  };

  const handleDeleteConfirm = () => {
    deleteHabit(habit.id);
    setConfirmDeleteOpen(false);
    onClose();
  };

  return (
    <>
      <ModalWrapper
        isOpen={isOpen}
        onClose={onClose}
        title={habit.name || habit.title || 'Habit Details'}
        subtitle="Individual discipline performance, streak audit, and completion log"
      >
        <div className="space-y-5">
          {/* Top Header Card */}
          <div className="p-4 bg-[#0B0B10] border border-[#292936] rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-sm border ${catConfig.bgClass} ${catConfig.textClass} ${catConfig.borderClass}`}
                >
                  {catConfig.label}
                </span>

                {habit.isNonNegotiable && (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-sm border border-amber-400/20 font-semibold">
                    NON-NEGOTIABLE
                  </span>
                )}

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border ${
                    habit.isActive
                      ? 'bg-[#43D9A3]/10 text-[#43D9A3] border-[#43D9A3]/25'
                      : 'bg-[#8E8EA0]/10 text-[#8E8EA0] border-[#8E8EA0]/25'
                  }`}
                >
                  {habit.isActive ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    onClose();
                    onEdit(habit);
                  }}
                  className="p-1.5 text-xs text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] border border-[#292936] rounded-lg transition-colors cursor-pointer"
                  title="Edit Habit"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => toggleHabitPause(habit.id)}
                  className="p-1.5 text-xs text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] border border-[#292936] rounded-lg transition-colors cursor-pointer"
                  title={habit.isActive ? 'Pause Habit' : 'Resume Habit'}
                >
                  {habit.isActive ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-[#43D9A3]" />}
                </button>
                <button
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="p-1.5 text-xs text-[#8E8EA0] hover:text-rose-400 hover:bg-rose-500/10 border border-[#292936] rounded-lg transition-colors cursor-pointer"
                  title="Delete Habit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {habit.description && (
              <p className="text-xs text-[#8E8EA0] leading-relaxed">
                {habit.description}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#292936] text-[11px] font-mono text-[#8E8EA0]">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#9B7BFF]" />
                <span>Schedule:</span>
                <span className="text-[#F3F3F7] font-sans font-medium">{scheduleDesc}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#43D9A3]" />
                <span>Started:</span>
                <span className="text-[#F3F3F7]">{formatShortDate(habit.startDate)}</span>
                {habit.endDate && <span>→ {formatShortDate(habit.endDate)}</span>}
              </div>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0B0B10] border border-[#292936] rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[#8E8EA0] text-[10px] font-semibold uppercase mb-1">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Current Streak</span>
              </div>
              <div className="text-xl font-bold font-mono text-[#F3F3F7] tabular-nums">
                {stats.currentStreak}
                <span className="text-xs font-normal text-[#8E8EA0] ml-1">days</span>
              </div>
            </div>

            <div className="bg-[#0B0B10] border border-[#292936] rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[#8E8EA0] text-[10px] font-semibold uppercase mb-1">
                <TrendingUp className="w-3 h-3 text-[#43D9A3]" />
                <span>30-Day Rate</span>
              </div>
              <div className="text-xl font-bold font-mono text-[#43D9A3] tabular-nums">
                {stats.thirtyDayRate}%
              </div>
            </div>

            <div className="bg-[#0B0B10] border border-[#292936] rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[#8E8EA0] text-[10px] font-semibold uppercase mb-1">
                <Award className="w-3 h-3 text-[#9B7BFF]" />
                <span>Total Done</span>
              </div>
              <div className="text-xl font-bold font-mono text-[#F3F3F7] tabular-nums">
                {stats.totalCompletions}
              </div>
            </div>
          </div>

          {/* 14-Day Visual Execution Strip */}
          <div className="bg-[#0B0B10] border border-[#292936] rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#F3F3F7]">Recent 14 Days Execution</span>
              <span className="text-[10px] text-[#8E8EA0] font-mono">Today on right</span>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 pt-1">
              {last14Days.map(item => (
                <div
                  key={item.date}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all ${
                    item.isToday ? 'border-[#9B7BFF] bg-[#9B7BFF]/10' : 'border-[#292936] bg-[#14141D]'
                  }`}
                >
                  <span className="text-[9px] font-mono text-[#8E8EA0] block">
                    {formatMonthDay(item.date).split(' ')[1]}
                  </span>
                  <div className="my-1">
                    {!item.isScheduled ? (
                      <span className="text-xs text-[#8E8EA0]/40 font-mono">—</span>
                    ) : item.isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-[#43D9A3]" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#8E8EA0]/30" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Completion Log Table with Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#F3F3F7]">Recent Completion Log & Notes</span>
              <span className="text-[10px] text-[#8E8EA0] font-mono">
                {sortedCompletions.length} records shown
              </span>
            </div>

            {sortedCompletions.length === 0 ? (
              <div className="p-4 bg-[#0B0B10] border border-[#292936] rounded-xl text-center text-xs text-[#8E8EA0]">
                No completion entries recorded yet for this habit.
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto rounded-xl border border-[#292936] bg-[#0B0B10] divide-y divide-[#292936]">
                {sortedCompletions.map(rec => (
                  <div key={rec.id} className="p-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => toggleHabitCompletion(habit.id, rec.date)}
                        className="cursor-pointer"
                        title="Toggle completion"
                      >
                        {rec.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#43D9A3]" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#8E8EA0]" />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className={rec.completed ? 'text-[#F3F3F7] font-medium' : 'text-[#8E8EA0]'}>
                            {formatShortDate(rec.date)}
                          </span>
                          {rec.date === todayStr && (
                            <span className="text-[9px] bg-[#9B7BFF]/20 text-[#9B7BFF] px-1.5 py-0.2 rounded-xs">
                              TODAY
                            </span>
                          )}
                        </div>
                        {rec.note && editingNoteDate !== rec.date && (
                          <p className="text-[11px] text-[#8E8EA0] mt-0.5 italic">
                            "{rec.note}"
                          </p>
                        )}
                        {editingNoteDate === rec.date && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <input
                              type="text"
                              value={noteText}
                              onChange={e => setNoteText(e.target.value)}
                              placeholder="Add execution note..."
                              className="px-2 py-1 bg-[#14141D] border border-[#292936] rounded-md text-xs text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF]"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveNote(rec.date)}
                              className="px-2 py-1 bg-[#9B7BFF] text-white rounded-md text-xs font-medium cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNoteDate(null)}
                              className="px-2 py-1 bg-[#1B1B26] text-[#8E8EA0] rounded-md text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {editingNoteDate !== rec.date && (
                      <button
                        onClick={() => handleOpenNoteEditor(rec.date, rec.note)}
                        className="p-1 text-[#8E8EA0] hover:text-[#F3F3F7] transition-colors cursor-pointer shrink-0"
                        title={rec.note ? 'Edit note' : 'Add note'}
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ModalWrapper>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Habit & History"
        description={`Are you sure you want to permanently delete "${habit.name || habit.title}"? This will remove all associated completion records and streak history.`}
        confirmLabel="Delete Habit"
        isDestructive
      />
    </>
  );
};
