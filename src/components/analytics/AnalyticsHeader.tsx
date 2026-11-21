import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  AnalyticsRangePreset,
  DateRange,
  shiftDateRange,
} from '../../utils/analytics';
import { formatLongDate, formatShortDate, getTodayString } from '../../utils/dates';

interface AnalyticsHeaderProps {
  currentRange: DateRange;
  onSelectPreset: (preset: AnalyticsRangePreset) => void;
  onSetCustomRange: (start: string, end: string) => void;
  onShiftRange: (newRange: { startDate: string; endDate: string }) => void;
}

const PRESET_OPTIONS: { id: AnalyticsRangePreset; label: string }[] = [
  { id: 'last-7d', label: 'Last 7d' },
  { id: 'last-30d', label: 'Last 30d' },
  { id: 'last-90d', label: 'Last 90d' },
  { id: 'this-month', label: 'This Month' },
  { id: 'prev-month', label: 'Prev Month' },
  { id: 'this-year', label: 'This Year' },
  { id: 'all-time', label: 'All Time' },
  { id: 'custom', label: 'Custom' },
];

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  currentRange,
  onSelectPreset,
  onSetCustomRange,
  onShiftRange,
}) => {
  const [customStart, setCustomStart] = useState(currentRange.startDate);
  const [customEnd, setCustomEnd] = useState(currentRange.endDate);
  const [customError, setCustomError] = useState<string | null>(null);
  const [isCustomExpanded, setIsCustomExpanded] = useState(currentRange.preset === 'custom');

  const handlePrevShift = () => {
    const shifted = shiftDateRange(currentRange, 'prev');
    onShiftRange(shifted);
  };

  const handleNextShift = () => {
    const shifted = shiftDateRange(currentRange, 'next');
    onShiftRange(shifted);
  };

  const handlePresetClick = (preset: AnalyticsRangePreset) => {
    if (preset === 'custom') {
      setIsCustomExpanded(true);
      onSelectPreset('custom');
    } else {
      setIsCustomExpanded(false);
      onSelectPreset(preset);
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) {
      setCustomError('Both start and end dates are required.');
      return;
    }
    if (customStart > customEnd) {
      setCustomError('Start date cannot be after end date.');
      return;
    }
    setCustomError(null);
    onSetCustomRange(customStart, customEnd);
  };

  return (
    <div className="space-y-3 pb-4 border-b border-[#292936]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Date */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F3F3F7]">
            Analytics
          </h1>
          <p className="text-xs font-bold text-[#F3F3F7] mt-1 font-mono">
            {formatLongDate(getTodayString())}
          </p>
        </div>

        {/* Date Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          {/* Period Selector Pills */}
          <div className="flex items-center flex-wrap gap-1 bg-[#14141D] border border-[#292936] p-1 rounded-xl shadow-sm">
            {PRESET_OPTIONS.map(opt => {
              const isActive = currentRange.preset === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handlePresetClick(opt.id)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-[#9B7BFF] text-white shadow-sm font-semibold'
                      : 'text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Shift Controls (not available for all-time) */}
          {currentRange.preset !== 'all-time' && (
            <div className="flex items-center gap-1 bg-[#14141D] border border-[#292936] p-1 rounded-xl shadow-sm">
              <button
                type="button"
                onClick={handlePrevShift}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] transition-colors"
                title="Shift backward by one period"
                aria-label="Shift backward"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextShift}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] transition-colors"
                title="Shift forward by one period"
                aria-label="Shift forward"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Selected Reporting Range Indication */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-[#8E8EA0]">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#9B7BFF]" />
          <span>
            Selected Period:{' '}
            <strong className="text-[#F3F3F7] font-semibold">
              {formatShortDate(currentRange.startDate)} – {formatShortDate(currentRange.endDate)}
            </strong>
          </span>
          <span className="px-1.5 py-0.2 rounded bg-[#1B1B26] text-[#8E8EA0] border border-[#292936] text-[11px] font-mono">
            {currentRange.dayCount} {currentRange.dayCount === 1 ? 'day' : 'days'}
          </span>
        </div>

        {currentRange.preset === 'custom' && !isCustomExpanded && (
          <button
            type="button"
            onClick={() => setIsCustomExpanded(true)}
            className="text-[11px] text-[#9B7BFF] hover:underline"
          >
            Adjust Custom Range
          </button>
        )}
      </div>

      {/* Custom Range Drawer */}
      {isCustomExpanded && (
        <form
          onSubmit={handleApplyCustom}
          className="p-3 bg-[#14141D] border border-[#292936] rounded-xl flex flex-wrap items-center gap-3 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#8E8EA0]">From:</label>
            <input
              type="date"
              value={customStart}
              onChange={e => {
                setCustomStart(e.target.value);
                setCustomError(null);
              }}
              className="bg-[#1B1B26] border border-[#292936] rounded-lg px-2.5 py-1 text-xs text-[#F3F3F7] focus:outline-none focus:border-[#9B7BFF]"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-[#8E8EA0]">To:</label>
            <input
              type="date"
              value={customEnd}
              onChange={e => {
                setCustomEnd(e.target.value);
                setCustomError(null);
              }}
              className="bg-[#1B1B26] border border-[#292936] rounded-lg px-2.5 py-1 text-xs text-[#F3F3F7] focus:outline-none focus:border-[#9B7BFF]"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-3 py-1 bg-[#9B7BFF] hover:bg-[#825ff5] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Apply Range
            </button>
            <button
              type="button"
              onClick={() => setIsCustomExpanded(false)}
              className="px-2 py-1 text-xs text-[#8E8EA0] hover:text-[#F3F3F7] transition-colors"
            >
              Close
            </button>
          </div>

          {customError && (
            <div className="w-full text-xs text-rose-400 flex items-center gap-1 pt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{customError}</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
