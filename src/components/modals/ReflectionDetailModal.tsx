import React from 'react';
import { ReflectionEntry, Mood, EnergyLevel } from '../../types';
import { ModalWrapper } from './ModalWrapper';
import { formatLongDate } from '../../utils/dates';
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
  ArrowRight,
  Edit2,
  Trash2,
  Calendar,
  Clock,
} from 'lucide-react';

interface ReflectionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: ReflectionEntry | null;
  onEdit: (entry: ReflectionEntry) => void;
  onDelete: (id: string) => void;
}

const MOOD_CONFIG: Record<
  Mood,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  great: { label: 'Great State', icon: Sparkles, color: '#43D9A3', bg: 'bg-[#43D9A3]/10 border-[#43D9A3]/30 text-[#43D9A3]' },
  good: { label: 'Good State', icon: Smile, color: '#9B7BFF', bg: 'bg-[#9B7BFF]/10 border-[#9B7BFF]/30 text-[#9B7BFF]' },
  neutral: { label: 'Neutral State', icon: Meh, color: '#94A3B8', bg: 'bg-[#94A3B8]/10 border-[#94A3B8]/30 text-[#94A3B8]' },
  difficult: { label: 'Difficult State', icon: AlertTriangle, color: '#FBBF24', bg: 'bg-[#FBBF24]/10 border-[#FBBF24]/30 text-[#FBBF24]' },
  low: { label: 'Low State', icon: Frown, color: '#F43F5E', bg: 'bg-[#F43F5E]/10 border-[#F43F5E]/30 text-[#F43F5E]' },
};

const ENERGY_CONFIG: Record<
  EnergyLevel,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  very_low: { label: 'Very Low Energy', icon: BatteryLow, color: '#F43F5E' },
  low: { label: 'Low Energy', icon: BatteryLow, color: '#FBBF24' },
  moderate: { label: 'Moderate Energy', icon: BatteryMedium, color: '#94A3B8' },
  high: { label: 'High Energy', icon: Battery, color: '#9B7BFF' },
  very_high: { label: 'Peak Energy', icon: BatteryCharging, color: '#43D9A3' },
};

export const ReflectionDetailModal: React.FC<ReflectionDetailModalProps> = ({
  isOpen,
  onClose,
  entry,
  onEdit,
  onDelete,
}) => {
  if (!entry) return null;

  const moodConfig = entry.mood ? MOOD_CONFIG[entry.mood] : null;
  const MoodIcon = moodConfig?.icon;
  const energyConfig = entry.energy ? ENERGY_CONFIG[entry.energy] : null;
  const EnergyIcon = energyConfig?.icon;

  const wordCount = getWordCount(entry.content);

  const checklistItems = [
    { key: 'reviewedLearning', label: 'Reviewed Concepts & Misconceptions', answer: entry.checklist?.reviewedLearning },
    { key: 'taskProgress', label: 'Executed Daily Plan & Schedule', answer: entry.checklist?.taskProgress },
    { key: 'physicalWellbeing', label: 'Physical Recovery & Nutrition', answer: entry.checklist?.physicalWellbeing },
    { key: 'reflectedOnMistake', label: 'Logged Mistakes Without Defense', answer: entry.checklist?.reflectedOnMistake },
    { key: 'identifiedNextStep', label: 'Defined First Step for Tomorrow', answer: entry.checklist?.identifiedNextStep },
  ].filter(i => Boolean(i.answer));

  const hasHighlights = Boolean(
    entry.highlights?.mainWin ||
    entry.highlights?.biggestChallenge ||
    entry.highlights?.lessonLearned ||
    entry.highlights?.priorityTomorrow
  );

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={entry.title}
      subtitle={formatLongDate(entry.date)}
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-[#292936]">
            {moodConfig && MoodIcon && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${moodConfig.bg}`}
              >
                <MoodIcon className="w-3.5 h-3.5" />
                <span>{moodConfig.label}</span>
              </span>
            )}

            {energyConfig && EnergyIcon && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#181824] border border-[#292936] text-[#C5C5D2]">
                <span style={{ color: energyConfig.color }}>
                  <EnergyIcon className="w-3.5 h-3.5" />
                </span>
                <span>{energyConfig.label}</span>
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#181824] border border-[#292936] text-[#8E8EA0] ml-auto">
              <Clock className="w-3 h-3 text-[#8E8EA0]" />
              <span>{wordCount} words</span>
            </span>
          </div>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.map(t => (
                <span
                  key={t}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#9B7BFF]/10 text-[#9B7BFF] border border-[#9B7BFF]/20"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Journal Main Text */}
          {entry.content && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8E8EA0]">
                Reflection Notes
              </h4>
              <div className="p-4 bg-[#181824] border border-[#292936] rounded-xl text-sm text-[#F3F3F7] leading-relaxed whitespace-pre-wrap selection:bg-[#9B7BFF]/30">
                {entry.content}
              </div>
            </div>
          )}

          {/* Structured Highlights */}
          {hasHighlights && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8E8EA0]">
                Daily Highlights & Lessons
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {entry.highlights?.mainWin && (
                  <div className="p-3.5 bg-[#43D9A3]/5 border border-[#43D9A3]/20 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#43D9A3]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Main Win</span>
                    </div>
                    <p className="text-xs text-[#F3F3F7] leading-relaxed">{entry.highlights.mainWin}</p>
                  </div>
                )}

                {entry.highlights?.biggestChallenge && (
                  <div className="p-3.5 bg-[#FBBF24]/5 border border-[#FBBF24]/20 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FBBF24]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Challenge Faced</span>
                    </div>
                    <p className="text-xs text-[#F3F3F7] leading-relaxed">{entry.highlights.biggestChallenge}</p>
                  </div>
                )}

                {entry.highlights?.lessonLearned && (
                  <div className="p-3.5 bg-[#9B7BFF]/5 border border-[#9B7BFF]/20 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#9B7BFF]">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Key Lesson</span>
                    </div>
                    <p className="text-xs text-[#F3F3F7] leading-relaxed">{entry.highlights.lessonLearned}</p>
                  </div>
                )}

                {entry.highlights?.priorityTomorrow && (
                  <div className="p-3.5 bg-[#38BDF8]/5 border border-[#38BDF8]/20 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#38BDF8]">
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Tomorrow's Priority</span>
                    </div>
                    <p className="text-xs text-[#F3F3F7] leading-relaxed">{entry.highlights.priorityTomorrow}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Checklist Audits */}
          {checklistItems.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8E8EA0]">
                Execution Audit
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {checklistItems.map(item => {
                  let badgeCls = 'bg-[#94A3B8]/10 text-[#94A3B8] border-[#94A3B8]/20';
                  let answerLabel = 'N/A';
                  if (item.answer === 'yes') {
                    badgeCls = 'bg-[#43D9A3]/10 text-[#43D9A3] border-[#43D9A3]/30';
                    answerLabel = 'Yes';
                  } else if (item.answer === 'partly') {
                    badgeCls = 'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/30';
                    answerLabel = 'Partly';
                  } else if (item.answer === 'not_yet') {
                    badgeCls = 'bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/30';
                    answerLabel = 'No';
                  }
                  return (
                    <div
                      key={item.key}
                      className="p-2.5 bg-[#181824] border border-[#292936] rounded-lg flex items-center justify-between gap-2"
                    >
                      <span className="text-xs text-[#C5C5D2]">{item.label}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeCls}`}>
                        {answerLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#292936] bg-[#121219]">
          <button
            type="button"
            onClick={() => {
              onDelete(entry.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#8E8EA0] hover:text-[#F3F3F7] rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(entry);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#9B7BFF] hover:bg-[#8A67FF] text-white rounded-lg shadow-sm shadow-[#9B7BFF]/30 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Entry</span>
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
