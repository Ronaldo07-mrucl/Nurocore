import React from 'react';
import { ReflectionEntry, Mood } from '../../types';
import { StreakResult, getMoodDistribution, getTagFrequencies, getWordCount } from '../../utils/reflectionStats';
import {
  Flame,
  BookOpen,
  Sparkles,
  BarChart2,
  Tag,
  PenTool,
  Smile,
  Meh,
  Frown,
  AlertTriangle,
} from 'lucide-react';

interface ReflectionStatsProps {
  entries: ReflectionEntry[];
  streakInfo: StreakResult;
  selectedTag?: string;
  onSelectTag: (tag: string | undefined) => void;
}

const MOOD_META: { id: Mood; label: string; color: string; bg: string }[] = [
  { id: 'great', label: 'Great', color: '#43D9A3', bg: 'bg-[#43D9A3]' },
  { id: 'good', label: 'Good', color: '#9B7BFF', bg: 'bg-[#9B7BFF]' },
  { id: 'neutral', label: 'Neutral', color: '#94A3B8', bg: 'bg-[#94A3B8]' },
  { id: 'difficult', label: 'Difficult', color: '#FBBF24', bg: 'bg-[#FBBF24]' },
  { id: 'low', label: 'Low', color: '#F43F5E', bg: 'bg-[#F43F5E]' },
];

export const ReflectionStats: React.FC<ReflectionStatsProps> = ({
  entries,
  streakInfo,
  selectedTag,
  onSelectTag,
}) => {
  const moodDist = getMoodDistribution(entries);
  const totalWithMood = Object.values(moodDist).reduce((a, b) => a + b, 0);
  const tagFreqs = getTagFrequencies(entries);

  // Word metrics
  const totalWords = entries.reduce((acc, e) => acc + getWordCount(e.content), 0);
  const avgWords = entries.length > 0 ? Math.round(totalWords / entries.length) : 0;

  return (
    <div className="space-y-4">
      {/* 4 Quick Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Entries */}
        <div className="p-4 bg-[#14141D] border border-[#292936] rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#9B7BFF]/10 text-[#9B7BFF] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[#8E8EA0] uppercase tracking-wider block">
              Total Entries
            </span>
            <span className="text-lg font-bold text-[#F3F3F7]">{entries.length}</span>
          </div>
        </div>

        {/* Current & Longest Streak */}
        <div className="p-4 bg-[#14141D] border border-[#292936] rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FBBF24]/10 text-[#FBBF24] flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[#8E8EA0] uppercase tracking-wider block">
              Current Streak
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-[#F3F3F7]">
                {streakInfo.currentStreak}d
              </span>
              <span className="text-[11px] text-[#8E8EA0]">
                (Best: {streakInfo.longestStreak}d)
              </span>
            </div>
          </div>
        </div>

        {/* Average Words */}
        <div className="p-4 bg-[#14141D] border border-[#292936] rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#43D9A3]/10 text-[#43D9A3] flex items-center justify-center shrink-0">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[#8E8EA0] uppercase tracking-wider block">
              Avg Words / Entry
            </span>
            <span className="text-lg font-bold text-[#F3F3F7]">{avgWords}</span>
          </div>
        </div>

        {/* Total Volume */}
        <div className="p-4 bg-[#14141D] border border-[#292936] rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[#8E8EA0] uppercase tracking-wider block">
              Total Words Written
            </span>
            <span className="text-lg font-bold text-[#F3F3F7]">
              {totalWords.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Mood Distribution & Tag Cloud Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mood Distribution */}
        <div className="p-4 bg-[#14141D] border border-[#292936] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8E8EA0] flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-[#9B7BFF]" />
              <span>Mood State Calibration</span>
            </span>
            <span className="text-[11px] text-[#8E8EA0]">
              {totalWithMood} tagged entries
            </span>
          </div>

          {/* Segmented bar */}
          {totalWithMood > 0 ? (
            <>
              <div className="h-2.5 w-full bg-[#181824] rounded-full overflow-hidden flex">
                {MOOD_META.map(m => {
                  const count = moodDist[m.id];
                  if (count === 0) return null;
                  const pct = (count / totalWithMood) * 100;
                  return (
                    <div
                      key={m.id}
                      style={{ width: `${pct}%`, backgroundColor: m.color }}
                      className="h-full transition-all"
                      title={`${m.label}: ${count} (${pct.toFixed(0)}%)`}
                    />
                  );
                })}
              </div>

              {/* Legend with counts */}
              <div className="grid grid-cols-5 gap-2 pt-1 text-center">
                {MOOD_META.map(m => {
                  const count = moodDist[m.id];
                  const pct = totalWithMood > 0 ? Math.round((count / totalWithMood) * 100) : 0;
                  return (
                    <div key={m.id} className="space-y-0.5">
                      <div className="flex items-center justify-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: m.color }}
                        />
                        <span className="text-[11px] font-medium text-[#C5C5D2]">{m.label}</span>
                      </div>
                      <div className="text-xs font-semibold text-[#F3F3F7]">
                        {count} <span className="text-[10px] text-[#8E8EA0] font-normal">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-xs text-[#8E8EA0] py-4 text-center">
              No mood tags recorded yet. Select a mood when creating entries to reveal distribution patterns.
            </div>
          )}
        </div>

        {/* Frequent Reflection Tags */}
        <div className="p-4 bg-[#14141D] border border-[#292936] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8E8EA0] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#43D9A3]" />
              <span>Theme Frequency</span>
            </span>
            {selectedTag && (
              <button
                type="button"
                onClick={() => onSelectTag(undefined)}
                className="text-[11px] text-[#9B7BFF] hover:underline"
              >
                Clear filter ({selectedTag})
              </button>
            )}
          </div>

          {tagFreqs.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tagFreqs.map(({ tag, count }) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onSelectTag(isSelected ? undefined : tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#9B7BFF] text-white border-[#9B7BFF]'
                        : 'bg-[#181824] border-[#292936] text-[#C5C5D2] hover:border-[#3E3E52] hover:text-white'
                    }`}
                  >
                    <span>#{tag}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[#292936] text-[#8E8EA0]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-[#8E8EA0] py-4 text-center">
              No custom tags added yet. Tag entries to group reflections by theme.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
