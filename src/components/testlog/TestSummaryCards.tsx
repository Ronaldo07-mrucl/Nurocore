import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateExamTypeStats, calculateErrorStats } from '../../utils/metrics';
import { Award, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const TestSummaryCards: React.FC = () => {
  const { tests, testErrors } = useApp();

  const mainsStats = calculateExamTypeStats(tests, 'Mains');
  const advancedStats = calculateExamTypeStats(tests, 'Advanced');
  const errorStats = calculateErrorStats(testErrors);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Tests Logged */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8EA0]">
            Mock Tests
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#9B7BFF]/10 border border-[#9B7BFF]/20 flex items-center justify-center text-[#9B7BFF]">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-[#F3F3F7] tabular-nums">
              {tests.length}
            </span>
            <span className="text-xs text-[#8E8EA0]">completed</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#292936]/60 flex items-center justify-between text-[11px] text-[#8E8EA0] font-mono">
          <span className="text-[#9B7BFF]">{mainsStats.count} Mains</span>
          <span className="text-[#43D9A3]">{advancedStats.count} Advanced</span>
        </div>
      </div>

      {/* 2. Mains Average & Highest */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8EA0]">
            Mains Average
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#9B7BFF]/10 border border-[#9B7BFF]/20 flex items-center justify-center text-[#9B7BFF]">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-[#F3F3F7] tabular-nums">
              {mainsStats.count > 0 ? mainsStats.avgMarks : '—'}
            </span>
            <span className="text-xs text-[#8E8EA0]">/ 300</span>
            {mainsStats.count > 0 && (
              <span className="text-xs font-semibold text-[#9B7BFF]">
                ({mainsStats.avgPercentage}%)
              </span>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-[#292936]/60 flex items-center justify-between text-[11px] text-[#8E8EA0]">
          <span>Peak Score:</span>
          <span className="font-mono font-medium text-[#F3F3F7]">
            {mainsStats.count > 0 ? `${mainsStats.highestMarks}/300` : '—'}
          </span>
        </div>
      </div>

      {/* 3. Advanced Average & Highest */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8EA0]">
            Advanced Average
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#43D9A3]/10 border border-[#43D9A3]/20 flex items-center justify-center text-[#43D9A3]">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-[#F3F3F7] tabular-nums">
              {advancedStats.count > 0 ? advancedStats.avgMarks : '—'}
            </span>
            <span className="text-xs text-[#8E8EA0]">/ 360</span>
            {advancedStats.count > 0 && (
              <span className="text-xs font-semibold text-[#43D9A3]">
                ({advancedStats.avgPercentage}%)
              </span>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-[#292936]/60 flex items-center justify-between text-[11px] text-[#8E8EA0]">
          <span>Peak Score:</span>
          <span className="font-mono font-medium text-[#F3F3F7]">
            {advancedStats.count > 0 ? `${advancedStats.highestMarks}/360` : '—'}
          </span>
        </div>
      </div>

      {/* 4. Mistake Remediation */}
      <div className="bg-[#14141D] border border-[#292936] rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8EA0]">
            Error Resolution
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-[#F3F3F7] tabular-nums">
              {errorStats.total > 0 ? `${errorStats.resolutionRate}%` : '100%'}
            </span>
            <span className="text-xs text-[#8E8EA0]">resolved</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#292936]/60 flex items-center justify-between text-[11px] text-[#8E8EA0]">
          <span className="truncate">
            {errorStats.topCategory ? `Top: ${errorStats.topCategory.label}` : 'No slips'}
          </span>
          <span className="font-mono text-amber-400 shrink-0">
            {errorStats.unresolved} open
          </span>
        </div>
      </div>
    </div>
  );
};
