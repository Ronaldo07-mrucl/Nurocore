import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkoutSession, WorkoutRoutine } from '../../types';
import { formatShortDate, getTodayString } from '../../utils/dates';
import { getWorkoutTypeStyle } from '../../utils/fitness';
import { AddEditWorkoutModal } from '../modals/AddEditWorkoutModal';
import { AddEditRoutineModal } from '../modals/AddEditRoutineModal';
import { ConfirmDialog } from '../modals/ConfirmDialog';
import {
  Dumbbell,
  Plus,
  Clock,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Zap,
  BookmarkPlus,
  Play,
} from 'lucide-react';

interface WorkoutHistorySectionProps {
  onAddWorkout: () => void;
}

export const WorkoutHistorySection: React.FC<WorkoutHistorySectionProps> = ({ onAddWorkout }) => {
  const {
    workouts,
    workoutRoutines,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    addWorkoutRoutine,
    updateWorkoutRoutine,
    deleteWorkoutRoutine,
  } = useApp();

  const todayStr = getTodayString();

  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutSession | null>(null);
  const [workoutToDelete, setWorkoutToDelete] = useState<WorkoutSession | null>(null);

  // Routine creation/editing & quick-log state
  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null);
  const [routineToDelete, setRoutineToDelete] = useState<WorkoutRoutine | null>(null);
  const [quickLogRoutine, setQuickLogRoutine] = useState<WorkoutRoutine | null>(null);

  // Only today's workout sessions, sorted newest first
  const todaysWorkouts = useMemo(() => {
    return [...workouts]
      .filter(w => w.date === todayStr)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [workouts, todayStr]);

  const toggleExpand = (id: string) => {
    setExpandedWorkoutId(curr => (curr === id ? null : id));
  };

  const handleSaveSessionAsRoutine = (w: WorkoutSession) => {
    addWorkoutRoutine({
      name: w.name || 'Saved Routine',
      workoutType: w.workoutType || 'strength',
      durationMinutes: w.durationMinutes,
      exercises: (w.exercises || []).map((ex, idx) => ({
        ...ex,
        id: `r-ex-${Date.now()}-${idx}`,
      })),
      notes: w.notes,
    });
  };

  return (
    <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#292936] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F3F3F7]">Today&apos;s Workout Sessions</h3>
            <span className="text-xs font-mono text-[#8E8EA0] tabular-nums">
              ({todaysWorkouts.length})
            </span>
          </div>
          <p className="text-xs text-[#8E8EA0] mt-0.5 font-mono">
            {formatShortDate(todayStr)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditingRoutine(null);
              setRoutineModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F3F3F7] bg-[#0B0B10] hover:bg-[#1B1B26] border border-[#292936] rounded-lg transition-colors cursor-pointer"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-[#9B7BFF]" />
            <span>Save Routine</span>
          </button>

          <button
            onClick={onAddWorkout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B0B10] bg-[#43D9A3] hover:bg-[#39c792] rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Session</span>
          </button>
        </div>
      </div>

      {/* Saved Workout Routines Strip */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#9B7BFF]">
            <Zap className="w-3.5 h-3.5" />
            <span>Saved Workout Routines ({workoutRoutines.length})</span>
          </div>
        </div>

        {workoutRoutines.length === 0 ? (
          <div className="p-3 bg-[#0B0B10] border border-[#292936] rounded-xl flex items-center justify-between gap-3">
            <span className="text-xs text-[#8E8EA0]">
              Save reusable splits (e.g. Push Day: 3×10 Push Up, Tricep Dips, Lateral Raises) to log them in one click.
            </span>
            <button
              onClick={() => {
                setEditingRoutine(null);
                setRoutineModalOpen(true);
              }}
              className="px-2.5 py-1 text-xs font-medium text-[#9B7BFF] hover:text-white bg-[#9B7BFF]/10 hover:bg-[#9B7BFF] border border-[#9B7BFF]/30 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              + Create Routine
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {workoutRoutines.map(routine => {
              const style = getWorkoutTypeStyle(routine.workoutType);
              return (
                <div
                  key={routine.id}
                  className="p-3 bg-[#0B0B10] border border-[#292936] hover:border-[#9B7BFF]/50 rounded-xl flex flex-col justify-between gap-2.5 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[#F3F3F7]">{routine.name}</span>
                          <span
                            className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-sm border ${style.badgeClass}`}
                          >
                            {style.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingRoutine(routine);
                            setRoutineModalOpen(true);
                          }}
                          className="p-1 text-[#8E8EA0] hover:text-[#F3F3F7] rounded transition-colors cursor-pointer"
                          title="Edit routine"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setRoutineToDelete(routine)}
                          className="p-1 text-[#8E8EA0] hover:text-rose-400 rounded transition-colors cursor-pointer"
                          title="Delete routine"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#8E8EA0] space-y-0.5">
                      {routine.exercises.slice(0, 4).map((ex, idx) => (
                        <div key={ex.id || idx} className="flex items-center justify-between font-mono">
                          <span className="truncate text-[#F3F3F7]/90">{ex.name}</span>
                          <span className="text-[#8E8EA0] shrink-0 ml-2">
                            {ex.sets ?? '—'}×{ex.reps ?? '—'}
                            {ex.weight ? ` · ${ex.weight}kg` : ''}
                          </span>
                        </div>
                      ))}
                      {routine.exercises.length > 4 && (
                        <div className="text-[10px] text-[#8E8EA0] italic">
                          +{routine.exercises.length - 4} more exercises
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setQuickLogRoutine(routine)}
                    className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-[#0B0B10] bg-[#43D9A3] hover:bg-[#39c792] rounded-lg transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Log Today</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Today's Sessions List */}
      {todaysWorkouts.length === 0 ? (
        <div className="py-10 bg-[#0B0B10] border border-[#292936] rounded-xl text-center flex flex-col items-center justify-center p-6">
          <div className="w-10 h-10 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] mb-2.5">
            <Dumbbell className="w-5 h-5 text-[#43D9A3]" />
          </div>
          <p className="text-xs font-semibold text-[#F3F3F7]">No workouts logged today</p>
          <p className="text-xs text-[#8E8EA0] max-w-sm mt-1 mb-3">
            Log a session from scratch or click &quot;Log Today&quot; on any saved routine above.
          </p>
          <button
            onClick={onAddWorkout}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#0B0B10] bg-[#43D9A3] hover:bg-[#39c792] rounded-lg transition-colors cursor-pointer"
          >
            + Log Today&apos;s Workout
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {todaysWorkouts.map(w => {
            const style = getWorkoutTypeStyle(w.workoutType);
            const isExpanded = expandedWorkoutId === w.id;
            const exCount = w.exercises?.length || 0;

            return (
              <div
                key={w.id}
                className="p-4 bg-[#0B0B10] border border-[#292936] hover:border-[#43D9A3]/40 rounded-xl transition-all"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#292936]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-[#8E8EA0] px-2 py-0.5 rounded-sm bg-[#14141D] border border-[#292936]">
                      {formatShortDate(w.date)}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-sm border ${style.badgeClass}`}
                    >
                      {style.label}
                    </span>
                    <h4
                      onClick={() => toggleExpand(w.id)}
                      className="font-semibold text-sm text-[#F3F3F7] hover:text-[#43D9A3] transition-colors cursor-pointer truncate"
                    >
                      {w.name || w.workoutType}
                    </h4>
                  </div>

                  {/* Actions & Metrics */}
                  <div className="flex items-center gap-2 shrink-0">
                    {w.durationMinutes && (
                      <div className="flex items-center gap-1 text-[11px] font-mono text-[#8E8EA0]">
                        <Clock className="w-3 h-3" />
                        <span>{w.durationMinutes} min</span>
                      </div>
                    )}

                    <div className="h-4 w-px bg-[#292936]" />

                    {exCount > 0 && (
                      <button
                        onClick={() => handleSaveSessionAsRoutine(w)}
                        className="p-1 text-[#8E8EA0] hover:text-[#9B7BFF] hover:bg-[#14141D] rounded-md transition-colors cursor-pointer"
                        title="Save as reusable routine"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => setEditingWorkout(w)}
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

                    <button
                      onClick={() => toggleExpand(w.id)}
                      className="p-1 text-[#8E8EA0] hover:text-[#F3F3F7] rounded-md transition-colors cursor-pointer"
                      title={isExpanded ? 'Collapse' : 'Expand exercises'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Exercises summary line / notes */}
                <div className="pt-2 text-xs">
                  {exCount > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-[#8E8EA0] font-medium">
                        {exCount} {exCount === 1 ? 'exercise' : 'exercises'}:
                      </span>
                      <span className="text-[11px] text-[#F3F3F7] truncate max-w-lg">
                        {w.exercises!.map(e => e.name).join(', ')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#8E8EA0] italic">
                      General session (no exercise breakdown logged)
                    </span>
                  )}

                  {w.notes && (
                    <p className="text-[11px] text-[#8E8EA0] mt-1.5 leading-snug line-clamp-2">
                      {w.notes}
                    </p>
                  )}
                </div>

                {/* Expanded Detailed Exercise View */}
                {isExpanded && w.exercises && w.exercises.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#292936] space-y-2">
                    <span className="text-[10px] text-[#8E8EA0] uppercase tracking-wider font-semibold block">
                      Exercise Breakdown:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {w.exercises.map((ex, idx) => (
                        <div
                          key={ex.id || idx}
                          className="p-2.5 rounded-lg bg-[#14141D] border border-[#292936] text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between font-semibold text-[#F3F3F7]">
                            <span className="truncate">{ex.name}</span>
                            <span className="font-mono text-[#43D9A3] shrink-0">
                              {ex.weight !== undefined ? `@${ex.weight}kg` : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[#8E8EA0] font-mono text-[10px]">
                            {ex.sets && <span>{ex.sets} sets</span>}
                            {ex.reps && <span>· {ex.reps} reps</span>}
                          </div>
                          {ex.notes && (
                            <p className="text-[10px] text-[#8E8EA0] italic pt-0.5">{ex.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Workout Modal */}
      <AddEditWorkoutModal
        isOpen={Boolean(editingWorkout)}
        onClose={() => setEditingWorkout(null)}
        onSave={w => {
          updateWorkout(w as WorkoutSession);
          setEditingWorkout(null);
        }}
        initialWorkout={editingWorkout}
      />

      {/* Quick Log from Routine Modal */}
      <AddEditWorkoutModal
        isOpen={Boolean(quickLogRoutine)}
        onClose={() => setQuickLogRoutine(null)}
        onSave={w => {
          if (!('id' in w)) {
            addWorkout(w);
          }
          setQuickLogRoutine(null);
        }}
        initialRoutine={quickLogRoutine}
        defaultDate={todayStr}
      />

      {/* Create / Edit Routine Modal */}
      <AddEditRoutineModal
        isOpen={routineModalOpen}
        onClose={() => {
          setRoutineModalOpen(false);
          setEditingRoutine(null);
        }}
        onSave={r => {
          if ('id' in r) {
            updateWorkoutRoutine(r as WorkoutRoutine);
          } else {
            addWorkoutRoutine(r);
          }
        }}
        initialRoutine={editingRoutine}
      />

      {/* Delete Workout Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(workoutToDelete)}
        onClose={() => setWorkoutToDelete(null)}
        onConfirm={() => {
          if (workoutToDelete) {
            deleteWorkout(workoutToDelete.id);
            setWorkoutToDelete(null);
          }
        }}
        title="Delete Workout Session?"
        description={`Are you sure you want to delete "${workoutToDelete?.name || 'Workout'}"?`}
        confirmLabel="Delete Workout"
        isDestructive
      />

      {/* Delete Routine Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(routineToDelete)}
        onClose={() => setRoutineToDelete(null)}
        onConfirm={() => {
          if (routineToDelete) {
            deleteWorkoutRoutine(routineToDelete.id);
            setRoutineToDelete(null);
          }
        }}
        title="Delete Saved Routine?"
        description={`Are you sure you want to delete the routine "${routineToDelete?.name || ''}"?`}
        confirmLabel="Delete Routine"
        isDestructive
      />
    </div>
  );
};
