import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { useApp } from '../../context/AppContext';

interface EditStudyTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditStudyTargetModal: React.FC<EditStudyTargetModalProps> = ({ isOpen, onClose }) => {
  const { appSettings, updateDailyStudyTarget } = useApp();
  const [hours, setHours] = useState<number | ''>(8);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setHours(appSettings.dailyStudyTargetHours || 8);
      setError(null);
    }
  }, [isOpen, appSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(hours);
    if (isNaN(val) || val <= 0 || val > 24) {
      setError('Please enter a target between 0.5 and 24 hours per day.');
      return;
    }
    updateDailyStudyTarget(val);
    onClose();
  };

  const quickPresets = [4, 6, 8, 10, 12];

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Study Hours Target"
      subtitle="Set your daily commitment for academic problem solving"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
            Daily Target (Hours)
          </label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            max="24"
            value={hours}
            onChange={e => setHours(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-[#292936] rounded-lg text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF] font-mono tabular-nums text-lg"
            autoFocus
          />
        </div>

        {/* Presets */}
        <div>
          <span className="block text-xs text-[#8E8EA0] mb-2">Quick Presets:</span>
          <div className="flex items-center gap-2">
            {quickPresets.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => setHours(preset)}
                className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                  hours === preset
                    ? 'border-[#9B7BFF] bg-[#9B7BFF]/15 text-[#9B7BFF] font-medium'
                    : 'border-[#292936] bg-[#0B0B10] text-[#8E8EA0] hover:text-[#F3F3F7] hover:border-[#3B3B4E]'
                }`}
              >
                {preset}h
              </button>
            ))}
          </div>
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
            Update Target
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
