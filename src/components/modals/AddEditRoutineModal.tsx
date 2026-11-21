import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { WorkoutRoutine, ExerciseEntry } from '../../types';
import { Plus, Trash2, Dumbbell } from 'lucide-react';

interface AddEditRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (routine: Omit<WorkoutRoutine, 'id' | 'createdAt' | 'updatedAt'> | WorkoutRoutine) => void;
  initialRoutine?: WorkoutRoutine | null;
}

export const AddEditRoutineModal: React.FC<AddEditRoutineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRoutine,
}) => {
  const [name, setName] = useState('');
  const [workoutType, setWorkoutType] = useState('strength');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(45);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialRoutine) {
        setName(initialRoutine.name || '');
        setWorkoutType(initialRoutine.workoutType || 'strength');
        setDurationMinutes(initialRoutine.durationMinutes !== undefined ? initialRoutine.durationMinutes : '');
        setExercises(
          initialRoutine.exercises.map(ex => ({
            ...ex,
          }))
        );
        setNotes(initialRoutine.notes || '');
      } else {
        setName('');
        setWorkoutType('strength');
        setDurationMinutes(40);
        setExercises([
          {
            id: `r-ex-${Date.now()}`,
            name: '',
            sets: 3,
            reps: 10,
            weight: undefined,
          },
        ]);
        setNotes('');
      }
      setError(null);
    }
  }, [isOpen, initialRoutine]);

  const handleAddExercise = () => {
    setExercises(prev => [
      ...prev,
      {
        id: `r-ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: '',
        sets: 3,
        reps: 10,
        weight: undefined,
      },
    ]);
  };

  const handleUpdateExercise = (index: number, field: keyof ExerciseEntry, value: any) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter a routine name (e.g. Push Day).');
      return;
    }

    if (exercises.length === 0) {
      setError('Add at least one exercise to save a routine.');
      return;
    }

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      if (!ex.name.trim()) {
        setError(`Please provide a name for exercise #${i + 1} or remove it.`);
        return;
      }
    }

    const cleanedExercises: ExerciseEntry[] = exercises.map(ex => ({
      ...ex,
      name: ex.name.trim(),
      sets: ex.sets !== undefined && ex.sets !== ('' as any) ? Number(ex.sets) : undefined,
      reps: ex.reps !== undefined && ex.reps !== ('' as any) ? Number(ex.reps) : undefined,
      weight: ex.weight !== undefined && ex.weight !== ('' as any) ? Number(ex.weight) : undefined,
      notes: ex.notes?.trim() || undefined,
    }));

    if (initialRoutine) {
      onSave({
        ...initialRoutine,
        name: name.trim(),
        workoutType,
        durationMinutes: durationMinutes !== '' ? Number(durationMinutes) : undefined,
        exercises: cleanedExercises,
        notes: notes.trim() || undefined,
      });
    } else {
      onSave({
        name: name.trim(),
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
      title={initialRoutine ? 'Edit Workout Routine' : 'Create Workout Routine'}
      subtitle="Save reusable splits and exercise templates for one-click workout logging."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
              Routine Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Push Day"
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden"
              required
            />
          </div>

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
              <option value="mobility">Mobility & Recovery</option>
              <option value="sports">Sports & Athletics</option>
              <option value="other">General Workout</option>
            </select>
          </div>

          <div>
            <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
              Target Duration (min)
            </label>
            <input
              type="number"
              min="1"
              max="600"
              value={durationMinutes}
              onChange={e => setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 40"
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] font-mono focus:outline-hidden"
            />
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-2 pt-2 border-t border-[#292936]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-[#43D9A3]" />
              <label className="text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold">
                Exercises ({exercises.length})
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

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
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
                    placeholder="e.g. Push Up, Tricep Dips, Lateral Raises"
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
                      placeholder="3"
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
                      placeholder="10"
                      value={ex.reps ?? ''}
                      onChange={e =>
                        handleUpdateExercise(idx, 'reps', e.target.value === '' ? undefined : Number(e.target.value))
                      }
                      className="w-full bg-[#14141D] border border-[#292936] rounded-md px-2 py-1 text-xs text-[#F3F3F7] focus:outline-hidden font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E8EA0] block mb-0.5">Load (kg)</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="kg (opt)"
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
        </div>

        <div>
          <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
            Routine Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Rest intervals, progressive overload target..."
            className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden resize-none"
          />
        </div>

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
            className="px-4 py-2 text-xs font-semibold text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer"
          >
            {initialRoutine ? 'Save Routine' : 'Create Routine'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
