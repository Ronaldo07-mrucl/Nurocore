import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MonthlyOutcome } from '../../types';
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  MoreVertical,
  Calendar,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatMonthYear, formatShortDate, getRelativeDateLabel } from '../../utils/dates';
import { ConfirmDialog } from '../modals/ConfirmDialog';

interface MonthlyOutcomesSectionProps {
  selectedMonth: string;
  onAddOutcome: () => void;
  onEditOutcome: (outcome: MonthlyOutcome) => void;
}

export const MonthlyOutcomesSection: React.FC<MonthlyOutcomesSectionProps> = ({
  selectedMonth,
  onAddOutcome,
  onEditOutcome,
}) => {
  const {
    monthlyOutcomes,
    toggleMonthlyOutcome,
    deleteMonthlyOutcome,
    reorderMonthlyOutcomes,
  } = useApp();

  const [deletingOutcomeId, setDeletingOutcomeId] = useState<string | null>(null);

  // Filter outcomes strictly for the selected month and sort by order
  const monthOutcomes = monthlyOutcomes
    .filter(o => o.month === selectedMonth)
    .sort((a, b) => a.order - b.order);

  const completedCount = monthOutcomes.filter(o => o.completed).length;
  const totalCount = monthOutcomes.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const currentList = [...monthOutcomes];
    const temp = currentList[index];
    currentList[index] = currentList[index - 1];
    currentList[index - 1] = temp;
    reorderMonthlyOutcomes(selectedMonth, currentList.map(o => o.id));
  };

  const handleMoveDown = (index: number) => {
    if (index >= monthOutcomes.length - 1) return;
    const currentList = [...monthOutcomes];
    const temp = currentList[index];
    currentList[index] = currentList[index + 1];
    currentList[index + 1] = temp;
    reorderMonthlyOutcomes(selectedMonth, currentList.map(o => o.id));
  };

  const handleDeleteConfirm = () => {
    if (deletingOutcomeId) {
      deleteMonthlyOutcome(deletingOutcomeId);
      setDeletingOutcomeId(null);
    }
  };

  return (
    <section className="bg-[#14141D] border border-[#292936] rounded-xl p-5 shadow-sm space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#292936]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#9B7BFF]/10 text-[#9B7BFF] flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#F3F3F7]">
                Monthly Key Outcomes
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1B1B26] text-[#8E8EA0] border border-[#292936] font-mono">
                {completedCount} / {totalCount} completed
              </span>
            </div>
            <p className="text-xs text-[#8E8EA0]">
              Strategic priorities and success milestones for {formatMonthYear(selectedMonth)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalCount > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#8E8EA0] mr-2">
              <div className="w-24 bg-[#1B1B26] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#9B7BFF] h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="font-semibold text-[#F3F3F7]">{percentage}%</span>
            </div>
          )}
          <button
            type="button"
            onClick={onAddOutcome}
            className="px-3 py-1.5 text-xs font-semibold text-[#9B7BFF] bg-[#9B7BFF]/10 hover:bg-[#9B7BFF]/20 border border-[#9B7BFF]/30 rounded-lg transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Outcome</span>
          </button>
        </div>
      </div>

      {/* Outcomes List or Empty State */}
      {monthOutcomes.length === 0 ? (
        <div className="py-10 px-4 text-center border border-dashed border-[#292936] rounded-xl bg-[#0B0B10]/40">
          <div className="w-12 h-12 rounded-2xl bg-[#9B7BFF]/10 text-[#9B7BFF] flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#F3F3F7]">
            No outcomes defined for {formatMonthYear(selectedMonth)}
          </h3>
          <p className="text-xs text-[#8E8EA0] max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
            Define 3 to 5 high-leverage milestones you must conquer this month to maintain academic mastery and holistic progress.
          </p>
          <button
            type="button"
            onClick={onAddOutcome}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#9B7BFF] to-[#825ff5] hover:opacity-90 rounded-lg shadow-sm shadow-[#9B7BFF]/20 transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Define First Outcome</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {monthOutcomes.map((outcome, index) => (
            <div
              key={outcome.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                outcome.completed
                  ? 'bg-[#14141D]/60 border-[#292936] opacity-75'
                  : 'bg-[#1B1B26] border-[#292936] hover:border-[#3E3E52]'
              }`}
            >
              {/* Left Column: Checkbox & Info */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleMonthlyOutcome(outcome.id)}
                  className="mt-0.5 shrink-0 text-[#8E8EA0] hover:text-[#43D9A3] transition-colors focus:outline-none"
                  title={outcome.completed ? 'Mark incomplete' : 'Mark complete'}
                  aria-label={outcome.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {outcome.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#43D9A3]" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#8E8EA0] hover:text-[#9B7BFF]" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#14141D] text-[#8E8EA0] border border-[#292936]">
                      #{index + 1}
                    </span>
                    <h3
                      className={`text-sm font-semibold truncate ${
                        outcome.completed
                          ? 'line-through text-[#8E8EA0]'
                          : 'text-[#F3F3F7]'
                      }`}
                    >
                      {outcome.title}
                    </h3>
                  </div>

                  {outcome.description && (
                    <p className="text-xs text-[#8E8EA0] mt-1 leading-relaxed line-clamp-2">
                      {outcome.description}
                    </p>
                  )}

                  {outcome.dueDate && (
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#8E8EA0]">
                      <Calendar className="w-3.5 h-3.5 text-[#9B7BFF]" />
                      <span>Target: {formatShortDate(outcome.dueDate)}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#14141D] text-[#9B7BFF] border border-[#9B7BFF]/20">
                        {getRelativeDateLabel(outcome.dueDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Reorder and Actions */}
              <div className="flex items-center justify-end gap-1 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#292936]">
                {/* Reorder Buttons */}
                <div className="flex items-center mr-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveUp(index)}
                    className="p-1.5 text-[#8E8EA0] hover:text-[#F3F3F7] disabled:opacity-30 disabled:hover:text-[#8E8EA0] transition-colors rounded hover:bg-[#14141D]"
                    title="Move up in priority"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === monthOutcomes.length - 1}
                    onClick={() => handleMoveDown(index)}
                    className="p-1.5 text-[#8E8EA0] hover:text-[#F3F3F7] disabled:opacity-30 disabled:hover:text-[#8E8EA0] transition-colors rounded hover:bg-[#14141D]"
                    title="Move down in priority"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => onEditOutcome(outcome)}
                  className="p-1.5 text-[#8E8EA0] hover:text-[#9B7BFF] hover:bg-[#14141D] rounded transition-colors"
                  title="Edit outcome"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => setDeletingOutcomeId(outcome.id)}
                  className="p-1.5 text-[#8E8EA0] hover:text-red-400 hover:bg-[#14141D] rounded transition-colors"
                  title="Delete outcome"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingOutcomeId)}
        onClose={() => setDeletingOutcomeId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Monthly Key Outcome"
        description="Are you sure you want to delete this monthly outcome? This action cannot be undone."
        confirmLabel="Delete Outcome"
        isDestructive
      />
    </section>
  );
};
