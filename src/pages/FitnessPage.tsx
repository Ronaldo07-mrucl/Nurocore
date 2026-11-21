import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkoutSession, WeightEntry, BodyMeasurementEntry } from '../types';
import { getTodayString } from '../utils/dates';
import { FitnessHeader } from '../components/fitness/FitnessHeader';
import { FitnessSummaryCards } from '../components/fitness/FitnessSummaryCards';
import { WeightTrendSection } from '../components/fitness/WeightTrendSection';
import { WorkoutCalendarSection } from '../components/fitness/WorkoutCalendarSection';
import { WorkoutHistorySection } from '../components/fitness/WorkoutHistorySection';
import { BodyMeasurementsSection } from '../components/fitness/BodyMeasurementsSection';
import { AddEditWorkoutModal } from '../components/modals/AddEditWorkoutModal';
import { AddEditWeightModal } from '../components/modals/AddEditWeightModal';
import { AddEditMeasurementModal } from '../components/modals/AddEditMeasurementModal';

export const FitnessPage: React.FC = () => {
  const {
    addWorkout,
    addWeightEntry,
    addBodyMeasurement,
  } = useApp();

  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [measurementModalOpen, setMeasurementModalOpen] = useState(false);

  const todayStr = getTodayString();

  const handleSaveWorkout = (w: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'> | WorkoutSession) => {
    if (!('id' in w)) {
      addWorkout(w);
    }
  };

  const handleSaveWeight = (wt: Omit<WeightEntry, 'id' | 'createdAt' | 'updatedAt'> | WeightEntry) => {
    if (!('id' in wt)) {
      addWeightEntry(wt);
    }
  };

  const handleSaveMeasurement = (m: Omit<BodyMeasurementEntry, 'id' | 'createdAt' | 'updatedAt'> | BodyMeasurementEntry) => {
    if (!('id' in m)) {
      addBodyMeasurement(m);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Page Header & Current Date */}
      <FitnessHeader onLogWorkout={() => setWorkoutModalOpen(true)} />

      {/* 2. Four Summary Widgets */}
      <FitnessSummaryCards />

      {/* 3. Weight Trajectory (Left) & Body Circumference Tracking (Right) in 1:1 Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <WeightTrendSection onLogWeight={() => setWeightModalOpen(true)} />
        <BodyMeasurementsSection onLogMeasurements={() => setMeasurementModalOpen(true)} />
      </div>

      {/* 4. Monthly Workout Calendar & Day Inspection */}
      <WorkoutCalendarSection />

      {/* 5. Today's Workout Sessions & Saved Routines */}
      <WorkoutHistorySection onAddWorkout={() => setWorkoutModalOpen(true)} />

      {/* Global Quick Action Modals */}
      <AddEditWorkoutModal
        isOpen={workoutModalOpen}
        onClose={() => setWorkoutModalOpen(false)}
        onSave={handleSaveWorkout}
        defaultDate={todayStr}
      />

      <AddEditWeightModal
        isOpen={weightModalOpen}
        onClose={() => setWeightModalOpen(false)}
        onSave={handleSaveWeight}
        defaultDate={todayStr}
      />

      <AddEditMeasurementModal
        isOpen={measurementModalOpen}
        onClose={() => setMeasurementModalOpen(false)}
        onSave={handleSaveMeasurement}
        defaultDate={todayStr}
      />
    </div>
  );
};
