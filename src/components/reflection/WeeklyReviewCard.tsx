import React from 'react';
import { WeeklyReview } from '../../types';
import { formatShortDate, parseLocalDate, formatLocalDate } from '../../utils/dates';
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Target,
  Edit2,
  Trash2,
  Calendar,
  ArrowRight,
} from 'lucide-react';

interface WeeklyReviewCardProps {
  review: WeeklyReview;
  onEdit: (review: WeeklyReview) => void;
  onDelete: (id: string) => void;
}

export const WeeklyReviewCard: React.FC<WeeklyReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
}) => {
  // Calculate end of week (Sunday = +6 days)
  const getWeekRangeLabel = (startStr: string): string => {
    const start = parseLocalDate(startStr);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${formatShortDate(startStr)} – ${formatShortDate(formatLocalDate(end))}`;
  };

  return (
    <div className="bg-[#14141D] border border-[#292936] hover:border-[#3E3E52] rounded-xl p-5 transition-all space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#9B7BFF]/15 text-[#9B7BFF] border border-[#9B7BFF]/30">
              Weekly Review
            </span>
            <span className="text-xs text-[#8E8EA0] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#8E8EA0]" />
              <span>{getWeekRangeLabel(review.weekStartDate)}</span>
            </span>
          </div>
          <h3 className="text-base font-semibold text-[#F3F3F7] mt-1.5">
            Sprint Retrospective
          </h3>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            title="Edit Weekly Review"
            onClick={() => onEdit(review)}
            className="p-1.5 text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#292936] rounded-md transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Delete Weekly Review"
            onClick={() => onDelete(review.id)}
            className="p-1.5 text-[#8E8EA0] hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Review Content */}
      {review.content && (
        <p className="text-sm text-[#C5C5D2] leading-relaxed whitespace-pre-wrap font-sans">
          {review.content}
        </p>
      )}

      {/* Strategic Callouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {review.winOfTheWeek && (
          <div className="p-3 bg-[#43D9A3]/5 border border-[#43D9A3]/20 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#43D9A3]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Win of the Week</span>
            </div>
            <p className="text-xs text-[#F3F3F7] leading-relaxed">{review.winOfTheWeek}</p>
          </div>
        )}

        {review.challengesFaced && (
          <div className="p-3 bg-[#FBBF24]/5 border border-[#FBBF24]/20 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FBBF24]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Challenges Faced</span>
            </div>
            <p className="text-xs text-[#F3F3F7] leading-relaxed">{review.challengesFaced}</p>
          </div>
        )}

        {review.adjustmentsForNextWeek && (
          <div className="p-3 bg-[#9B7BFF]/5 border border-[#9B7BFF]/20 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#9B7BFF]">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Adjustments for Next Week</span>
            </div>
            <p className="text-xs text-[#F3F3F7] leading-relaxed">{review.adjustmentsForNextWeek}</p>
          </div>
        )}

        {review.priorityForNextWeek && (
          <div className="p-3 bg-[#38BDF8]/5 border border-[#38BDF8]/20 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#38BDF8]">
              <Target className="w-3.5 h-3.5" />
              <span>North-Star Priority</span>
            </div>
            <p className="text-xs text-[#F3F3F7] leading-relaxed">{review.priorityForNextWeek}</p>
          </div>
        )}
      </div>
    </div>
  );
};
