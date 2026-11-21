import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { useApp } from '../../context/AppContext';
import { WorkoutSession, WorkoutRoutine, ExerciseEntry } from '../../types';
import { getTodayString } from '../../utils/dates';
import { Plus, Trash2, Dumbbell, BookmarkPlus, Zap } from 'lucide-react';

interface AddEditWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workout: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'> | WorkoutSession) => void;
  initialWorkout?: WorkoutSession | null;
  initialRoutine?: WorkoutRoutine | null;
  defaultDate?: string;
}

export const AddEditWorkoutModal: React.FC<AddEditWorkoutModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialWorkout,
  initialRoutine,
  defaultDate,
}) => {
  const { workoutRoutines, addWorkoutRoutine } = useApp();

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [workoutType, setWorkoutType] = useState('strength');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(45);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const [saveAsRoutine, setSaveAsRoutine] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyRoutine = (routine: WorkoutRoutine) => {
    setName(routine.name);
    setWorkoutType(routine.workoutType || 'strength');
    setDurationMinutes(routine.durationMinutes !== undefined ? routine.durationMinutes : 45);
    setExercises(
      (routine.exercises || []).map((ex, idx) => ({
        ...ex,
        id: `ex-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      }))
    );
    setNotes(routine.notes || '');
    setSelectedRoutineId(routine.id);
    setSaveAsRoutine(false);
    setError(null);
  };

  useEffect(() => {
    if (isOpen) {
      setSaveAsRoutine(false);
      if (initialWorkout) {
        setName(initialWorkout.name || initialWorkout.workoutType || '');
        setDate(initialWorkout.date);
        setWorkoutType(initialWorkout.workoutType || 'strength');
        setDurationMinutes(initialWorkout.durationMinutes !== undefined ? initialWorkout.durationMinutes : '');
        setExercises(initialWorkout.exercises ? [...initialWorkout.exercises] : []);
        setNotes(initialWorkout.notes || '');
        setSelectedRoutineId(null);
      } else if (initialRoutine) {
        setDate(defaultDate || getTodayString());
        applyRoutine(initialRoutine);
      } else {
        setName('');
        setDate(defaultDate || getTodayString());
        setWorkoutType('strength');
        setDurationMinutes(45);
        setExercises([]);
        setNotes('');
        setSelectedRoutineId(null);
      }
      setError(null);
    }
  }, [isOpen, initialWorkout, initialRoutine, defaultDate]);

  const handleAddExercise = () => {
    const newEx: ExerciseEntry = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: '',
      sets: 3,
      reps: 10,
      weight: undefined,
      notes: '',
    };
    setExercises([...exercises, newEx]);
  };

  const handleUpdateExercise = (index: number, field: keyof ExerciseEntry, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please provide a workout name.');
      return;
    }

    if (!date) {
      setError('Please specify a workout date.');
      return;
    }

    if (durationMinutes !== '' && (isNaN(Number(durationMinutes)) || Number(durationMinutes) <= 0)) {
      setError('Duration must be a positive number of minutes.');
      return;
    }

    // Validate exercises
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      if (ex.name.trim() === '') {
        setError(`Please provide a name for exercise #${i + 1} or remove it.`);
        return;
      }
      if (ex.sets !== undefined && (isNaN(Number(ex.sets)) || Number(ex.sets) < 0 || !Number.isInteger(Number(ex.sets)))) {
        setError(`Exercise #${i + 1}: Sets must be a non-negative whole number.`);
        return;
      }
      if (ex.reps !== undefined && (isNaN(Number(ex.reps)) || Number(ex.reps) < 0 || !Number.isInteger(Number(ex.reps)))) {
        setError(`Exercise #${i + 1}: Reps must be a non-negative whole number.`);
        return;
      }
      if (ex.weight !== undefined && (isNaN(Number(ex.weight)) || Number(ex.weight) < 0)) {
        setError(`Exercise #${i + 1}: Weight load must be a non-negative number.`);
        return;
      }
    }

    const cleanedExercises = exercises.map(ex => ({
      ...ex,
      name: ex.name.trim(),
      sets: ex.sets !== undefined && ex.sets !== ('' as any) ? Number(ex.sets) : undefined,
      reps: ex.reps !== undefined && ex.reps !== ('' as any) ? Number(ex.reps) : undefined,
      weight: ex.weight !== undefined && ex.weight !== ('' as any) ? Number(ex.weight) : undefined,
      notes: ex.notes?.trim() || undefined,
    }));

    if (saveAsRoutine) {
      addWorkoutRoutine({
        name: name.trim(),
        workoutType,
        durationMinutes: durationMinutes !== '' ? Number(durationMinutes) : undefined,
        exercises: cleanedExercises.map((ex, idx) => ({
          ...ex,
          id: `r-ex-${Date.now()}-${idx}`,
        })),
        notes: notes.trim() || undefined,
      });
    }

    if (initialWorkout) {
      onSave({
        ...initialWorkout,
        name: name.trim(),
        date,
        workoutType,
        durationMinutes: durationMinutes !== '' ? Number(durationMinutes) : undefined,
        exercises: cleanedExercises,
        notes: notes.trim() || undefined,
      });
    } else {
      onSave({
        name: name.trim(),
        date,
        workoutType,
        durationMinutes: durationMinutes !== '' ? Number(durationMinutes) : undefined,
        exercises: cleanedExercises,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={initialWorkout ? 'Edit Workout Session' : 'Log Workout Session'}
      subtitle="Track your training split, sets, reps, load, or apply a saved routine."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
            {error}
          </div>
        )}

        {/* Saved Routines Quick Picker when logging new session */}
        {!initialWorkout && workoutRoutines.length > 0 && (
          <div className="p-3 rounded-xl bg-[#0B0B10] border border-[#292936] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#9B7BFF]">
                <Zap className="w-3.5 h-3.5" />
                <span>Saved Routines — Click to Apply</span>
              </div>
              <span className="text-[10px] text-[#8E8EA0] font-mono">
                {workoutRoutines.length} available
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {workoutRoutines.map(routine => {
                const isSelected = selectedRoutineId === routine.id;
                return (
                  <button
                    key={routine.id}
                    type="button"
                    onClick={() => applyRoutine(routine)}
                    className={`text-left px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#9B7BFF]/15 border-[#9B7BFF] text-[#F3F3F7]'
                        : 'bg-[#14141D] border-[#292936] hover:border-[#9B7BFF]/60 text-[#F3F3F7]'
                    }`}
                  >
                    <div className="font-semibold text-xs">{routine.name}</div>
                    <div className="text-[10px] text-[#8E8EA0] truncate max-w-[220px]">
                      {routine.exercises.length} exercises
                      {routine.exercises.length > 0
                        ? ` · ${routine.exercises.map(e => e.name).join(', ')}`
                        : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Row 1: Workout Name & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
              Workout Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Push Day, Pull Day, 5K Run"
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden font-mono"
              required
            />
          </div>
        </div>

        {/* Row 2: Type & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
              Training Type
            </label>
            <select
              value={workoutType}
              onChange={e => setWorkoutType(e.target.value)}
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden"
            >
              <option value="strength">Strength & Resistance</option>
              <option value="cardio">Cardio & Endurance</option>
              <option value="mobility">Mobility & Active Recovery</option>
              <option value="sports">Sports & Athletics</option>
              <option value="other">General Workout</option>
            </select>
          </div>

          <div>
            <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
              Duration (Minutes)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="600"
                value={durationMinutes}
                onChange={e => setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 45"
                className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden font-mono"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8EA0] text-[11px]">
                min
              </span>
            </div>
          </div>
        </div>

        {/* Exercises Section */}
        <div className="space-y-2 pt-2 border-t border-[#292936]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-[#43D9A3]" />
              <label className="text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold">
                Exercises & Sets ({exercises.length})
              </label>
            </div>
            <button
              type="button"
              onClick={handleAddExercise}
              className="inline-flex items-center gap-1 text-[11px] text-[#43D9A3] hover:text-[#5ef0be] font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Exercise</span>
            </button>
          </div>

          {exercises.length === 0 ? (
            <div className="p-3 bg-[#0B0B10] border border-[#292936] rounded-lg text-center text-[#8E8EA0] text-[11px]">
              No exercises added yet. Click &quot;Add Exercise&quot; or select a saved routine above.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {exercises.map((ex, idx) => (
                <div
                  key={ex.id || idx}
                  className="p-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#8E8EA0] w-4 shrink-0">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Exercise name (e.g. Push Up)"
                      value={ex.name}
                      onChange={e => handleUpdateExercise(idx, 'name', e.target.value)}
                      className="flex-1 bg-[#14141D] border border-[#292936] focus:border-[#43D9A3] rounded-md px-2.5 py-1 text-xs text-[#F3F3F7] focus:outline-hidden"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(idx)}
                      className="p-1 text-[#8E8EA0] hover:text-rose-400 hover:bg-rose-950/20 rounded-md transition-colors cursor-pointer"
                      title="Remove exercise"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-[10px] text-[#8E8EA0] block mb-0.5">Sets</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Sets"
                        value={ex.sets ?? ''}
                        onChange={e =>
                          handleUpdateExercise(idx, 'sets', e.target.value === '' ? undefined : Number(e.target.value))
                        }
                        className="w-full bg-[#14141D] border border-[#292936] rounded-md px-2 py-1 text-xs text-[#F3F3F7] focus:outline-hidden font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8E8EA0] block mb-0.5">Reps</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Reps"
                        value={ex.reps ?? ''}
                        onChange={e =>
                          handleUpdateExercise(idx, 'reps', e.target.value === '' ? undefined : Number(e.target.value))
                        }
                        className="w-full bg-[#14141D] border border-[#292936] rounded-md px-2 py-1 text-xs text-[#F3F3F7] focus:outline-hidden font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8E8EA0] block mb-0.5">Weight (kg)</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="kg"
                        value={ex.weight ?? ''}
                        onChange={e =>
                          handleUpdateExercise(idx, 'weight', e.target.value === '' ? undefined : Number(e.target.value))
                        }
                        className="w-full bg-[#14141D] border border-[#292936] rounded-md px-2 py-1 text-xs text-[#F3F3F7] focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overall Notes */}
        <div>
          <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
            Workout Notes & Observations (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Energy level 8/10, focused on slow eccentric control."
            className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden resize-none"
          />
        </div>

        {/* Save as Reusable Routine Toggle */}
        {!initialWorkout && (
          <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#0B0B10] border border-[#292936] cursor-pointer hover:border-[#9B7BFF]/40 transition-colors">
            <input
              type="checkbox"
              checked={saveAsRoutine}
              onChange={e => setSaveAsRoutine(e.target.checked)}
              className="rounded border-[#292936] bg-[#14141D] text-[#9B7BFF] focus:ring-0"
            />
            <BookmarkPlus className="w-3.5 h-3.5 text-[#9B7BFF] shrink-0" />
            <span className="text-xs text-[#F3F3F7]">
              Save this workout template as a reusable routine
            </span>
          </label>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#292936]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold bg-[#43D9A3] hover:bg-[#38c491] text-[#0B0B10] rounded-lg transition-colors cursor-pointer"
          >
            {initialWorkout ? 'Save Changes' : 'Log Workout'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
