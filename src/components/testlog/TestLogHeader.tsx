import React from 'react';
import { Plus, Award, AlertCircle } from 'lucide-react';
import { formatLongDate, getTodayString } from '../../utils/dates';

interface TestLogHeaderProps {
  activeTab: 'tests' | 'errors';
  onTabChange: (tab: 'tests' | 'errors') => void;
  onAddTest: () => void;
  onAddError: () => void;
  totalTests: number;
  totalErrors: number;
  unresolvedErrors: number;
}

export const TestLogHeader: React.FC<TestLogHeaderProps> = ({
  activeTab,
  onTabChange,
  onAddTest,
  onAddError,
  totalTests,
  totalErrors,
  unresolvedErrors,
}) => {
  const todayStr = getTodayString();

  return (
    <div className="space-y-4">
      {/* Top Title & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F3F3F7]">
            Test & Error Log
          </h1>
          <p className="text-xs font-bold text-[#F3F3F7] mt-1 font-mono">
            {formatLongDate(todayStr)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onAddError}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#F3F3F7] hover:bg-[#1B1B26] border border-[#292936] hover:border-[#9B7BFF]/40 rounded-xl transition-colors cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Log Mistake</span>
          </button>

          <button
            onClick={onAddTest}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-xl transition-colors shadow-md shadow-[#9B7BFF]/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Test Record</span>
          </button>
        </div>
      </div>

      {/* Primary Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#292936] pb-px">
        <button
          onClick={() => onTabChange('tests')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'tests'
              ? 'border-[#9B7BFF] text-[#F3F3F7]'
              : 'border-transparent text-[#8E8EA0] hover:text-[#F3F3F7]'
          }`}
        >
          <Award className={`w-4 h-4 ${activeTab === 'tests' ? 'text-[#9B7BFF]' : 'text-[#8E8EA0]'}`} />
          <span>Mock Tests & Analytics</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#1B1B26] border border-[#292936] text-[#8E8EA0]">
            {totalTests}
          </span>
        </button>

        <button
          onClick={() => onTabChange('errors')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'errors'
              ? 'border-amber-400 text-[#F3F3F7]'
              : 'border-transparent text-[#8E8EA0] hover:text-[#F3F3F7]'
          }`}
        >
          <AlertCircle className={`w-4 h-4 ${activeTab === 'errors' ? 'text-amber-400' : 'text-[#8E8EA0]'}`} />
          <span>Error Vault & Mistake Taxonomy</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#1B1B26] border border-[#292936] text-[#8E8EA0]">
            {totalErrors}
            {unresolvedErrors > 0 && (
              <span className="text-amber-400 ml-1">({unresolvedErrors} open)</span>
            )}
          </span>
        </button>
      </div>
    </div>
  );
};
