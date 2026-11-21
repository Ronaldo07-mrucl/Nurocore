import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { Task, Priority, TaskStatus } from '../../types';
import { formatLongDate, getTodayString } from '../../utils/dates';

interface AddEditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt'> | Task) => void;
  initialTask?: Task | null;
  defaultDate?: string;
  minimalMode?: boolean;
}

const PRIORITY_CHOICES: {
  value: Priority;
  shortLabel: string;
  label: string;
  activeClass: string;
  idleClass: string;
}[] = [
  {
    value: 'high',
    shortLabel: 'H',
    label: 'High',
    activeClass: 'bg-rose-500/25 border-rose-500 text-rose-200 ring-1 ring-rose-500/40',
    idleClass: 'bg-[#0B0B10] border-[#292936] text-[#8E8EA0] hover:border-rose-500/40 hover:text-rose-300',
  },
  {
    value: 'medium',
    shortLabel: 'M',
    label: 'Medium',
    activeClass: 'bg-amber-500/25 border-amber-500 text-amber-200 ring-1 ring-amber-500/40',
    idleClass: 'bg-[#0B0B10] border-[#292936] text-[#8E8EA0] hover:border-amber-500/40 hover:text-amber-300',
  },
  {
    value: 'low',
    shortLabel: 'L',
    label: 'Low',
    activeClass: 'bg-emerald-500/25 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40',
    idleClass: 'bg-[#0B0B10] border-[#292936] text-[#8E8EA0] hover:border-emerald-500/40 hover:text-emerald-300',
  },
];

export const AddEditTaskModal: React.FC<AddEditTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  defaultDate,
  minimalMode = false,
}) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('not_started');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title);
        setDueDate(initialTask.dueDate);
        setPriority(initialTask.priority);
        setStatus(initialTask.status);
        setCategory(initialTask.category || '');
        setNotes(initialTask.notes || '');
      } else {
        setTitle('');
        setDueDate(defaultDate || getTodayString());
        setPriority('medium');
        setStatus('not_started');
        setCategory('');
        setNotes('');
      }
      setError(null);
    }
  }, [isOpen, initialTask, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }
    if (!dueDate) {
      setError('Please select a due date.');
      return;
    }

    const completed = status === 'done';

    if (initialTask) {
      onSave({
        ...initialTask,
        title: title.trim(),
        dueDate,
        priority,
        status,
        completed,
        category: minimalMode ? initialTask.category : category.trim() || undefined,
        notes: minimalMode ? initialTask.notes : notes.trim() || undefined,
      });
    } else {
      onSave({
        title: title.trim(),
        dueDate,
        priority,
        status,
        completed,
        category: minimalMode ? undefined : category.trim() || undefined,
        notes: minimalMode ? undefined : notes.trim() || undefined,
      });
    }

    onClose();
  };

  const modalSubtitle = minimalMode
    ? dueDate
      ? formatLongDate(dueDate)
      : 'Schedule task'
    : initialTask
    ? 'Modify details of your scheduled action item'
    : 'Schedule a focused objective in your command pipeline';

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'Edit Task' : minimalMode ? 'Add Task' : 'Add New Task or Plan'}
      subtitle={modalSubtitle}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
            Task Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Physics NLM Advanced Question Practice"
            className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
            autoFocus
          />
        </div>

        {minimalMode ? (
          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-2">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {PRIORITY_CHOICES.map(choice => {
                const isActive = priority === choice.value;
                return (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => setPriority(choice.value)}
                    className={`px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isActive ? choice.activeClass : choice.idleClass
                    }`}
                  >
                    <span className="font-mono font-bold">{choice.shortLabel}</span>
                    <span>{choice.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
                  Subject / Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="e.g. Physics, Chemistry, Math"
                  className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done / Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
                Notes / Problem Reference (Optional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Key concepts, book pages, problem numbers..."
                className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors resize-none"
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#292936]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#8E8EA0] hover:text-[#F3F3F7] bg-transparent hover:bg-[#1B1B26] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors focus:ring-2 focus:ring-[#9B7BFF]/40 cursor-pointer"
          >
            {initialTask ? 'Update Task' : 'Save Task'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
