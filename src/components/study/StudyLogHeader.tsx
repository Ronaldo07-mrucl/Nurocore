import React from 'react';
import { DateRangeFilter } from '../../types';
import { formatLongDate, formatShortDate, getDateRangeStartDate, getTodayString } from '../../utils/dates';
import { Plus, Calendar } from 'lucide-react';

interface StudyLogHeaderProps {
  filter: DateRangeFilter;
  onFilterChange: (filter: DateRangeFilter) => void;
  onAddSession: () => void;
}

export const StudyLogHeader: React.FC<StudyLogHeaderProps> = ({
  filter,
  onFilterChange,
  onAddSession,
}) => {
  const today = getTodayString();
  const startDate = getDateRangeStartDate(filter, today);

  const rangeLabel = startDate
    ? `${formatShortDate(startDate)} – ${formatShortDate(today)}`
    : 'All Recorded Time';

  const filterOptions: { id: DateRangeFilter; label: string }[] = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#292936]">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F3F3F7]">
          Study Log
        </h1>
        <p className="text-xs font-bold text-[#F3F3F7] mt-1 font-mono">
          {formatLongDate(today)}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Date Range Filter Tabs */}
        <div className="flex items-center bg-[#14141D] border border-[#292936] p-1 rounded-xl">
          {filterOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => onFilterChange(opt.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                filter === opt.id
                  ? 'bg-[#9B7BFF] text-white shadow-xs font-semibold'
                  : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Range Label pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-[#14141D] border border-[#292936] rounded-xl text-xs text-[#8E8EA0] font-mono">
          <Calendar className="w-3.5 h-3.5 text-[#9B7BFF]" />
          <span>{rangeLabel}</span>
        </div>

        {/* Add Session CTA */}
        <button
          onClick={onAddSession}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-xl transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Session</span>
        </button>
      </div>
    </div>
  );
};
