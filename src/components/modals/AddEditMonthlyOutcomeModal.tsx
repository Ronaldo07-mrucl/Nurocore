import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { MonthlyOutcome } from '../../types';
import { formatMonthYear, getCurrentMonthString } from '../../utils/dates';
import { Target, Calendar, CheckSquare } from 'lucide-react';

interface AddEditMonthlyOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (outcomeData: Omit<MonthlyOutcome, 'id' | 'createdAt' | 'updatedAt'> | MonthlyOutcome) => void;
  initialOutcome?: MonthlyOutcome | null;
  defaultMonth?: string; // YYYY-MM
}

export const AddEditMonthlyOutcomeModal: React.FC<AddEditMonthlyOutcomeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialOutcome,
  defaultMonth,
}) => {
  const [title, setTitle] = useState('');
  const [month, setMonth] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialOutcome) {
        setTitle(initialOutcome.title);
        setMonth(initialOutcome.month);
        setDescription(initialOutcome.description || '');
        setDueDate(initialOutcome.dueDate || '');
        setCompleted(initialOutcome.completed);
      } else {
        setTitle('');
        setMonth(defaultMonth || getCurrentMonthString());
        setDescription('');
        setDueDate('');
        setCompleted(false);
      }
      setError(null);
    }
  }, [isOpen, initialOutcome, defaultMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the monthly outcome.');
      return;
    }
    if (!month.trim()) {
      setError('Please select a target month.');
      return;
    }

    if (initialOutcome) {
      onSave({
        ...initialOutcome,
        title: title.trim(),
        month: month.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate.trim() || undefined,
        completed,
      });
    } else {
      onSave({
        title: title.trim(),
        month: month.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate.trim() || undefined,
        completed,
        order: 99, // Placed at the end by default
      });
    }
    onClose();
  };

  const isEditing = Boolean(initialOutcome);

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Key Outcome' : 'Add Monthly Key Outcome'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Month Indicator & Selection */}
        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] mb-1.5">
            Target Month (YYYY-MM) *
          </label>
          <div className="relative">
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="w-full bg-[#1B1B26] border border-[#292936] rounded-lg px-3 py-2 text-sm text-[#F3F3F7] focus:outline-none focus:border-[#9B7BFF] transition-colors"
              required
            />
          </div>
          {month && (
            <p className="text-[11px] text-[#9B7BFF] mt-1 font-medium">
              Target Period: {formatMonthYear(month)}
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] mb-1.5">
            Outcome Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Master 100% of Rotational Dynamics Problem Sets"
            className="w-full bg-[#1B1B26] border border-[#292936] rounded-lg px-3 py-2 text-sm text-[#F3F3F7] focus:outline-none focus:border-[#9B7BFF] transition-colors"
            autoFocus
          />
        </div>

        {/* Description / Success Criteria */}
        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] mb-1.5">
            Success Criteria & Specific Deliverables (Optional)
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="e.g. Solve 150 Level-2 and Level-3 questions with detailed error documentation."
            className="w-full bg-[#1B1B26] border border-[#292936] rounded-lg px-3 py-2 text-sm text-[#F3F3F7] focus:outline-none focus:border-[#9B7BFF] transition-colors resize-none"
          />
        </div>

        {/* Target Milestone Due Date (Optional) */}
        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] mb-1.5">
            Target Milestone Date (Optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full bg-[#1B1B26] border border-[#292936] rounded-lg px-3 py-2 text-sm text-[#F3F3F7] focus:outline-none focus:border-[#9B7BFF] transition-colors"
          />
          <p className="text-[11px] text-[#8E8EA0] mt-1">
            Optional specific milestone date within or by the end of {formatMonthYear(month) || 'this month'}.
          </p>
        </div>

        {/* Completion status (especially useful when editing) */}
        <div className="pt-2 border-t border-[#292936]">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={completed}
              onChange={e => setCompleted(e.target.checked)}
              className="w-4 h-4 rounded border-[#292936] bg-[#1B1B26] text-[#43D9A3] focus:ring-[#43D9A3]/20 focus:ring-offset-0 focus:outline-none accent-[#43D9A3]"
            />
            <span className="text-xs font-medium text-[#F3F3F7]">
              Mark as completed
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#292936]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#8E8EA0] hover:text-[#F3F3F7] bg-transparent hover:bg-[#1B1B26] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#9B7BFF] to-[#825ff5] hover:opacity-90 rounded-lg shadow-sm shadow-[#9B7BFF]/25 transition-all"
          >
            {isEditing ? 'Save Changes' : 'Create Outcome'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
