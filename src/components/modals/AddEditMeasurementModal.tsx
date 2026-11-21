import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { BodyMeasurementEntry } from '../../types';
import { getTodayString } from '../../utils/dates';
import { cmToIn, inToCm } from '../../utils/fitness';

interface AddEditMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<BodyMeasurementEntry, 'id' | 'createdAt' | 'updatedAt'> | BodyMeasurementEntry) => void;
  initialMeasurement?: BodyMeasurementEntry | null;
  defaultDate?: string;
}

export const AddEditMeasurementModal: React.FC<AddEditMeasurementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMeasurement,
  defaultDate,
}) => {
  const [date, setDate] = useState('');
  const [waist, setWaist] = useState<string>('');
  const [chest, setChest] = useState<string>('');
  const [hips, setHips] = useState<string>('');
  const [arm, setArm] = useState<string>('');
  const [thigh, setThigh] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialMeasurement) {
        setDate(initialMeasurement.date);
        const toInches = (cm?: number) => {
          if (cm === undefined || cm === null) return '';
          return String(cmToIn(cm));
        };
        setWaist(toInches(initialMeasurement.waistCm));
        setChest(toInches(initialMeasurement.chestCm));
        setHips(toInches(initialMeasurement.hipsCm));
        setArm(toInches(initialMeasurement.armCm));
        setThigh(toInches(initialMeasurement.thighCm));
        setNotes(initialMeasurement.notes || '');
      } else {
        setDate(defaultDate || getTodayString());
        setWaist('');
        setChest('');
        setHips('');
        setArm('');
        setThigh('');
        setNotes('');
      }
      setError(null);
    }
  }, [isOpen, initialMeasurement, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      setError('Please select a measurement date.');
      return;
    }

    const fields = [waist, chest, hips, arm, thigh];
    const hasAnyField = fields.some(f => f.trim() !== '');
    if (!hasAnyField) {
      setError('Please provide at least one body circumference measurement.');
      return;
    }

    const validateFieldToCm = (val: string, label: string) => {
      if (!val.trim()) return undefined;
      const num = Number(val);
      if (isNaN(num) || num <= 0 || !isFinite(num)) {
        throw new Error(`${label} must be a valid positive number.`);
      }
      return inToCm(num);
    };

    try {
      const waistCm = validateFieldToCm(waist, 'Waist');
      const chestCm = validateFieldToCm(chest, 'Chest');
      const hipsCm = validateFieldToCm(hips, 'Hips');
      const armCm = validateFieldToCm(arm, 'Arm');
      const thighCm = validateFieldToCm(thigh, 'Thigh');

      if (initialMeasurement) {
        onSave({
          ...initialMeasurement,
          date,
          waistCm,
          chestCm,
          hipsCm,
          armCm,
          thighCm,
          notes: notes.trim() || undefined,
        });
      } else {
        onSave({
          date,
          waistCm,
          chestCm,
          hipsCm,
          armCm,
          thighCm,
          notes: notes.trim() || undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Validation error');
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={initialMeasurement ? 'Edit Circumference Metrics' : 'Log Body Circumferences'}
      subtitle="Track body measurements in inches (in)."
      maxWidth="max-w-lg"
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

        {/* Measurement Grid (Inches) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
              Waist (in)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 31.7"
              value={waist}
              onChange={e => setWaist(e.target.value)}
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#43D9A3] rounded-lg px-3 py-2 text-[#F3F3F7] font-mono focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
              Chest (in)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 39.4"
              value={chest}
              onChange={e => setChest(e.target.value)}
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#43D9A3] rounded-lg px-3 py-2 text-[#F3F3F7] font-mono focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
              Hips (in)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 37.4"
              value={hips}
              onChange={e => setHips(e.target.value)}
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#43D9A3] rounded-lg px-3 py-2 text-[#F3F3F7] font-mono focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
              Upper Arm (in)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 13.6"
              value={arm}
              onChange={e => setArm(e.target.value)}
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#43D9A3] rounded-lg px-3 py-2 text-[#F3F3F7] font-mono focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
              Thigh (in)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 22.0"
              value={thigh}
              onChange={e => setThigh(e.target.value)}
              className="w-full bg-[#0B0B10] border border-[#292936] focus:border-[#43D9A3] rounded-lg px-3 py-2 text-[#F3F3F7] font-mono focus:outline-hidden"
            />
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-[#8E8EA0] uppercase tracking-wider text-[10px] font-semibold mb-1">
            Notes / Measurement State (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Relaxed morning measurement, post-workout pump, etc."
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
            {initialMeasurement ? 'Save Changes' : 'Record Measurements'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
