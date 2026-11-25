import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { getTodayString, getRelativeDateLabel, formatShortDate } from '../../utils/dates';
import { AddEditTaskModal } from '../modals/AddEditTaskModal';
import { ConfirmDialog } from '../modals/ConfirmDialog';
import {
  Check,
  Edit2,
  Trash2,
  Clock,
} from 'lucide-react';

export const TasksAndPlansSection: React.FC = () => {
  const { tasks, toggleTaskComplete, deleteTask, updateTask } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const today = getTodayString();

  // Filter tasks for today
  const todayTasks = useMemo(() => {
    return tasks.filter(t => t.dueDate === today);
  }, [tasks, today]);

  // Filter upcoming tasks: due strictly after today, and not completed
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(t => t.dueDate > today && !t.completed)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks, today]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSave = (taskData: Omit<Task, 'id' | 'createdAt'> | Task) => {
    if ('id' in taskData) {
      updateTask(taskData as Task);
    }
  };

  const completedTodayCount = todayTasks.filter(t => t.completed).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* LEFT CARD — Today's Tasks */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[#292936]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#F3F3F7]">Today's Tasks</h3>
                {todayTasks.length > 0 && (
                  <span className="text-xs font-mono text-[#8E8EA0] tabular-nums">
                    ({completedTodayCount}/{todayTasks.length})
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8E8EA0] mt-0.5">High-priority targets for today</p>
            </div>
          </div>

          {/* Task List */}
          {todayTasks.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] mb-2.5">
                <Check className="w-5 h-5 text-[#9B7BFF]" />
              </div>
              <p className="text-xs font-medium text-[#F3F3F7]">All clear for today</p>
              <p className="text-xs text-[#8E8EA0] max-w-xs mt-1">
                No tasks scheduled for today.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map(task => {
                const priorityBadge = getPriorityBadge(task.priority);

                return (
                  <div
                    key={task.id}
                    className={`flex items-start justify-between p-3 rounded-lg border transition-all group ${
                      task.completed
                        ? 'bg-[#0B0B10]/40 border-[#292936]/50 opacity-65'
                        : 'bg-[#0B0B10] border-[#292936] hover:border-[#3B3B4E]'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
                      {/* Custom Checkbox */}
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          task.completed
                            ? 'bg-[#9B7BFF] border-[#9B7BFF] text-white'
                            : 'bg-[#14141D] border-[#3B3B4E] hover:border-[#9B7BFF] text-transparent'
                        }`}
                        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-medium ${
                              task.completed
                                ? 'line-through text-[#8E8EA0]'
                                : 'text-[#F3F3F7]'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>

                        {/* Metadata row without pills */}
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-[#8E8EA0]">
                          <span className={priorityBadge.colorClass}>{priorityBadge.label}</span>
                          {task.category && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{task.category}</span>
                            </>
                          )}
                          {task.notes && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="truncate max-w-[200px]">{task.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-1.5 text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] rounded-md transition-colors cursor-pointer"
                        title="Edit task"
                        aria-label="Edit task"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setTaskToDelete(task.id)}
                        className="p-1.5 text-[#8E8EA0] hover:text-red-400 hover:bg-[#1B1B26] rounded-md transition-colors cursor-pointer"
                        title="Delete task"
                        aria-label="Delete task"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT CARD — Upcoming Plans */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-5 h-[560px] min-h-0 overflow-hidden flex flex-col">
        <div className="flex flex-col flex-1 min-h-0">
  {/* Header */}
          <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[#292936] shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#F3F3F7]">Upcoming Plans</h3>
                {upcomingTasks.length > 0 && (
                  <span className="text-xs font-mono text-[#8E8EA0] tabular-nums">
                    ({upcomingTasks.length})
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8E8EA0] mt-0.5">Chronological milestones and targets</p>
            </div>
          </div>

          {/* Upcoming List */}
          {upcomingTasks.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] mb-2.5">
                <Clock className="w-5 h-5 text-[#9B7BFF]" />
              </div>
              <p className="text-xs font-medium text-[#F3F3F7]">No upcoming plans</p>
              <p className="text-xs text-[#8E8EA0] max-w-xs mt-1">
                Schedule upcoming study sessions or milestones in the planner.
              </p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-2
                [scrollbar-width:thin]
                [scrollbar-color:#3B3B4E_transparent]">
              {upcomingTasks.map(plan => {
                const relativeLabel = getRelativeDateLabel(plan.dueDate, today);
                const priorityBadge = getPriorityBadge(plan.priority);

                return (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-3 bg-[#0B0B10] border border-[#292936] hover:border-[#3B3B4E] rounded-lg transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                      {/* Date Badge */}
                      <div className="w-14 text-center py-1 px-1.5 rounded-md bg-[#1B1B26] border border-[#292936] shrink-0 font-mono">
                        <span className="text-[10px] text-[#9B7BFF] font-semibold block uppercase">
                          {relativeLabel}
                        </span>
                        <span className="text-[10px] text-[#8E8EA0] block">
                          {formatShortDate(plan.dueDate).split(',')[0]}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-medium text-[#F3F3F7] block truncate">
                          {plan.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#8E8EA0]">
                          <span className={priorityBadge.colorClass}>{priorityBadge.label}</span>
                          {plan.category && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{plan.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="p-1.5 text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] rounded-md transition-colors cursor-pointer"
                        title="Edit plan"
                        aria-label="Edit plan"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setTaskToDelete(plan.id)}
                        className="p-1.5 text-[#8E8EA0] hover:text-red-400 hover:bg-[#1B1B26] rounded-md transition-colors cursor-pointer"
                        title="Delete plan"
                        aria-label="Delete plan"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AddEditTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialTask={editingTask}
      />

      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) deleteTask(taskToDelete);
        }}
        title="Delete Task?"
        description="Are you sure you want to remove this item from your schedule? This action cannot be undone."
        confirmLabel="Delete Item"
        isDestructive
      />
    </div>
  );
};

function getPriorityBadge(priority: 'high' | 'medium' | 'low') {
  switch (priority) {
    case 'high':
      return { label: 'High Priority', colorClass: 'text-red-400' };
    case 'medium':
      return { label: 'Medium Priority', colorClass: 'text-amber-400' };
    case 'low':
      return { label: 'Low Priority', colorClass: 'text-slate-400' };
  }
}
