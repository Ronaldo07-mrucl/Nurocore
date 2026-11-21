import React from 'react';
import { formatLongDate, getTodayString } from '../../utils/dates';
import { Plus } from 'lucide-react';

interface FitnessHeaderProps {
  onLogWorkout: () => void;
}

export const FitnessHeader: React.FC<FitnessHeaderProps> = ({ onLogWorkout }) => {
  const todayStr = getTodayString();

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F3F3F7]">
            Fitness & Body Tracking
          </h1>
          <p className="text-xs font-bold text-[#F3F3F7] mt-1 font-mono">
            {formatLongDate(todayStr)}
          </p>
        </div>

        <div className="flex items-center">
          <button
            onClick={onLogWorkout}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B0B10] bg-[#43D9A3] hover:bg-[#39c792] rounded-xl transition-colors shadow-md shadow-[#43D9A3]/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Workout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
