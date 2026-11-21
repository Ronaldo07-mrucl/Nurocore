import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Habit } from '../types';
import { getTodayString, offsetDateString } from '../utils/dates';
import { getWeekDatesMondayStart } from '../utils/habitSchedule';
import { HabitHeader } from '../components/habits/HabitHeader';
import { HabitSummaryCards } from '../components/habits/HabitSummaryCards';
import { WeeklyHabitGrid } from '../components/habits/WeeklyHabitGrid';
import { NonNegotiablesSection } from '../components/habits/NonNegotiablesSection';
import { WeeklyHabitSummary } from '../components/habits/WeeklyHabitSummary';
import { AddEditHabitModal } from '../components/modals/AddEditHabitModal';
import { HabitDetailModal } from '../components/modals/HabitDetailModal';
import { HabitCompletionNoteModal } from '../components/modals/HabitCompletionNoteModal';

export const HabitTrackingPage: React.FC = () => {
  const { addHabit, updateHabit, setHabitCompletionNote } = useApp();

  const todayStr = getTodayString();
  const [referenceDate, setReferenceDate] = useState<string>(todayStr);

  // Compute Monday-to-Sunday dates for current reference date
  const { dates: weekDates, mondayDate, sundayDate } = useMemo(() => {
    return getWeekDatesMondayStart(referenceDate);
  }, [referenceDate]);

  const isCurrentWeek = useMemo(() => {
    return todayStr >= mondayDate && todayStr <= sundayDate;
  }, [todayStr, mondayDate, sundayDate]);

  // Modals state
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedHabitForDetail, setSelectedHabitForDetail] = useState<Habit | null>(null);

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteTarget, setNoteTarget] = useState<{ habit: Habit; date: string; note?: string } | null>(null);

  // Week navigation
  const handlePrevWeek = () => {
    setReferenceDate(prev => offsetDateString(prev, -7));
  };

  const handleNextWeek = () => {
    setReferenceDate(prev => offsetDateString(prev, 7));
  };

  const handleCurrentWeek = () => {
    setReferenceDate(todayStr);
  };

  // Habit CRUD handlers
  const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'> | Habit) => {
    if ('id' in habitData) {
      updateHabit(habitData);
      // Update selected detail habit if currently open
      if (selectedHabitForDetail?.id === habitData.id) {
        setSelectedHabitForDetail(habitData);
      }
    } else {
      addHabit(habitData);
    }
    setEditingHabit(null);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setAddEditModalOpen(true);
  };

  const handleOpenDetail = (habit: Habit) => {
    setSelectedHabitForDetail(habit);
    setDetailModalOpen(true);
  };

  const handleOpenNote = (habit: Habit, date: string, currentNote?: string) => {
    setNoteTarget({ habit, date, note: currentNote });
    setNoteModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Page Title & Date */}
      <HabitHeader currentDateStr={todayStr} />

      {/* 2. Four Habit Metrics Cards */}
      <HabitSummaryCards todayStr={todayStr} />

      {/* 3 & 4. Weekly Execution Matrix (Left, 3/4) & Core Non-Negotiables (Right, 1/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        <div className="lg:col-span-3 min-w-0">
          <WeeklyHabitGrid
            weekDates={weekDates}
            todayStr={todayStr}
            selectedMondayDate={mondayDate}
            selectedSundayDate={sundayDate}
            isCurrentWeek={isCurrentWeek}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            onCurrentWeek={handleCurrentWeek}
            onSelectHabit={handleOpenDetail}
            onAddHabit={() => {
              setEditingHabit(null);
              setAddEditModalOpen(true);
            }}
            onEditNote={handleOpenNote}
          />
        </div>

        <div className="lg:col-span-1 min-w-0">
          <NonNegotiablesSection
            todayStr={todayStr}
            onAddHabit={() => {
              setEditingHabit(null);
              setAddEditModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* 6. Weekly Execution Summary */}
      <WeeklyHabitSummary
        weekDates={weekDates}
        todayStr={todayStr}
        isCurrentWeek={isCurrentWeek}
      />

      {/* Modals */}
      <AddEditHabitModal
        isOpen={addEditModalOpen}
        onClose={() => {
          setAddEditModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        initialHabit={editingHabit}
      />

      <HabitDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedHabitForDetail(null);
        }}
        habit={selectedHabitForDetail}
        onEdit={handleOpenEdit}
      />

      {noteTarget && (
        <HabitCompletionNoteModal
          isOpen={noteModalOpen}
          onClose={() => {
            setNoteModalOpen(false);
            setNoteTarget(null);
          }}
          habit={noteTarget.habit}
          dateStr={noteTarget.date}
          initialNote={noteTarget.note}
          onSaveNote={(habitId, date, note) => {
            setHabitCompletionNote(habitId, date, note);
          }}
        />
      )}
    </div>
  );
};
