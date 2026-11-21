import React from 'react';
import { ModalWrapper } from './ModalWrapper';
import { TestRecord } from '../../types';
import { formatLongDate } from '../../utils/dates';
import { calculateTestPercentage } from '../../utils/metrics';
import { ExternalLink, Edit3, Trash2, Award, AlertTriangle, BookOpen } from 'lucide-react';

interface TestSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: TestRecord | null;
  onEdit: (test: TestRecord) => void;
  onDelete: (id: string) => void;
  onOpenReport: (testId: string) => void;
}

export const TestSummaryModal: React.FC<TestSummaryModalProps> = ({
  isOpen,
  onClose,
  test,
  onEdit,
  onDelete,
  onOpenReport,
}) => {
  if (!test) return null;

  const percentage = calculateTestPercentage(test.marksObtained, test.totalMarks);
  const isMains = test.examType === 'Mains';

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={test.name}
      subtitle={`${test.examType} · ${formatLongDate(test.date)}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Score Card Banner */}
        <div className="p-4 bg-[#0B0B10] border border-[#292936] rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-[#8E8EA0] block mb-1">Score Obtained</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-[#F3F3F7]">
                {test.marksObtained}
              </span>
              <span className="text-sm font-mono text-[#8E8EA0]">/ {test.totalMarks}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-xs text-[#8E8EA0] block mb-1">Percentage</span>
              <span
                className={`text-2xl font-bold font-mono tabular-nums ${
                  isMains ? 'text-[#9B7BFF]' : 'text-[#43D9A3]'
                }`}
              >
                {percentage}%
              </span>
            </div>

            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isMains
                  ? 'border-[#9B7BFF]/30 bg-[#9B7BFF]/10 text-[#9B7BFF]'
                  : 'border-[#43D9A3]/30 bg-[#43D9A3]/10 text-[#43D9A3]'
              }`}
            >
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Syllabus Summary */}
        <div className="p-3.5 bg-[#0B0B10]/50 border border-[#292936] rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#8E8EA0] uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-[#9B7BFF]" />
            <span>Syllabus Covered</span>
          </div>
          <p className="text-sm text-[#F3F3F7] leading-relaxed">
            {test.syllabusSummary || 'No specific syllabus details recorded for this test.'}
          </p>
        </div>

        {/* Weak Chapters */}
        <div className="p-3.5 bg-[#0B0B10]/50 border border-[#292936] rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Weak Chapters & Topics</span>
          </div>
          <p className="text-sm text-[#F3F3F7] leading-relaxed">
            {test.weakChapters || 'No weak chapters flagged.'}
          </p>
        </div>

        {/* Error Log Summary */}
        <div className="p-3.5 bg-[#0B0B10]/50 border border-[#292936] rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#8E8EA0] uppercase tracking-wider">
            <span>Error Log Summary</span>
          </div>
          <p className="text-sm text-[#F3F3F7] leading-relaxed">
            {test.errorLogSummary || 'No errors documented.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#292936]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(test);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#1B1B26] border border-[#292936] rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(test.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-500/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenReport(test.id);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#9B7BFF] hover:bg-[#8864f7] rounded-lg transition-colors shadow-sm"
          >
            <span>Open full test report</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
