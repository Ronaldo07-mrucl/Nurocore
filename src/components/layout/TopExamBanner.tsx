import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getDaysDifference, getTodayString } from '../../utils/dates';
import { EditExamModal } from '../modals/EditExamModal';
import { Calendar, AlertTriangle, Edit2, PlusCircle, CheckCircle2 } from 'lucide-react';

export const TopExamBanner: React.FC = () => {
  const { examSettings } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { examName, examDate } = examSettings;
  const hasExam = Boolean(examName && examDate);

  let daysRemaining = 0;
  let isPast = false;
  let isApproachingSoon = false;
  let isUrgent = false;

  if (hasExam) {
    daysRemaining = getDaysDifference(examDate, getTodayString());
    if (daysRemaining < 0) {
      isPast = true;
    } else if (daysRemaining <= 7) {
      isUrgent = true;
    } else if (daysRemaining <= 30) {
      isApproachingSoon = true;
    }
  }

  return (
    <>
      <div className="relative w-full min-h-[80px] bg-[#14141D] border-b border-[#292936] px-12 md:px-16 py-3 flex items-center justify-center transition-colors">
        {!hasExam ? (
          <div className="flex flex-col items-center justify-center text-center gap-1">
            <div className="flex items-center gap-1.5 text-xs text-[#8E8EA0] uppercase tracking-wider font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#9B7BFF]" />
              <span>Primary Mission</span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 text-sm text-[#9B7BFF] hover:underline font-semibold cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Set your next mission</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center gap-1">
            {/* Title */}
            <div className="text-xs font-medium tracking-widest uppercase text-[#8E8EA0]">
              {examName}
            </div>

            {/* Days Remaining - Center of Attention */}
            {isPast ? (
              <div className="flex items-center justify-center gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-slate-400" />
                <span className="text-xl md:text-2xl font-bold font-mono tracking-tight">
                  Mission date reached
                </span>
              </div>
            ) : isUrgent ? (
              <div className="flex items-center justify-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <span className="text-2xl md:text-[28px] font-bold font-mono tabular-nums tracking-tight leading-none">
                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                </span>
              </div>
            ) : isApproachingSoon ? (
              <div className="flex items-center justify-center gap-2 text-amber-300">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-2xl md:text-[28px] font-bold font-mono tabular-nums tracking-tight leading-none">
                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                </span>
              </div>
            ) : (
              <div className="text-2xl md:text-[28px] font-bold font-mono tabular-nums tracking-tight leading-none text-[#9B7BFF]">
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
              </div>
            )}
          </div>
        )}

        {/* Edit Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-1.5 text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] rounded-md transition-colors border border-transparent hover:border-[#292936] cursor-pointer"
          title="Edit primary mission"
          aria-label="Edit primary mission"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <EditExamModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
