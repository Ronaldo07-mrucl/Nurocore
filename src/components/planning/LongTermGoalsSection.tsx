import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Goal } from '../../types';
import {
  Flag,
  Plus,
  Edit2,
  Trash2,
  Calendar,
} from 'lucide-react';
import { formatShortDate, getDaysDifference } from '../../utils/dates';
import { ConfirmDialog } from '../modals/ConfirmDialog';

interface LongTermGoalsSectionProps {
  onAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
}

export const LongTermGoalsSection: React.FC<LongTermGoalsSectionProps> = ({
  onAddGoal,
  onEditGoal,
}) => {
  const { goals, deleteGoal } = useApp();
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (deletingGoalId) {
      deleteGoal(deletingGoalId);
      setDeletingGoalId(null);
    }
  };

  return (
    <section className="bg-[#14141D] border border-[#292936] rounded-xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#292936]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Flag className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#F3F3F7]">
                Long-Term Identity Goals
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1B1B26] text-[#8E8EA0] border border-[#292936]">
                {goals.length} active
              </span>
            </div>
            <p className="text-xs text-[#8E8EA0]">
              Identity anchors and macro milestones that direct your day-to-day discipline
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddGoal}
          className="px-3 py-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Identity Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="py-8 px-4 text-center border border-dashed border-[#292936] rounded-xl bg-[#0B0B10]/40">
          <p className="text-xs text-[#8E8EA0] mb-3">
            No long-term goals registered yet. Establish high-order identity convictions to anchor your schedule.
          </p>
          <button
            type="button"
            onClick={onAddGoal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-all cursor-pointer"
          >
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => (
            <IdentityGoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => onEditGoal(goal)}
              onDelete={() => setDeletingGoalId(goal.id)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingGoalId)}
        onClose={() => setDeletingGoalId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Identity Goal"
        description="Are you sure you want to delete this identity goal? It will be removed from both Planning and Dashboard."
        confirmLabel="Delete Goal"
        isDestructive
      />
    </section>
  );
};

interface IdentityGoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
}

const IdentityGoalCard: React.FC<IdentityGoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
}) => {
  const [imgError, setImgError] = useState(false);
  const daysRemaining = getDaysDifference(goal.targetDate);

  useEffect(() => {
    setImgError(false);
  }, [goal.imageUrl]);

  return (
    <div className="bg-[#1B1B26] border border-[#292936] rounded-xl overflow-hidden flex flex-col hover:border-[#3E3E52] transition-colors relative group">
      {/* Thumbnail Banner */}
      <div className="relative h-32 w-full bg-[#14141D] overflow-hidden border-b border-[#292936]">
        {goal.imageUrl && !imgError ? (
          <img
            src={goal.imageUrl}
            alt={goal.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#231942] via-[#14141D] to-[#0f241e] flex items-center justify-center p-4 text-center">
            <div className="space-y-1">
              <Flag className="w-7 h-7 text-amber-400/50 mx-auto" />
              <span className="text-[10px] text-[#8E8EA0] font-mono tracking-wider uppercase block">
                {goal.title}
              </span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#1B1B26] via-[#1B1B26]/20 to-transparent" />

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 bg-[#0B0B10]/80 backdrop-blur-xs text-[#8E8EA0] hover:text-[#9B7BFF] rounded-lg border border-[#292936] transition-colors cursor-pointer"
            title="Edit goal"
            aria-label={`Edit ${goal.title}`}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 bg-[#0B0B10]/80 backdrop-blur-xs text-[#8E8EA0] hover:text-red-400 rounded-lg border border-[#292936] transition-colors cursor-pointer"
            title="Delete goal"
            aria-label={`Delete ${goal.title}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#F3F3F7]">{goal.title}</h3>
          {goal.targetDate && (
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#8E8EA0]">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Target: {formatShortDate(goal.targetDate)}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#14141D] text-amber-400 border border-amber-400/20 font-medium">
                {daysRemaining > 0 ? `${daysRemaining} days left` : daysRemaining === 0 ? 'Due today' : 'Past due'}
              </span>
            </div>
          )}

          {goal.identityStatement && (
            <div className="mt-3 p-2.5 bg-[#14141D] border border-[#292936] rounded-lg">
              <p className="text-xs text-[#9B7BFF] italic font-medium">
                "{goal.identityStatement}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
