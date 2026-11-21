import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatLongDate, formatMonthYear, getCurrentMonthString, getPreviousMonth, getNextMonth, getTodayString } from '../../utils/dates';

interface PlanningHeaderProps {
  selectedMonth: string; // YYYY-MM
  onMonthChange: (newMonth: string) => void;
}

export const PlanningHeader: React.FC<PlanningHeaderProps> = ({
  selectedMonth,
  onMonthChange,
}) => {
  const currentMonth = getCurrentMonthString();
  const isCurrentMonth = selectedMonth === currentMonth;
  const todayStr = getTodayString();

  const handlePrevMonth = () => {
    onMonthChange(getPreviousMonth(selectedMonth));
  };

  const handleNextMonth = () => {
    onMonthChange(getNextMonth(selectedMonth));
  };

  const handleResetToCurrent = () => {
    onMonthChange(currentMonth);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#292936]">
      {/* Title & Date */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F3F3F7]">
          Planning & Execution System
        </h1>
        <p className="text-xs font-bold text-[#F3F3F7] mt-1 font-mono">
          {formatLongDate(todayStr)}
        </p>
      </div>

      {/* Month Selector Widget */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center bg-[#14141D] border border-[#292936] rounded-xl p-1 shadow-sm">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] transition-colors cursor-pointer"
            title="Previous Month"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3 min-w-[130px] text-center">
            <span className="text-xs font-semibold text-[#F3F3F7] block">
              {formatMonthYear(selectedMonth)}
            </span>
            <span className="text-[10px] text-[#8E8EA0] font-mono block">
              {selectedMonth}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] transition-colors cursor-pointer"
            title="Next Month"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isCurrentMonth && (
            <button
              type="button"
              onClick={handleResetToCurrent}
              className="ml-1 px-2.5 py-1 text-[11px] font-medium text-[#9B7BFF] hover:bg-[#9B7BFF]/10 rounded-lg transition-colors border border-[#9B7BFF]/30 cursor-pointer"
              title="Jump to current month"
            >
              Today
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
