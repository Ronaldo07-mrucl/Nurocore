import React from 'react';
import { formatLongDate, getTodayString } from '../../utils/dates';
import { Plus } from 'lucide-react';

interface DashboardHeaderProps {
  onQuickAddTask: () => void;
  onQuickAddTest: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onQuickAddTask,
  onQuickAddTest,
}) => {
  const todayLong = formatLongDate(getTodayString());

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#292936]">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F3F3F7] font-mono">
          {todayLong}
        </h1>
      </div>

      {/* Action Controls */}
      <div className="flex items-center flex-wrap gap-2">
        <button
          onClick={onQuickAddTask}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>

        <button
          onClick={onQuickAddTest}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#43D9A3] bg-[#43D9A3]/10 hover:bg-[#43D9A3]/20 border border-[#43D9A3]/30 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Test</span>
        </button>
      </div>
    </div>
  );
};
