import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateStudyHours } from '../../utils/metrics';
import { getTodayString } from '../../utils/dates';
import { EditStudyTargetModal } from '../modals/EditStudyTargetModal';
import { Target, Edit2, ChevronDown, ChevronUp, Check } from 'lucide-react';

export const BottomStudyTargetPanel: React.FC = () => {
  const { studySessions, appSettings } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const today = getTodayString();
  const trackedHours = calculateStudyHours(studySessions, today);
  const targetHours = appSettings.dailyStudyTargetHours || 8;
  const progressPercent = Math.min(100, Math.round((trackedHours / targetHours) * 100));
  const remainingHours = Math.max(0, Number((targetHours - trackedHours).toFixed(1)));
  const isGoalReached = trackedHours >= targetHours;

  // SVG circular math for mobile / collapsed rail (radius = 12, perimeter ≈ 75.4)
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <>
      {/* Container embedded at the bottom of the right nav bar */}
      <div
        className="w-full select-none"
        role="region"
        aria-label="Daily study target tracking"
      >
        {/* Mobile / Compact Rail View (< md / 64px width) */}
        <div className="md:hidden flex flex-col items-center justify-center py-1">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-[#1B1B26] text-[#8E8EA0] hover:text-[#F3F3F7] transition-colors cursor-pointer group"
            title={`Study Target: ${trackedHours}h / ${targetHours}h (${progressPercent}% complete)`}
            aria-label="Edit study target"
          >
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-8 h-8 -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r={radius}
                  stroke="#292936"
                  strokeWidth="2.5"
                  fill="none"
                />
                <circle
                  cx="16"
                  cy="16"
                  r={radius}
                  stroke={isGoalReached ? '#43D9A3' : '#9B7BFF'}
                  strokeWidth="2.5"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <Target className={`w-3.5 h-3.5 absolute ${isGoalReached ? 'text-[#43D9A3]' : 'text-[#9B7BFF]'}`} />
            </div>
            <span className="text-[10px] font-mono font-semibold text-[#F3F3F7] mt-1 tabular-nums">
              {progressPercent}%
            </span>
          </button>
        </div>

        {/* Desktop View (>= md / 224px width) */}
        <div className="hidden md:block">
          <div className="bg-[#0B0B10] border border-[#292936] rounded-xl p-2.5 transition-colors hover:border-[#3B3B4E]">
            {isCollapsed ? (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="flex items-center gap-2 text-xs text-[#F3F3F7] hover:text-[#9B7BFF] transition-colors cursor-pointer"
                  title="Expand study target"
                >
                  <Target className={`w-3.5 h-3.5 ${isGoalReached ? 'text-[#43D9A3]' : 'text-[#9B7BFF]'}`} />
                  <span className="font-mono tabular-nums font-semibold text-[11px]">
                    {trackedHours}h / {targetHours}h
                  </span>
                  <span className={`text-[10px] font-mono font-semibold ${isGoalReached ? 'text-[#43D9A3]' : 'text-[#9B7BFF]'}`}>
                    ({progressPercent}%)
                  </span>
                </button>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-1 text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] rounded-md transition-colors cursor-pointer"
                    title="Edit daily target"
                    aria-label="Edit daily target"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setIsCollapsed(false)}
                    className="p-1 text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] rounded-md transition-colors cursor-pointer"
                    title="Expand"
                    aria-label="Expand study target panel"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-md ${isGoalReached ? 'bg-[#43D9A3]/15 text-[#43D9A3]' : 'bg-[#9B7BFF]/15 text-[#9B7BFF]'} flex items-center justify-center shrink-0`}>
                      <Target className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#F3F3F7] tracking-tight">Study Target</span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="p-1 text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] rounded-md transition-colors cursor-pointer"
                      title="Edit daily target"
                      aria-label="Edit daily target"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setIsCollapsed(true)}
                      className="p-1 text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] rounded-md transition-colors cursor-pointer"
                      title="Minimize"
                      aria-label="Minimize study target panel"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between mb-1.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold font-mono tabular-nums text-[#F3F3F7]">
                      {trackedHours}
                    </span>
                    <span className="text-[11px] text-[#8E8EA0]">/ {targetHours}h</span>
                  </div>
                  <span className={`text-[11px] font-mono font-bold ${isGoalReached ? 'text-[#43D9A3]' : 'text-[#9B7BFF]'}`}>
                    {progressPercent}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-[#14141D] rounded-full overflow-hidden border border-[#292936]">
                  <div
                    className={`h-full ${
                      isGoalReached
                        ? 'bg-gradient-to-r from-[#43D9A3] to-[#7ff2c8]'
                        : 'bg-gradient-to-r from-[#9B7BFF] to-[#b39bff]'
                    } rounded-full transition-all duration-300`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Status caption */}
                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                  {isGoalReached ? (
                    <span className="text-[#43D9A3] font-medium flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> Target achieved
                    </span>
                  ) : (
                    <span className="text-[#8E8EA0]">
                      {remainingHours}h remaining
                    </span>
                  )}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-[#8E8EA0] hover:text-[#9B7BFF] transition-colors underline decoration-dotted cursor-pointer"
                  >
                    Adjust
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditStudyTargetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
