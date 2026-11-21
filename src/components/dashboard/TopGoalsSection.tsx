import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Goal } from '../../types';
import { formatShortDate } from '../../utils/dates';
import { AddEditGoalModal } from '../modals/AddEditGoalModal';
import { Edit2, Plus, Target, Calendar } from 'lucide-react';

export const TopGoalsSection: React.FC = () => {
  const { goals, updateGoal, addGoal } = useApp();
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const goal1 = goals[0];
  const goal2 = goals[1];

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'createdAt'> | Goal) => {
    if ('id' in goalData) {
      updateGoal(goalData as Goal);
    } else {
      addGoal(goalData);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#F3F3F7]">Top Goals Right Now</h2>
          <p className="text-xs text-[#8E8EA0]">
            Core convictions and milestones shaping daily execution
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Slot 1 */}
        {goal1 ? (
          <GoalCard goal={goal1} onEdit={() => handleEdit(goal1)} />
        ) : (
          <EmptyGoalSlot onCreate={handleCreateNew} slotNumber={1} />
        )}

        {/* Slot 2 */}
        {goal2 ? (
          <GoalCard goal={goal2} onEdit={() => handleEdit(goal2)} />
        ) : (
          <EmptyGoalSlot onCreate={handleCreateNew} slotNumber={2} />
        )}
      </div>

      <AddEditGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveGoal}
        initialGoal={editingGoal}
      />
    </div>
  );
};

interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit }) => {
  const [imgError, setImgError] = useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [goal.imageUrl]);

  return (
    <div className="bg-[#14141D] border border-[#292936] rounded-xl overflow-hidden flex flex-col group hover:border-[#3B3B4E] transition-all">
      {/* Cover Image or Abstract CSS Placeholder */}
      <div className="relative h-36 sm:h-44 w-full bg-[#1B1B26] overflow-hidden border-b border-[#292936]">
        {goal.imageUrl && !imgError ? (
          <img
            src={goal.imageUrl}
            alt={goal.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1E1635] via-[#14141D] to-[#0d221c] flex items-center justify-center p-6 text-center">
            <div className="space-y-1">
              <Target className="w-8 h-8 text-[#9B7BFF]/60 mx-auto" />
              <span className="text-xs text-[#8E8EA0] font-mono tracking-wider">
                {goal.title.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Gradient Scrim for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#14141D] via-[#14141D]/30 to-transparent" />

        {/* Edit Button overlay */}
        <button
          onClick={onEdit}
          className="absolute top-3 right-3 p-2 bg-[#0B0B10]/80 backdrop-blur-xs text-[#8E8EA0] hover:text-[#F3F3F7] rounded-lg border border-[#292936] transition-colors cursor-pointer"
          title="Edit goal"
          aria-label={`Edit ${goal.title}`}
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        {/* Title & Target Date at bottom of cover */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-[#F3F3F7] tracking-tight">{goal.title}</h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#8E8EA0] bg-[#0B0B10]/85 px-2.5 py-1 rounded-md border border-[#292936] shrink-0 font-mono tabular-nums">
            <Calendar className="w-3 h-3 text-[#9B7BFF]" />
            <span>Target: {formatShortDate(goal.targetDate)}</span>
          </div>
        </div>
      </div>

      {/* Goal Details */}
      <div className="p-4">
        {/* Identity statement */}
        <div className="p-2.5 bg-[#0B0B10]/60 rounded-lg border border-[#292936]/60">
          <span className="text-[11px] uppercase tracking-wider text-[#9B7BFF] font-semibold block mb-0.5">
            Identity Statement
          </span>
          <p className="text-xs text-[#F3F3F7] italic font-medium leading-relaxed">
            "{goal.identityStatement}"
          </p>
        </div>
      </div>
    </div>
  );
};

interface EmptyGoalSlotProps {
  onCreate: () => void;
  slotNumber: number;
}

const EmptyGoalSlot: React.FC<EmptyGoalSlotProps> = ({ onCreate, slotNumber }) => {
  return (
    <div
      onClick={onCreate}
      className="bg-[#14141D]/50 border border-dashed border-[#292936] hover:border-[#9B7BFF]/50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[260px]"
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onCreate();
      }}
    >
      <div className="w-12 h-12 rounded-xl bg-[#1B1B26] border border-[#292936] flex items-center justify-center text-[#8E8EA0] group-hover:text-[#9B7BFF] group-hover:border-[#9B7BFF]/40 transition-colors mb-3">
        <Plus className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-[#F3F3F7] group-hover:text-[#9B7BFF] transition-colors">
        Set Top Goal #{slotNumber}
      </h3>
      <p className="text-xs text-[#8E8EA0] max-w-xs mt-1">
        Define an identity statement, description, target date, and progress benchmark.
      </p>
    </div>
  );
};
