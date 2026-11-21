import React, { useState } from 'react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { SummaryWidgets } from '../components/dashboard/SummaryWidgets';
import { TopGoalsSection } from '../components/dashboard/TopGoalsSection';
import { TasksAndPlansSection } from '../components/dashboard/TasksAndPlansSection';
import { TestsAndMarksSection } from '../components/dashboard/TestsAndMarksSection';
import { AddEditTaskModal } from '../components/modals/AddEditTaskModal';
import { AddEditTestModal } from '../components/modals/AddEditTestModal';
import { useApp } from '../context/AppContext';
import { Task, TestRecord } from '../types';

export const DashboardPage: React.FC = () => {
  const { addTask, addTest } = useApp();
  const [quickTaskModalOpen, setQuickTaskModalOpen] = useState(false);
  const [quickTestModalOpen, setQuickTestModalOpen] = useState(false);

  const handleSaveQuickTask = (taskData: Omit<Task, 'id' | 'createdAt'> | Task) => {
    addTask(taskData as Omit<Task, 'id' | 'createdAt'>);
  };

  const handleSaveQuickTest = (testData: Omit<TestRecord, 'id' | 'createdAt'> | TestRecord) => {
    addTest(testData as Omit<TestRecord, 'id' | 'createdAt'>);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* A. Dashboard Heading */}
      <DashboardHeader
        onQuickAddTask={() => setQuickTaskModalOpen(true)}
        onQuickAddTest={() => setQuickTestModalOpen(true)}
      />

      {/* B. Four Summary Widgets */}
      <SummaryWidgets />

      {/* C. Two Featured Goals ("Top Goals Right Now") */}
      <TopGoalsSection />

      {/* D. Section One: Today's Tasks & Upcoming Plans */}
      <TasksAndPlansSection />

      {/* E. Section Two: Tests & Marks Trend */}
      <TestsAndMarksSection />

      {/* Quick Add Modals */}
      <AddEditTaskModal
        isOpen={quickTaskModalOpen}
        onClose={() => setQuickTaskModalOpen(false)}
        onSave={handleSaveQuickTask}
      />

      <AddEditTestModal
        isOpen={quickTestModalOpen}
        onClose={() => setQuickTestModalOpen(false)}
        onSave={handleSaveQuickTest}
      />
    </div>
  );
};
