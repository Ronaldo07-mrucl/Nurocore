import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Priority } from '../../types';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Trash2,
} from 'lucide-react';
import {
  getTodayString,
  formatWeekRange,
  getWeekdayShort,
  getDayOfMonth,
} from '../../utils/dates';
import { ConfirmDialog } from '../modals/ConfirmDialog';

interface WeeklyPlannerSectionProps {
  weekDates: string[]; // 7 dates: Monday through Sunday
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  isCurrentWeek: boolean;
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'high', label: 'H' },
  { value: 'medium', label: 'M' },
  { value: 'low', label: 'L' },
];

export const WeeklyPlannerSection: React.FC<WeeklyPlannerSectionProps> = ({
  weekDates,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  isCurrentWeek,
}) => {
  const { tasks, addTask, toggleTaskComplete, updateTask, deleteTask, rescheduleTask } = useApp();
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  // Inline task creation state
  const [addingForDate, setAddingForDate] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const newTaskInputRef = useRef<HTMLInputElement | null>(null);

  // Inline task rename state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const editTaskInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (addingForDate && newTaskInputRef.current) {
      newTaskInputRef.current.focus();
    }
  }, [addingForDate]);

  useEffect(() => {
    if (editingTaskId && editTaskInputRef.current) {
      editTaskInputRef.current.focus();
      editTaskInputRef.current.select();
    }
  }, [editingTaskId]);

  const todayStr = getTodayString();
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const handleDeleteConfirm = () => {
    if (deletingTaskId) {
      deleteTask(deletingTaskId);
      setDeletingTaskId(null);
    }
  };

  const handleOpenInlineAdd = (dayDate: string) => {
    if (editingTaskId) {
      setEditingTaskId(null);
    }
    setAddingForDate(dayDate);
    setNewTaskTitle('');
    setNewTaskPriority('medium');
  };

  const handleCommitInlineAdd = (dayDate: string) => {
    const trimmed = newTaskTitle.trim();
    if (trimmed) {
      addTask({
        title: trimmed,
        dueDate: dayDate,
        priority: newTaskPriority,
        status: 'not_started',
        completed: false,
      });
    }
    setAddingForDate(null);
    setNewTaskTitle('');
  };

  const handleStartInlineRename = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setAddingForDate(null);
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const handleCommitInlineRename = (task: Task) => {
    const trimmed = editingTitle.trim();
    if (trimmed && trimmed !== task.title) {
      updateTask({
        ...task,
        title: trimmed,
      });
    }
    setEditingTaskId(null);
  };

  const handlePriorityChange = (e: React.MouseEvent, task: Task, priority: Priority) => {
    e.stopPropagation();
    if (task.priority === priority) return;
    updateTask({
      ...task,
      priority,
    });
  };

  const getTilePriorityClasses = (priority: Priority, completed: boolean) => {
    const baseOpacity = completed ? 'opacity-65' : '';
    switch (priority) {
      case 'high':
        return `bg-rose-500/15 border-rose-500/45 hover:border-rose-400/80 ${baseOpacity}`;
      case 'medium':
        return `bg-amber-500/15 border-amber-500/45 hover:border-amber-400/80 ${baseOpacity}`;
      case 'low':
      default:
        return `bg-emerald-500/15 border-emerald-500/45 hover:border-emerald-400/80 ${baseOpacity}`;
    }
  };

  const getPriorityButtonClasses = (option: Priority, isActive: boolean) => {
    if (option === 'high') {
      return isActive
        ? 'bg-rose-500 text-white border-rose-400 shadow-xs'
        : 'bg-[#0B0B10]/50 text-rose-300/70 border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-200';
    }
    if (option === 'medium') {
      return isActive
        ? 'bg-amber-500 text-[#0B0B10] border-amber-400 shadow-xs'
        : 'bg-[#0B0B10]/50 text-amber-300/70 border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-200';
    }
    return isActive
      ? 'bg-emerald-500 text-[#0B0B10] border-emerald-400 shadow-xs'
      : 'bg-[#0B0B10]/50 text-emerald-300/70 border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-200';
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    if (editingTaskId === taskId) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverDate(null);
  };

  const handleColumnDragOver = (e: React.DragEvent<HTMLDivElement>, dayDate: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDate !== dayDate) {
      setDragOverDate(dayDate);
    }
  };

  const handleColumnDragLeave = (e: React.DragEvent<HTMLDivElement>, dayDate: string) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverDate(prev => (prev === dayDate ? null : prev));
    }
  };

  const handleColumnDrop = (e: React.DragEvent<HTMLDivElement>, dayDate: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      rescheduleTask(taskId, dayDate);
    }
    setDraggedTaskId(null);
    setDragOverDate(null);
  };

  return (
    <section className="bg-[#14141D] border border-[#292936] rounded-xl p-5 shadow-sm space-y-4">
      {/* Top Header: Title & Week Navigator */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-3 border-b border-[#292936]">
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#43D9A3]/10 text-[#43D9A3] flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#F3F3F7]">
              Weekly Execution Planner
            </h2>
            <p className="text-xs text-[#8E8EA0]">
              Click any day space to type a task · Click task name to rename · Drag tiles to reschedule
            </p>
          </div>
        </div>

        {/* Week Navigator with "Today" directly below the dates */}
        <div className="flex flex-col items-center self-start md:self-auto gap-1.5">
          <div className="flex items-center bg-[#0B0B10] border border-[#292936] rounded-xl p-1 shadow-sm">
            <button
              type="button"
              onClick={onPrevWeek}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] transition-colors cursor-pointer"
              title="Previous Week"
              aria-label="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 text-xs font-medium text-[#F3F3F7] whitespace-nowrap min-w-[140px] text-center">
              {formatWeekRange(weekStart, weekEnd)}
            </span>

            <button
              type="button"
              onClick={onNextWeek}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] transition-colors cursor-pointer"
              title="Next Week"
              aria-label="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isCurrentWeek && (
            <button
              type="button"
              onClick={onCurrentWeek}
              className="px-3 py-0.5 text-[11px] font-semibold text-[#43D9A3] bg-[#43D9A3]/10 hover:bg-[#43D9A3]/20 rounded-md border border-[#43D9A3]/30 transition-colors cursor-pointer"
              title="Jump to current week"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* 7-Day Columns Planner */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 min-w-[700px] md:min-w-0">
          {weekDates.map(dayDate => {
            const isToday = dayDate === todayStr;
            const isDropTarget = dragOverDate === dayDate;
            const isAddingHere = addingForDate === dayDate;
            const dayTasks = tasks.filter(t => t.dueDate === dayDate);
            const dayCompletedCount = dayTasks.filter(t => t.completed).length;
            const dayTotalCount = dayTasks.length;

            return (
              <div
                key={dayDate}
                onDragOver={e => handleColumnDragOver(e, dayDate)}
                onDragLeave={e => handleColumnDragLeave(e, dayDate)}
                onDrop={e => handleColumnDrop(e, dayDate)}
                className={`flex flex-col rounded-xl border transition-all ${
                  isDropTarget
                    ? 'bg-[#9B7BFF]/10 border-[#9B7BFF] ring-2 ring-[#9B7BFF]/40'
                    : isToday
                    ? 'bg-[#14141D] border-[#9B7BFF]/50 shadow-md shadow-[#9B7BFF]/5'
                    : 'bg-[#111119] border-[#292936]'
                }`}
              >
                {/* Column Day Header */}
                <div
                  className={`p-3 border-b flex items-center justify-between transition-colors ${
                    isToday
                      ? 'border-[#9B7BFF]/30 bg-[#9B7BFF]/5'
                      : 'border-[#292936] bg-[#14141D]/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#F3F3F7]">
                        {getWeekdayShort(dayDate)}
                      </span>
                      <span className="text-xs font-mono text-[#8E8EA0]">
                        {getDayOfMonth(dayDate)}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-[#9B7BFF] text-white">
                          Today
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#8E8EA0] block mt-0.5">
                      {dayTotalCount > 0 ? `${dayCompletedCount}/${dayTotalCount} done` : '0 tasks'}
                    </span>
                  </div>
                </div>

                {/* Clickable Day Space & Task List */}
                <div
                  onClick={() => handleOpenInlineAdd(dayDate)}
                  className="p-2 space-y-2 flex-1 min-h-[150px] flex flex-col justify-start cursor-pointer hover:bg-[#171722]/60 transition-colors rounded-b-xl"
                  title="Click space to add task"
                >
                  {dayTasks.length === 0 && !isAddingHere ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-3 border border-dashed border-[#292936]/60 hover:border-[#9B7BFF]/40 rounded-lg bg-[#0B0B10]/20 min-h-[100px] transition-colors">
                      <p className="text-[11px] text-[#8E8EA0]">
                        No tasks scheduled
                      </p>
                      <span className="mt-1 text-[10px] text-[#8E8EA0]/70">
                        Click space to add
                      </span>
                    </div>
                  ) : (
                    dayTasks.map(task => {
                      const isEditingThis = editingTaskId === task.id;
                      return (
                        <div
                          key={task.id}
                          draggable={!isEditingThis}
                          onDragStart={e => handleDragStart(e, task.id)}
                          onDragEnd={handleDragEnd}
                          onClick={e => e.stopPropagation()}
                          className={`p-2.5 rounded-lg border text-left transition-all group relative flex flex-col justify-between ${
                            isEditingThis ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                          } ${getTilePriorityClasses(
                            task.priority,
                            task.completed
                          )} ${draggedTaskId === task.id ? 'opacity-40 scale-95' : ''}`}
                        >
                          {/* Top Bar: Actionable Priority Selector (H : M : L) & Delete */}
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <div className="flex items-center gap-1" role="group" aria-label="Task priority">
                              {PRIORITY_OPTIONS.map(opt => {
                                const isActive = task.priority === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={e => handlePriorityChange(e, task, opt.value)}
                                    className={`w-5 h-5 rounded text-[10px] font-bold border transition-all flex items-center justify-center cursor-pointer ${getPriorityButtonClasses(
                                      opt.value,
                                      isActive
                                    )}`}
                                    title={`Set ${opt.value} priority`}
                                    aria-label={`Set ${opt.value} priority`}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>

                            <div className="flex items-center gap-0.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  setDeletingTaskId(task.id);
                                }}
                                className="p-1 text-[#C5C5D2] hover:text-red-300 hover:bg-[#0B0B10]/50 rounded transition-colors cursor-pointer"
                                title="Delete task"
                                aria-label="Delete task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Title & Checkbox (Click title to rename inline) */}
                          <div className="flex items-start gap-2">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                toggleTaskComplete(task.id);
                              }}
                              className="mt-0.5 shrink-0 text-[#C5C5D2] hover:text-[#43D9A3] transition-colors focus:outline-none cursor-pointer"
                              title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                            >
                              {task.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-[#43D9A3]" />
                              ) : (
                                <Circle className="w-4 h-4 text-[#C5C5D2] hover:text-[#F3F3F7]" />
                              )}
                            </button>

                            {isEditingThis ? (
                              <input
                                ref={editTaskInputRef}
                                type="text"
                                value={editingTitle}
                                onChange={e => setEditingTitle(e.target.value)}
                                onClick={e => e.stopPropagation()}
                                onBlur={() => handleCommitInlineRename(task)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleCommitInlineRename(task);
                                  } else if (e.key === 'Escape') {
                                    e.preventDefault();
                                    setEditingTaskId(null);
                                  }
                                }}
                                className="w-full px-1.5 py-0.5 bg-[#0B0B10]/80 border border-[#9B7BFF] rounded text-xs font-medium text-[#F3F3F7] focus:outline-hidden"
                              />
                            ) : (
                              <span
                                onClick={e => handleStartInlineRename(e, task)}
                                className={`text-xs font-medium leading-snug line-clamp-3 cursor-text hover:underline decoration-[#8E8EA0]/50 underline-offset-2 flex-1 ${
                                  task.completed
                                    ? 'line-through text-[#8E8EA0]'
                                    : 'text-[#F3F3F7]'
                                }`}
                                title="Click name to rename"
                              >
                                {task.title}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Inline Draft Tile when clicking day space */}
                  {isAddingHere && (
                    <div
                      onClick={e => e.stopPropagation()}
                      className={`p-2.5 rounded-lg border text-left transition-all flex flex-col gap-2 ${getTilePriorityClasses(
                        newTaskPriority,
                        false
                      )}`}
                    >
                      <div className="flex items-center gap-1" role="group" aria-label="New task priority">
                        {PRIORITY_OPTIONS.map(opt => {
                          const isActive = newTaskPriority === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onMouseDown={e => e.preventDefault()}
                              onClick={e => {
                                e.stopPropagation();
                                setNewTaskPriority(opt.value);
                              }}
                              className={`w-5 h-5 rounded text-[10px] font-bold border transition-all flex items-center justify-center cursor-pointer ${getPriorityButtonClasses(
                                opt.value,
                                isActive
                              )}`}
                              title={`Set ${opt.value} priority`}
                              aria-label={`Set ${opt.value} priority`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>

                      <input
                        ref={newTaskInputRef}
                        type="text"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        onBlur={() => handleCommitInlineAdd(dayDate)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCommitInlineAdd(dayDate);
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            setAddingForDate(null);
                            setNewTaskTitle('');
                          }
                        }}
                        placeholder="Enter task..."
                        className="w-full px-2 py-1 bg-[#0B0B10]/80 border border-[#292936] focus:border-[#9B7BFF] rounded text-xs font-medium text-[#F3F3F7] placeholder:text-[#8E8EA0]/70 focus:outline-hidden"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingTaskId)}
        onClose={() => setDeletingTaskId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        description="Are you sure you want to delete this task? This will remove it from both your weekly scheduler and your dashboard."
        confirmLabel="Delete Task"
        isDestructive
      />
    </section>
  );
};
