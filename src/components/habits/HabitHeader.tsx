import React from 'react';
import { formatLongDate } from '../../utils/dates';

interface HabitHeaderProps {
  currentDateStr: string;
}

export const HabitHeader: React.FC<HabitHeaderProps> = ({ currentDateStr }) => {
  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F3F3F7]">
        Habit Tracking System
      </h1>
      <p className="text-xs font-bold text-[#F3F3F7] mt-1 font-mono">
        {formatLongDate(currentDateStr)}
      </p>
    </div>
  );
};
