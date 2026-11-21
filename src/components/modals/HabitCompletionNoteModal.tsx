import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { Habit } from '../../types';
import { formatLongDate } from '../../utils/dates';
import { FileText, Trash2 } from 'lucide-react';

interface HabitCompletionNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  dateStr: string;
  initialNote?: string;
  onSaveNote: (habitId: string, date: string, note: string) => void;
}

export const HabitCompletionNoteModal: React.FC<HabitCompletionNoteModalProps> = ({
  isOpen,
  onClose,
  habit,
  dateStr,
  initialNote,
  onSaveNote,
}) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNote(initialNote || '');
    }
  }, [isOpen, initialNote]);

  if (!habit) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveNote(habit.id, dateStr, note.trim());
    onClose();
  };

  const handleDelete = () => {
    onSaveNote(habit.id, dateStr, '');
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Habit Execution Note"
      subtitle={`${habit.name || habit.title} · ${formatLongDate(dateStr)}`}
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] mb-1">
            Execution Note / Log
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. Woke at 5:45 AM, finished 2.5h block without checking notifications."
            className="w-full bg-[#0B0B10] border border-[#292936] rounded-lg px-3 py-2 text-xs text-[#F3F3F7] placeholder-[#8E8EA0]/50 focus:outline-hidden focus:border-[#9B7BFF] transition-colors resize-none"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#292936]">
          {initialNote ? (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Note</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-[#8E8EA0] hover:text-[#F3F3F7] bg-[#0B0B10] hover:bg-[#1B1B26] border border-[#292936] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer"
            >
              Save Note
            </button>
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
};
