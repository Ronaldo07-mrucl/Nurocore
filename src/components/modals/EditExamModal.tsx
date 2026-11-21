import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { useApp } from '../../context/AppContext';
import { getTodayString } from '../../utils/dates';

interface EditExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditExamModal: React.FC<EditExamModalProps> = ({ isOpen, onClose }) => {
  const { examSettings, updateExamSettings } = useApp();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(examSettings.examName || '');
      setDate(examSettings.examDate || '');
      setError(null);
    }
  }, [isOpen, examSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a mission title or name.');
      return;
    }
    if (!date) {
      setError('Please select a target date.');
      return;
    }

    updateExamSettings({
      examName: name.trim(),
      examDate: date,
    });

    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Primary Mission"
      subtitle="Update your primary milestone and countdown date"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
            Mission Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. JEE Mains 2027, Marathon, Product Launch"
            className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
            Target Date
          </label>
          <input
            type="date"
            value={date}
            min={getTodayString()}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] transition-colors"
          />
        </div>

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
            className="px-4 py-2 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors focus:ring-2 focus:ring-[#9B7BFF]/40"
          >
            Save Mission
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
