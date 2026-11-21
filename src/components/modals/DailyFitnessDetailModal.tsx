import React, { useState } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { useApp } from '../../context/AppContext';
import { WorkoutSession, WeightEntry, BodyMeasurementEntry } from '../../types';
import { formatLongDate } from '../../utils/dates';
import { formatWeight, formatLength, getWorkoutTypeStyle } from '../../utils/fitness';
import { AddEditWorkoutModal } from './AddEditWorkoutModal';
import { AddEditWeightModal } from './AddEditWeightModal';
import { AddEditMeasurementModal } from './AddEditMeasurementModal';
import { ConfirmDialog } from './ConfirmDialog';
import {
  Dumbbell,
  Scale,
  Ruler,
  Plus,
  Clock,
  Edit3,
  Trash2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface DailyFitnessDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string; // YYYY-MM-DD
}

export const DailyFitnessDetailModal: React.FC<DailyFitnessDetailModalProps> = ({
  isOpen,
  onClose,
  date,
}) => {
  const {
    workouts,
    weightEntries,
    bodyMeasurements,
    fitnessSettings,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    addWeightEntry,
    updateWeightEntry,
    deleteWeightEntry,
    addBodyMeasurement,
    updateBodyMeasurement,
    deleteBodyMeasurement,
  } = useApp();

  // Child Modals
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutSession | null>(null);
  const [workoutToDelete, setWorkoutToDelete] = useState<WorkoutSession | null>(null);

  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [editingWeight, setEditingWeight] = useState<WeightEntry | null>(null);
  const [weightToDelete, setWeightToDelete] = useState<WeightEntry | null>(null);

  const [measurementModalOpen, setMeasurementModalOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<BodyMeasurementEntry | null>(null);
  const [measurementToDelete, setMeasurementToDelete] = useState<BodyMeasurementEntry | null>(null);

  // Filter records for this specific date
  const dayWorkouts = workouts.filter(w => w.date === date);
  const dayWeights = weightEntries.filter(w => w.date === date);
  const dayMeasurements = bodyMeasurements.filter(m => m.date === date);

  const hasAnyRecord = dayWorkouts.length > 0 || dayWeights.length > 0 || dayMeasurements.length > 0;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={formatLongDate(date)}
      subtitle="Complete fitness audit for this calendar day."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 text-xs">
        {/* Quick Action Bar for this day */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0B0B10] border border-[#292936] rounded-xl">
          <span className="text-[#8E8EA0] text-[11px] font-medium">Log for this date:</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setEditingWorkout(null);
                setWorkoutModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#43D9A3] hover:text-[#0B0B10] bg-[#43D9A3]/10 hover:bg-[#43D9A3] border border-[#43D9A3]/30 rounded-lg transition-colors cursor-pointer"
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>+ Workout</span>
            </button>

            <button
              onClick={() => {
                setEditingWeight(null);
                setWeightModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#9B7BFF] hover:text-white bg-[#9B7BFF]/10 hover:bg-[#9B7BFF] border border-[#9B7BFF]/30 rounded-lg transition-colors cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>+ Weight</span>
            </button>

            <button
              onClick={() => {
                setEditingMeasurement(null);
                setMeasurementModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#F3F3F7] hover:bg-[#1B1B26] border border-[#292936] rounded-lg transition-colors cursor-pointer"
            >
              <Ruler className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Measurements</span>
            </button>
          </div>
        </div>

        {!hasAnyRecord && (
          <div className="py-8 text-center bg-[#0B0B10] border border-[#292936] rounded-xl p-4">
            <Calendar className="w-8 h-8 text-[#8E8EA0] mx-auto mb-2 opacity-50" />
            <p className="font-medium text-[#F3F3F7]">No fitness records logged on this day</p>
            <p className="text-[11px] text-[#8E8EA0] mt-0.5">
              Use the buttons above to log a workout, record body weight, or track circumferences.
            </p>
          </div>
        )}

        {/* 1. WORKOUTS ON THIS DAY */}
        {dayWorkouts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8E8EA0] pb-1 border-b border-[#292936]">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#43D9A3]" />
                <span>Workouts ({dayWorkouts.length})</span>
              </div>
            </div>

            <div className="space-y-3">
              {dayWorkouts.map(w => {
                const style = getWorkoutTypeStyle(w.workoutType);
                return (
                  <div
                    key={w.id}
                    className="p-3.5 bg-[#0B0B10] border border-[#292936] rounded-xl space-y-2.5"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#292936]">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-sm border ${style.badgeClass}`}
                        >
                          {style.label}
                        </span>
                        <h4 className="font-semibold text-sm text-[#F3F3F7] truncate">
                          {w.name || w.workoutType}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {w.durationMinutes && (
                          <div className="flex items-center gap-1 text-[11px] text-[#8E8EA0] font-mono mr-1">
                            <Clock className="w-3 h-3" />
                            <span>{w.durationMinutes}m</span>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setEditingWorkout(w);
                            setWorkoutModalOpen(true);
                          }}
                          className="p-1 text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#14141D] rounded-md transition-colors cursor-pointer"
                          title="Edit workout"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setWorkoutToDelete(w)}
                          className="p-1 text-[#8E8EA0] hover:text-rose-400 hover:bg-rose-950/20 rounded-md transition-colors cursor-pointer"
                          title="Delete workout"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Exercise List */}
                    {w.exercises && w.exercises.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] text-[#8E8EA0] uppercase tracking-wider font-semibold block">
                          Exercises Logged ({w.exercises.length}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {w.exercises.map((ex, idx) => (
                            <div
                              key={ex.id || idx}
                              className="p-2 rounded-lg bg-[#14141D] border border-[#292936] text-[11px] flex items-center justify-between"
                            >
                              <span className="font-medium text-[#F3F3F7] truncate max-w-[140px]">
                                {ex.name}
                              </span>
                              <div className="font-mono text-[#8E8EA0] shrink-0 text-right">
                                {ex.sets && ex.reps ? (
                                  <span>{ex.sets} × {ex.reps}</span>
                                ) : ex.sets ? (
                                  <span>{ex.sets} sets</span>
                                ) : null}
                                {ex.weight !== undefined && (
                                  <span className="text-[#43D9A3] ml-1">@{ex.weight}kg</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {w.notes && (
                      <p className="text-[11px] text-[#8E8EA0] leading-snug pt-1 italic">
                        &quot;{w.notes}&quot;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. BODY WEIGHT ON THIS DAY */}
        {dayWeights.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8E8EA0] pb-1 border-b border-[#292936]">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#9B7BFF]" />
                <span>Body Weight ({dayWeights.length})</span>
              </div>
            </div>

            <div className="space-y-2">
              {dayWeights.map(wt => (
                <div
                  key={wt.id}
                  className="p-3 bg-[#0B0B10] border border-[#292936] rounded-xl flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-baseline gap-2 font-mono">
                      <span className="text-xl font-bold text-[#F3F3F7]">
                        {formatWeight(wt.weightKg, fitnessSettings.displayWeightUnit)}
                      </span>
                    </div>
                    {wt.notes && (
                      <p className="text-[11px] text-[#8E8EA0] mt-0.5">{wt.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingWeight(wt);
                        setWeightModalOpen(true);
                      }}
                      className="p-1.5 text-[#8E8EA0] hover:text-[#F3F3F7] rounded-md transition-colors cursor-pointer"
                      title="Edit weight"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setWeightToDelete(wt)}
                      className="p-1.5 text-[#8E8EA0] hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                      title="Delete weight"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. MEASUREMENTS ON THIS DAY */}
        {dayMeasurements.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8E8EA0] pb-1 border-b border-[#292936]">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-amber-400" />
                <span>Circumference Measurements ({dayMeasurements.length})</span>
              </div>
            </div>

            <div className="space-y-2">
              {dayMeasurements.map(m => (
                <div
                  key={m.id}
                  className="p-3 bg-[#0B0B10] border border-[#292936] rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      {m.waistCm && (
                        <div>
                          <span className="text-[10px] text-[#8E8EA0] block">Waist</span>
                          <span className="font-mono font-bold text-[#F3F3F7]">
                            {formatLength(m.waistCm, fitnessSettings.displayLengthUnit)}
                          </span>
                        </div>
                      )}
                      {m.chestCm && (
                        <div>
                          <span className="text-[10px] text-[#8E8EA0] block">Chest</span>
                          <span className="font-mono font-bold text-[#F3F3F7]">
                            {formatLength(m.chestCm, fitnessSettings.displayLengthUnit)}
                          </span>
                        </div>
                      )}
                      {m.hipsCm && (
                        <div>
                          <span className="text-[10px] text-[#8E8EA0] block">Hips</span>
                          <span className="font-mono font-bold text-[#F3F3F7]">
                            {formatLength(m.hipsCm, fitnessSettings.displayLengthUnit)}
                          </span>
                        </div>
                      )}
                      {m.armCm && (
                        <div>
                          <span className="text-[10px] text-[#8E8EA0] block">Arm</span>
                          <span className="font-mono font-bold text-[#F3F3F7]">
                            {formatLength(m.armCm, fitnessSettings.displayLengthUnit)}
                          </span>
                        </div>
                      )}
                      {m.thighCm && (
                        <div>
                          <span className="text-[10px] text-[#8E8EA0] block">Thigh</span>
                          <span className="font-mono font-bold text-[#F3F3F7]">
                            {formatLength(m.thighCm, fitnessSettings.displayLengthUnit)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        onClick={() => {
                          setEditingMeasurement(m);
                          setMeasurementModalOpen(true);
                        }}
                        className="p-1.5 text-[#8E8EA0] hover:text-[#F3F3F7] rounded-md transition-colors cursor-pointer"
                        title="Edit measurement"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setMeasurementToDelete(m)}
                        className="p-1.5 text-[#8E8EA0] hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                        title="Delete measurement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {m.notes && (
                    <p className="text-[11px] text-[#8E8EA0] italic pt-1 border-t border-[#292936]">
                      {m.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-[#292936]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#F3F3F7] bg-[#14141D] hover:bg-[#1B1B26] border border-[#292936] rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Child Modals */}
      <AddEditWorkoutModal
        isOpen={workoutModalOpen}
        onClose={() => setWorkoutModalOpen(false)}
        onSave={w => {
          if ('id' in w) updateWorkout(w as WorkoutSession);
          else addWorkout(w);
        }}
        initialWorkout={editingWorkout}
        defaultDate={date}
      />

      <AddEditWeightModal
        isOpen={weightModalOpen}
        onClose={() => setWeightModalOpen(false)}
        onSave={wt => {
          if ('id' in wt) updateWeightEntry(wt as WeightEntry);
          else addWeightEntry(wt);
        }}
        initialWeight={editingWeight}
        defaultDate={date}
      />

      <AddEditMeasurementModal
        isOpen={measurementModalOpen}
        onClose={() => setMeasurementModalOpen(false)}
        onSave={m => {
          if ('id' in m) updateBodyMeasurement(m as BodyMeasurementEntry);
          else addBodyMeasurement(m);
        }}
        initialMeasurement={editingMeasurement}
        defaultDate={date}
      />

      {/* Deletion confirmations */}
      <ConfirmDialog
        isOpen={Boolean(workoutToDelete)}
        onClose={() => setWorkoutToDelete(null)}
        onConfirm={() => {
          if (workoutToDelete) deleteWorkout(workoutToDelete.id);
        }}
        title="Delete Workout Session?"
        description={`Are you sure you want to delete "${workoutToDelete?.name || 'Workout'}"?`}
        confirmLabel="Delete Workout"
        isDestructive
      />

      <ConfirmDialog
        isOpen={Boolean(weightToDelete)}
        onClose={() => setWeightToDelete(null)}
        onConfirm={() => {
          if (weightToDelete) deleteWeightEntry(weightToDelete.id);
        }}
        title="Delete Weight Entry?"
        description="Are you sure you want to delete this weight log?"
        confirmLabel="Delete Entry"
        isDestructive
      />

      <ConfirmDialog
        isOpen={Boolean(measurementToDelete)}
        onClose={() => setMeasurementToDelete(null)}
        onConfirm={() => {
          if (measurementToDelete) deleteBodyMeasurement(measurementToDelete.id);
        }}
        title="Delete Measurements?"
        description="Are you sure you want to delete this circumference log?"
        confirmLabel="Delete Log"
        isDestructive
      />
    </ModalWrapper>
  );
};
