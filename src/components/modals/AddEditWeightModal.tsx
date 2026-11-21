import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { WeightEntry } from '../../types';
import { getTodayString } from '../../utils/dates';

interface AddEditWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<WeightEntry, 'id' | 'createdAt' | 'updatedAt'> | WeightEntry) => void;
  initialWeight?: WeightEntry | null;
  defaultDate?: string;
}

export const AddEditWeightModal: React.FC<AddEditWeightModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialWeight,
  defaultDate,
}) => {
  const [date, setDate] = useState('');
  const [weightValue, setWeightValue] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialWeight) {
        setDate(initialWeight.date);
        setWeightValue(String(Math.round(initialWeight.weightKg * 10) / 10));
        setNotes(initialWeight.notes || '');
      } else {
        setDate(defaultDate || getTodayString());
        setWeightValue('');
        setNotes('');
      }
      setError(null);
    }
  }, [isOpen, initialWeight, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      setError('Please select a date.');
      return;
    }

    if (!weightValue || isNaN(Number(weightValue))) {
      setError('Please enter a valid weight value.');
      return;
    }

    const weightKg = Number(weightValue);
    if (!isFinite(weightKg) || weightKg <= 0) {
      setError('Weight must be a positive finite number.');
      return;
    }

    if (weightKg < 20 || weightKg > 300) {
      setError(`Weight value (${weightKg} kg) is outside expected range.`);
      return;
    }

    if (initialWeight) {
      onSave({
        ...initialWeight,
        date,
        weightKg,
        notes: notes.trim() || undefined,
      });
    } else {
      onSave({
        date,
        weightKg,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={initialWeight ? 'Edit Weight Record' : 'Log Body Weight'}
      subtitle="Consistent morning weigh-ins in kilograms (kg)."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
            {error}
          </div>
        )}

        {/* Date */}
        <div>
          <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
            Weigh-in Date *
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden font-mono"
            required
          />
        </div>

        {/* Weight in kg */}
        <div>
          <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
            Weight (kg) *
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="20"
              max="300"
              value={weightValue}
              onChange={e => setWeightValue(e.target.value)}
              placeholder="e.g. 72.5"
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg pl-3 pr-10 py-2.5 text-[#F3F3F7] text-base font-mono font-semibold focus:outline-hidden"
              required
              autoFocus
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#8E8EA0]">
              kg
            </span>
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
            Conditions / Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Fasted morning, post-rest day"
            className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#9B7BFF] rounded-lg px-3 py-2 text-[#F3F3F7] focus:outline-hidden"
          />
        </div>

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
            className="px-4 py-2 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors cursor-pointer"
          >
            {initialWeight ? 'Save Changes' : 'Record Weight'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
