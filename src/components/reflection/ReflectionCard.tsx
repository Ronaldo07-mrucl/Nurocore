import React from 'react';
import { ReflectionEntry, Mood, EnergyLevel } from '../../types';
import { formatShortDate, getRelativeDateLabel, formatLongDate } from '../../utils/dates';
import { getWordCount } from '../../utils/reflectionStats';
import {
  Sparkles,
  Smile,
  Meh,
  Frown,
  AlertTriangle,
  Battery,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  CheckCircle2,
  Lightbulb,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface ReflectionCardProps {
  entry: ReflectionEntry;
  onView: (entry: ReflectionEntry) => void;
  onEdit: (entry: ReflectionEntry) => void;
  onDelete: (id: string) => void;
}

const MOOD_CONFIG: Record<
  Mood,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; badgeCls: string }
> = {
  great: { label: 'Great', icon: Sparkles, color: '#43D9A3', badgeCls: 'bg-[#43D9A3]/10 border-[#43D9A3]/30 text-[#43D9A3]' },
  good: { label: 'Good', icon: Smile, color: '#9B7BFF', badgeCls: 'bg-[#9B7BFF]/10 border-[#9B7BFF]/30 text-[#9B7BFF]' },
  neutral: { label: 'Neutral', icon: Meh, color: '#94A3B8', badgeCls: 'bg-[#94A3B8]/10 border-[#94A3B8]/30 text-[#94A3B8]' },
  difficult: { label: 'Difficult', icon: AlertTriangle, color: '#FBBF24', badgeCls: 'bg-[#FBBF24]/10 border-[#FBBF24]/30 text-[#FBBF24]' },
  low: { label: 'Low', icon: Frown, color: '#F43F5E', badgeCls: 'bg-[#F43F5E]/10 border-[#F43F5E]/30 text-[#F43F5E]' },
};

export const ReflectionCard: React.FC<ReflectionCardProps> = ({
  entry,
  onView,
  onEdit,
  onDelete,
}) => {
  const relativeDate = getRelativeDateLabel(entry.date);
  const moodConfig = entry.mood ? MOOD_CONFIG[entry.mood] : null;
  const MoodIcon = moodConfig?.icon;
  const wordCount = getWordCount(entry.content);

  const hasHighlights = Boolean(
    entry.highlights?.mainWin ||
    entry.highlights?.biggestChallenge ||
    entry.highlights?.lessonLearned ||
    entry.highlights?.priorityTomorrow
  );

  return (
    <div
      onClick={() => onView(entry)}
      className="group bg-[#14141D] hover:bg-[#181824] border border-[#292936] hover:border-[#3E3E52] rounded-xl p-4 md:p-5 transition-all cursor-pointer flex flex-col justify-between space-y-3.5 shadow-xs"
    >
      {/* Top Header: Date, relative date, mood badge, action buttons */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#F3F3F7]">
              {formatShortDate(entry.date)}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#181824] text-[#8E8EA0] border border-[#292936]">
              {relativeDate}
            </span>
            {moodConfig && MoodIcon && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${moodConfig.badgeCls}`}
              >
                <MoodIcon className="w-3 h-3" />
                <span>{moodConfig.label}</span>
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-[#F3F3F7] group-hover:text-[#9B7BFF] transition-colors mt-1.5 line-clamp-1">
            {entry.title}
          </h3>
        </div>

        {/* Edit & Delete quick buttons */}
        <div
          className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          <button
            type="button"
            title="Edit Reflection"
            onClick={() => onEdit(entry)}
            className="p-1.5 text-[#8E8EA0] hover:text-[#F3F3F7] hover:bg-[#292936] rounded-md transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Delete Reflection"
            onClick={() => onDelete(entry.id)}
            className="p-1.5 text-[#8E8EA0] hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content Preview */}
      {entry.content && (
        <p className="text-xs text-[#C5C5D2] leading-relaxed line-clamp-3 whitespace-pre-wrap font-sans">
          {entry.content}
        </p>
      )}

      {/* Highlights snippet if present */}
      {entry.highlights?.mainWin && (
        <div className="p-2.5 bg-[#43D9A3]/5 border border-[#43D9A3]/20 rounded-lg flex items-start gap-2 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#43D9A3] shrink-0 mt-0.5" />
          <div className="overflow-hidden">
            <span className="text-[10px] text-[#43D9A3] font-semibold uppercase tracking-wider block">
              Daily Win
            </span>
            <span className="text-xs text-[#F3F3F7] line-clamp-1">
              {entry.highlights.mainWin}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Row: Tags & Word Count / View prompt */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#292936]/60">
        <div className="flex flex-wrap gap-1.5">
          {entry.tags && entry.tags.length > 0 ? (
            entry.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#9B7BFF]/10 text-[#9B7BFF] border border-[#9B7BFF]/20"
              >
                #{tag}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-[#8E8EA0]">General reflection</span>
          )}
          {entry.tags && entry.tags.length > 3 && (
            <span className="text-[10px] text-[#8E8EA0] self-center">
              +{entry.tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#8E8EA0]">
          <span>{wordCount} words</span>
          <span className="text-[#9B7BFF] font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            <span>Read</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
