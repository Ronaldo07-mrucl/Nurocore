import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DateRange,
  calculateHabitsAnalytics,
} from '../../utils/analytics';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  CheckSquare,
  Flame,
  Award,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { formatMonthDay, formatShortDate } from '../../utils/dates';

interface HabitAnalyticsSectionProps {
  currentRange: DateRange;
}

export const HabitAnalyticsSection: React.FC<HabitAnalyticsSectionProps> = ({
  currentRange,
}) => {
  const { habits, habitCompletions, setActivePage } = useApp();

  const habitAnalytics = useMemo(() => {
    return calculateHabitsAnalytics(
      habits,
      habitCompletions,
      currentRange.startDate,
      currentRange.endDate
    );
  }, [habits, habitCompletions, currentRange.startDate, currentRange.endDate]);

  const getHeatmapColor = (pct: number, scheduled: number) => {
    if (scheduled === 0) return 'bg-[#1B1B26] border-[#292936] text-[#8E8EA0]'; // Unscheduled
    if (pct === 100) return 'bg-emerald-500/25 border-emerald-500/50 text-emerald-300';
    if (pct >= 75) return 'bg-[#43D9A3]/20 border-[#43D9A3]/40 text-[#43D9A3]';
    if (pct >= 50) return 'bg-amber-500/20 border-amber-500/40 text-amber-300';
    if (pct > 0) return 'bg-rose-500/15 border-rose-500/30 text-rose-300';
    return 'bg-[#14141D] border-[#292936] text-[#8E8EA0]'; // 0%
  };

  return (
    <section className="bg-[#14141D] border border-[#292936] rounded-xl p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#292936]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#43D9A3]/10 text-[#43D9A3] flex items-center justify-center shrink-0">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#F3F3F7]">
              Habit & Discipline Analytics
            </h2>
            <p className="text-xs text-[#8E8EA0]">
              Scheduled execution consistency, per-habit retention, and daily completion intensity
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActivePage('habit-tracking')}
          className="px-3 py-1 text-xs font-semibold text-[#43D9A3] bg-[#43D9A3]/10 hover:bg-[#43D9A3]/20 border border-[#43D9A3]/30 rounded-lg transition-colors self-start sm:self-auto"
        >
          View Habit Tracker →
        </button>
      </div>

      {habitAnalytics.overallScheduled === 0 ? (
        <div className="py-10 px-4 text-center border border-dashed border-[#292936] rounded-xl bg-[#0B0B10]/20">
          <CheckSquare className="w-8 h-8 text-[#8E8EA0] mx-auto mb-2 opacity-50" />
          <p className="text-xs text-[#8E8EA0]">No scheduled habits found for this reporting period.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-3.5 bg-[#1B1B26] border border-[#292936] rounded-xl">
              <span className="text-[11px] font-medium text-[#8E8EA0] uppercase tracking-wider block">
                Overall Consistency
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-[#F3F3F7]">
                  {habitAnalytics.overallConsistency}%
                </span>
                <span className="text-xs text-[#8E8EA0]">completion rate</span>
              </div>
              <p className="text-[11px] text-[#8E8EA0] mt-1.5">
                {habitAnalytics.overallCompleted} of {habitAnalytics.overallScheduled} occurrences
              </p>
            </div>

            <div className="p-3.5 bg-[#1B1B26] border border-[#292936] rounded-xl">
              <span className="text-[11px] font-medium text-[#8E8EA0] uppercase tracking-wider block">
                Tracked Routines
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-[#F3F3F7]">
                  {habitAnalytics.habitsList.length}
                </span>
                <span className="text-xs text-[#8E8EA0]">active habits</span>
              </div>
              <p className="text-[11px] text-[#8E8EA0] mt-1.5">
                {habitAnalytics.habitsList.filter(h => h.isNonNegotiable).length} non-negotiables
              </p>
            </div>

            <div className="p-3.5 bg-[#1B1B26] border border-[#292936] rounded-xl">
              <span className="text-[11px] font-medium text-[#8E8EA0] uppercase tracking-wider block">
                Top Performing Habit
              </span>
              <div className="mt-1">
                <p className="text-sm font-bold text-[#F3F3F7] truncate">
                  {habitAnalytics.bestPerformingHabits[0]?.name || 'None'}
                </p>
                <span className="text-xs font-semibold text-[#43D9A3]">
                  {habitAnalytics.bestPerformingHabits[0]?.consistencyPercentage || 0}% consistency
                </span>
              </div>
              <p className="text-[11px] text-[#8E8EA0] mt-1">
                {habitAnalytics.bestPerformingHabits[0]?.completedOccurrences} days completed
              </p>
            </div>
          </div>

          {/* Chart 3: Habit Completion Trend Over Time */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F3F3F7]">
                  Daily Habit Completion Trend (% of Scheduled Due)
                </h3>
                <span className="text-[11px] text-[#8E8EA0]">
                  Calculated purely from habits due on each date (unscheduled days excluded)
                </span>
              </div>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={habitAnalytics.dailyTrendSeries}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#292936" vertical={false} />
                  <XAxis dataKey="formattedDate" stroke="#8E8EA0" fontSize={10} tickLine={false} />
                  <YAxis stroke="#8E8EA0" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#14141D] border border-[#292936] p-2.5 rounded text-xs space-y-1">
                            <p className="font-semibold text-[#F3F3F7]">{data.date}</p>
                            <p className="text-[#43D9A3] font-bold">
                              {data.percentage}% ({data.completedCount}/{data.scheduledCount} completed)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="percentage" fill="#43D9A3" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mini Calendar Heatmap Grid for Period */}
          {habitAnalytics.dailyTrendSeries.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#292936]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#F3F3F7] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#43D9A3]" />
                  Daily Execution Heatmap
                </span>
                {/* Legend */}
                <div className="flex items-center gap-2 text-[10px] text-[#8E8EA0]">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#14141D] border border-[#292936]" /> 0%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500/40" /> 50%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#43D9A3]/20 border border-[#43D9A3]/40" /> 75%+
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500/25 border border-emerald-500/50" /> 100%
                  </span>
                </div>
              </div>

              {/* Grid of daily chips */}
              <div className="flex flex-wrap gap-1.5 p-3 bg-[#0B0B10] border border-[#292936] rounded-xl max-h-36 overflow-y-auto">
                {habitAnalytics.dailyTrendSeries.map(d => (
                  <div
                    key={d.date}
                    title={`${d.date}: ${d.percentage}% (${d.completedCount}/${d.scheduledCount})`}
                    className={`px-2 py-1.5 rounded-lg border text-center text-[10px] min-w-[50px] transition-all cursor-default ${getHeatmapColor(
                      d.percentage,
                      d.scheduledCount
                    )}`}
                  >
                    <span className="block font-mono text-[9px] opacity-75">{formatMonthDay(d.date)}</span>
                    <span className="font-bold block mt-0.5">
                      {d.scheduledCount > 0 ? `${d.percentage}%` : 'Off'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per-Habit Breakdown Table */}
          <div className="space-y-3 pt-2 border-t border-[#292936]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F3F3F7]">
              Per-Habit Consistency Breakdown
            </h3>
            <div className="space-y-2">
              {habitAnalytics.habitsList.map(h => (
                <div
                  key={h.id}
                  className="p-3 bg-[#1B1B26] border border-[#292936] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#F3F3F7] truncate">{h.name}</span>
                      {h.isNonNegotiable && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-semibold uppercase">
                          Non-negotiable
                        </span>
                      )}
                      <span className="px-1.5 py-0.2 rounded bg-[#14141D] text-[#8E8EA0] border border-[#292936] text-[9px] uppercase">
                        {h.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-28 bg-[#14141D] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#43D9A3] h-full rounded-full transition-all duration-300"
                        style={{ width: `${h.consistencyPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#F3F3F7] font-mono min-w-[36px] text-right">
                      {h.consistencyPercentage}%
                    </span>
                    <span className="text-[11px] text-[#8E8EA0] min-w-[65px] text-right">
                      {h.completedOccurrences}/{h.scheduledOccurrences}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
