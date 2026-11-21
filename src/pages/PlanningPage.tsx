import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Goal, MonthlyOutcome } from '../types';
import { getCurrentMonthString, getTodayString, offsetDateString } from '../utils/dates';
import { getWeekDatesMondayStart } from '../utils/habitSchedule';
import { PlanningHeader } from '../components/planning/PlanningHeader';
import { MonthlyOutcomesSection } from '../components/planning/MonthlyOutcomesSection';
import { LongTermGoalsSection } from '../components/planning/LongTermGoalsSection';
import { WeeklyPlannerSection } from '../components/planning/WeeklyPlannerSection';
import { AddEditMonthlyOutcomeModal } from '../components/modals/AddEditMonthlyOutcomeModal';
import { AddEditGoalModal } from '../components/modals/AddEditGoalModal';

export const PlanningPage: React.FC = () => {
  const {
    addMonthlyOutcome,
    updateMonthlyOutcome,
    addGoal,
    updateGoal,
  } = useApp();

  // Navigation state
  const [selectedMonth, setSelectedMonth] = useState<string>(() => getCurrentMonthString());
  const [weekReferenceDate, setWeekReferenceDate] = useState<string>(() => getTodayString());

  // Week calculation (Monday through Sunday)
  const { dates: weekDates } = getWeekDatesMondayStart(weekReferenceDate);
  const currentWeekMonday = getWeekDatesMondayStart(getTodayString()).mondayDate;
  const isCurrentWeek = weekDates[0] === currentWeekMonday;

  // Modals state
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [editingOutcome, setEditingOutcome] = useState<MonthlyOutcome | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Week Navigation handlers
  const handlePrevWeek = () => {
    setWeekReferenceDate(prev => offsetDateString(prev, -7));
  };

  const handleNextWeek = () => {
    setWeekReferenceDate(prev => offsetDateString(prev, 7));
  };

  const handleCurrentWeek = () => {
    setWeekReferenceDate(getTodayString());
  };

  // Outcome Handlers
  const handleAddOutcome = () => {
    setEditingOutcome(null);
    setIsOutcomeModalOpen(true);
  };

  const handleEditOutcome = (outcome: MonthlyOutcome) => {
    setEditingOutcome(outcome);
    setIsOutcomeModalOpen(true);
  };

  const handleSaveOutcome = (outcomeData: Omit<MonthlyOutcome, 'id' | 'createdAt' | 'updatedAt'> | MonthlyOutcome) => {
    if ('id' in outcomeData) {
      updateMonthlyOutcome(outcomeData as MonthlyOutcome);
    } else {
      addMonthlyOutcome(outcomeData);
    }
  };

  // Goal Handlers
  const handleAddGoal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'createdAt'> | Goal) => {
    if ('id' in goalData) {
      updateGoal(goalData as Goal);
    } else {
      addGoal(goalData);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header with Month Navigator */}
      <PlanningHeader
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      {/* 2. Monthly Key Outcomes */}
      <MonthlyOutcomesSection
        selectedMonth={selectedMonth}
        onAddOutcome={handleAddOutcome}
        onEditOutcome={handleEditOutcome}
      />

      {/* 3. Long-Term Identity Goals */}
      <LongTermGoalsSection
        onAddGoal={handleAddGoal}
        onEditGoal={handleEditGoal}
      />

      {/* 4. Weekly Planner Section (Monday through Sunday) */}
      <WeeklyPlannerSection
        weekDates={weekDates}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onCurrentWeek={handleCurrentWeek}
        isCurrentWeek={isCurrentWeek}
      />

      {/* Modals */}
      <AddEditMonthlyOutcomeModal
        isOpen={isOutcomeModalOpen}
        onClose={() => setIsOutcomeModalOpen(false)}
        onSave={handleSaveOutcome}
        initialOutcome={editingOutcome}
        defaultMonth={selectedMonth}
      />

      <AddEditGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
        initialGoal={editingGoal}
      />
    </div>
  );
};
