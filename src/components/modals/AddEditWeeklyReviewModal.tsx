import React, { useState, useEffect } from 'react';
import { WeeklyReview } from '../../types';
import { ModalWrapper } from './ModalWrapper';
import { getTodayString, parseLocalDate, formatLocalDate, formatShortDate } from '../../utils/dates';
import { Sparkles, AlertTriangle, Lightbulb, Target, Trash2 } from 'lucide-react';

interface AddEditWeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewToEdit?: WeeklyReview | null;
  onSave: (review: Omit<WeeklyReview, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate?: (review: WeeklyReview) => void;
  onDelete?: (id: string) => void;
  initialWeekStartDate?: string;
}

// Find nearest preceding Monday
function getMondayOfDate(dStr: string): string {
  const d = parseLocalDate(dStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return formatLocalDate(monday);
}

export const AddEditWeeklyReviewModal: React.FC<AddEditWeeklyReviewModalProps> = ({
  isOpen,
  onClose,
  reviewToEdit,
  onSave,
  onUpdate,
  onDelete,
  initialWeekStartDate,
}) => {
  const [weekStartDate, setWeekStartDate] = useState<string>(
    initialWeekStartDate || getMondayOfDate(getTodayString())
  );
  const [content, setContent] = useState<string>('');
  const [winOfTheWeek, setWinOfTheWeek] = useState<string>('');
  const [challengesFaced, setChallengesFaced] = useState<string>('');
  const [adjustmentsForNextWeek, setAdjustmentsForNextWeek] = useState<string>('');
  const [priorityForNextWeek, setPriorityForNextWeek] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (reviewToEdit) {
      setWeekStartDate(reviewToEdit.weekStartDate);
      setContent(reviewToEdit.content || '');
      setWinOfTheWeek(reviewToEdit.winOfTheWeek || '');
      setChallengesFaced(reviewToEdit.challengesFaced || '');
      setAdjustmentsForNextWeek(reviewToEdit.adjustmentsForNextWeek || '');
      setPriorityForNextWeek(reviewToEdit.priorityForNextWeek || '');
    } else {
      setWeekStartDate(initialWeekStartDate || getMondayOfDate(getTodayString()));
      setContent('');
      setWinOfTheWeek('');
      setChallengesFaced('');
      setAdjustmentsForNextWeek('');
      setPriorityForNextWeek('');
    }
    setErrorMsg('');
  }, [reviewToEdit, initialWeekStartDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !winOfTheWeek.trim()) {
      setErrorMsg('Please write a weekly review summary or at least one win of the week.');
      return;
    }

    if (reviewToEdit && onUpdate) {
      onUpdate({
        ...reviewToEdit,
        weekStartDate,
        content: content.trim(),
        winOfTheWeek: winOfTheWeek.trim() || undefined,
        challengesFaced: challengesFaced.trim() || undefined,
        adjustmentsForNextWeek: adjustmentsForNextWeek.trim() || undefined,
        priorityForNextWeek: priorityForNextWeek.trim() || undefined,
      });
    } else {
      onSave({
        weekStartDate,
        content: content.trim(),
        winOfTheWeek: winOfTheWeek.trim() || undefined,
        challengesFaced: challengesFaced.trim() || undefined,
        adjustmentsForNextWeek: adjustmentsForNextWeek.trim() || undefined,
        priorityForNextWeek: priorityForNextWeek.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={reviewToEdit ? 'Edit Weekly Review' : 'New Weekly Review'}
      subtitle={`Strategic retrospection for week starting ${formatShortDate(weekStartDate)}`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="p-6 overflow-y-auto max-h-[65vh] space-y-4">
          {errorMsg && (
            <div className="p-3 bg-[#F43F5E]/10 border border-[#F43F5E]/30 rounded-lg text-xs text-[#F43F5E]">
              {errorMsg}
            </div>
          )}

          {/* Week Start Date */}
          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
              Week Starting Date (Monday)
            </label>
            <input
              type="date"
              value={weekStartDate}
              onChange={e => setWeekStartDate(e.target.value)}
              required
              className="w-full sm:w-60 bg-[#181824] border border-[#292936] rounded-lg px-3 py-2 text-sm text-[#F3F3F7] focus:outline-hidden focus:border-[#9B7BFF]"
            />
            <p className="text-[11px] text-[#8E8EA0] mt-1">
              Reflections are categorized by the Monday initiating each weekly sprint.
            </p>
          </div>

          {/* Executive Summary */}
          <div>
            <label className="block text-xs font-medium text-[#8E8EA0] uppercase tracking-wider mb-1.5">
              Executive Weekly Summary *
            </label>
            <textarea
              rows={4}
              placeholder="How did this week feel overall? Assess study volume, mental stamina, adherence to targets, and systemic balance..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full bg-[#181824] border border-[#292936] rounded-lg p-3 text-sm text-[#F3F3F7] placeholder-[#5A5A6E] focus:outline-hidden focus:border-[#9B7BFF] resize-y leading-relaxed"
            />
          </div>

          {/* Win of the Week */}
          <div className="p-3.5 bg-[#181824] border border-[#292936] rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#43D9A3]">
              <Sparkles className="w-4 h-4" />
              <span>Win of the Week</span>
            </div>
            <input
              type="text"
              placeholder="e.g. Mastered rotation angular momentum; reduced negative marking by 40%"
              value={winOfTheWeek}
              onChange={e => setWinOfTheWeek(e.target.value)}
              className="w-full bg-[#14141D] border border-[#292936] rounded-lg px-3 py-2 text-sm text-[#F3F3F7] placeholder-[#5A5A6E] focus:outline-hidden focus:border-[#43D9A3]"
            />
          </div>

          {/* Challenges Faced */}
          <div className="p-3.5 bg-[#181824] border border-[#292936] rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#FBBF24]">
              <AlertTriangle className="w-4 h-4" />
              <span>Challenges & Roadblocks Faced</span>
            </div>
            <input
              type="text"
              placeholder="e.g. Mid-afternoon slumps; skipped one workout due to late mock analysis"
              value={challengesFaced}
              onChange={e => setChallengesFaced(e.target.value)}
              className="w-full bg-[#14141D] border border-[#292936] rounded-lg px-3 py-2 text-sm text-[#F3F3F7] placeholder-[#5A5A6E] focus:outline-hidden focus:border-[#FBBF24]"
            />
          </div>

          {/* Adjustments for Next Week */}
          <div className="p-3.5 bg-[#181824] border border-[#292936] rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#9B7BFF]">
              <Lightbulb className="w-4 h-4" />
              <span>Tactical Adjustments for Next Week</span>
            </div>
            <input
              type="text"
              placeholder="e.g. Keep lunch lighter, take 15-minute walks between sessions, set phone to grayscale"
              value={adjustmentsForNextWeek}
              onChange={e => setAdjustmentsForNextWeek(e.target.value)}
              className="w-full bg-[#14141D] border border-[#292936] rounded-lg px-3 py-2 text-sm text-[#F3F3F7] placeholder-[#5A5A6E] focus:outline-hidden focus:border-[#9B7BFF]"
            />
          </div>

          {/* Priority for Next Week */}
          <div className="p-3.5 bg-[#181824] border border-[#292936] rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#38BDF8]">
              <Target className="w-4 h-4" />
              <span>North-Star Priority for Next Week</span>
            </div>
            <input
              type="text"
              placeholder="e.g. Full-length timed mock simulation and error dissection"
              value={priorityForNextWeek}
              onChange={e => setPriorityForNextWeek(e.target.value)}
              className="w-full bg-[#14141D] border border-[#292936] rounded-lg px-3 py-2 text-sm text-[#F3F3F7] placeholder-[#5A5A6E] focus:outline-hidden focus:border-[#38BDF8]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#292936] bg-[#121219]">
          <div>
            {reviewToEdit && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(reviewToEdit.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#8E8EA0] hover:text-[#F3F3F7] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-[#9B7BFF] hover:bg-[#8A67FF] text-white rounded-lg shadow-sm shadow-[#9B7BFF]/30 transition-colors"
            >
              {reviewToEdit ? 'Save Changes' : 'Save Weekly Review'}
            </button>
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
};
