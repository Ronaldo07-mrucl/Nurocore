import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { Task } from '../../types';
import { getTodayString, offsetDateString, formatShortDate, formatLongDate } from '../../utils/dates';
import { Calendar, ArrowRight, Clock } from 'lucide-react';

interface RescheduleTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (taskId: string, newDate: string) => void;
  task: Task | null;
}

export const RescheduleTaskModal: React.FC<RescheduleTaskModalProps> = ({
  isOpen,
  onClose,
  onReschedule,
  task,
}) => {
  const [selectedDate, setSelectedDate] = useState('');

  const todayStr = getTodayString();
  const tomorrowStr = offsetDateString(todayStr, 1);
  const dayAfterStr = offsetDateString(todayStr, 2);

  useEffect(() => {
    if (isOpen && task) {
      setSelectedDate(task.dueDate || todayStr);
    }
  }, [isOpen, task, todayStr]);

  if (!task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
    onReschedule(task.id, selectedDate);
    onClose();
  };

  const handleQuickPick = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Reschedule Task" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Title & Current Date */}
        <div className="p-3 bg-[#1B1B26] border border-[#292936] rounded-lg">
          <p className="text-xs text-[#8E8EA0] uppercase tracking-wider mb-1">Task</p>
          <p className="text-sm font-medium text-[#F3F3F7] line-clamp-2">{task.title}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-[#8E8EA0]">
            <Clock className="w-3.5 h-3.5" />
            <span>Currently scheduled: <strong className="text-[#F3F3F7]">{formatShortDate(task.dueDate)}</strong></span>
          </div>
        </div>

        {/* Quick Date Shortcuts */}
        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] mb-2">Quick Presets</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickPick(todayStr)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                selectedDate === todayStr
                  ? 'bg-[#9B7BFF]/15 border-[#9B7BFF] text-[#9B7BFF]'
                  : 'bg-[#14141D] border-[#292936] text-[#8E8EA0] hover:text-[#F3F3F7] hover:border-[#3E3E52]'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickPick(tomorrowStr)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                selectedDate === tomorrowStr
                  ? 'bg-[#9B7BFF]/15 border-[#9B7BFF] text-[#9B7BFF]'
                  : 'bg-[#14141D] border-[#292936] text-[#8E8EA0] hover:text-[#F3F3F7] hover:border-[#3E3E52]'
              }`}
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleQuickPick(dayAfterStr)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                selectedDate === dayAfterStr
                  ? 'bg-[#9B7BFF]/15 border-[#9B7BFF] text-[#9B7BFF]'
                  : 'bg-[#14141D] border-[#292936] text-[#8E8EA0] hover:text-[#F3F3F7] hover:border-[#3E3E52]'
              }`}
            >
              +2 Days
            </button>
          </div>
        </div>

        {/* Custom Date Input */}
        <div>
          <label className="block text-xs font-medium text-[#8E8EA0] mb-1.5">Choose Specific Date</label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full bg-[#1B1B26] border border-[#292936] rounded-lg px-3 py-2 text-sm text-[#F3F3F7] focus:outline-none focus:border-[#9B7BFF] transition-colors"
              required
            />
          </div>
          {selectedDate && (
            <p className="text-[11px] text-[#43D9A3] mt-1.5 font-medium">
              New date: {formatLongDate(selectedDate)}
            </p>
          )}
        </div>

        {/* Actions */}
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
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#9B7BFF] to-[#825ff5] hover:opacity-90 rounded-lg shadow-sm shadow-[#9B7BFF]/25 transition-all flex items-center gap-1.5"
          >
            <span>Update Date</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
