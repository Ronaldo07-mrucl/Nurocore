import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DateRange,
  calculateProductivityMetrics,
} from '../../utils/analytics';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Flag,
  Target,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { formatShortDate } from '../../utils/dates';

interface ProductivityAnalyticsSectionProps {
  currentRange: DateRange;
}

export const ProductivityAnalyticsSection: React.FC<ProductivityAnalyticsSectionProps> = ({
  currentRange,
}) => {
  const { tasks, monthlyOutcomes, goals, setActivePage } = useApp();

  const metrics = useMemo(() => {
    return calculateProductivityMetrics(
      tasks,
      monthlyOutcomes,
      goals,
      currentRange.startDate,
      currentRange.endDate
    );
  }, [tasks, monthlyOutcomes, goals, currentRange.startDate, currentRange.endDate]);

  const getPriorityColor = (p: string) => {
    if (p === 'high') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (p === 'medium') return 'text-[#9B7BFF] bg-[#9B7BFF]/10 border-[#9B7BFF]/20';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  return (
    <section className="bg-[#14141D] border border-[#292936] rounded-xl p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#292936]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#9B7BFF]/10 text-[#9B7BFF] flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#F3F3F7]">
              Planning & Task Productivity Analytics
            </h2>
            <p className="text-xs text-[#8E8EA0]">
              Due task completion, overdue accountability, priority breakdown, and macro outcomes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActivePage('planning')}
          className="px-3 py-1 text-xs font-semibold text-[#9B7BFF] bg-[#9B7BFF]/10 hover:bg-[#9B7BFF]/20 border border-[#9B7BFF]/30 rounded-lg transition-colors self-start sm:self-auto"
        >
          View Planning & Scheduler →
        </button>
      </div>

      {/* 4 Cards: Tasks Due, Completed, Completion Rate, Overdue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-[#1B1B26] border border-[#292936] rounded-xl">
          <span className="text-[11px] font-medium text-[#8E8EA0] uppercase tracking-wider block">
            Tasks Due in Period
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#F3F3F7]">
              {metrics.tasksDueInPeriod}
            </span>
            <span className="text-xs text-[#8E8EA0]">scheduled</span>
          </div>
          <p className="text-[11px] text-[#8E8EA0] mt-1.5">
            Authoritative due dates within range
          </p>
        </div>

        <div className="p-3.5 bg-[#1B1B26] border border-[#292936] rounded-xl">
          <span className="text-[11px] font-medium text-[#8E8EA0] uppercase tracking-wider block">
            Tasks Completed
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#43D9A3]">
              {metrics.tasksCompletedInPeriod}
            </span>
            <span className="text-xs text-[#8E8EA0]">finished</span>
          </div>
          <p className="text-[11px] text-[#8E8EA0] mt-1.5">
            {metrics.taskCompletionRate}% completion rate
          </p>
        </div>

        <div className="p-3.5 bg-[#1B1B26] border border-[#292936] rounded-xl">
          <span className="text-[11px] font-medium text-[#8E8EA0] uppercase tracking-wider block">
            Overdue Incomplete
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-bold ${metrics.overdueTasksCount > 0 ? 'text-rose-400' : 'text-[#43D9A3]'}`}>
              {metrics.overdueTasksCount}
            </span>
            <span className="text-xs text-[#8E8EA0]">tasks past due</span>
          </div>
          <p className="text-[11px] text-[#8E8EA0] mt-1.5">
            {metrics.overdueTasksCount === 0 ? 'Clean slate — no overdue tasks' : 'Requires rescheduling or execution'}
          </p>
        </div>

        <div className="p-3.5 bg-[#1B1B26] border border-[#292936] rounded-xl">
          <span className="text-[11px] font-medium text-[#8E8EA0] uppercase tracking-wider block">
            Monthly Outcomes Focus
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#9B7BFF]">
              {metrics.monthlyOutcomesSummary.completed} / {metrics.monthlyOutcomesSummary.total}
            </span>
            <span className="text-xs text-[#8E8EA0]">done</span>
          </div>
          <p className="text-[11px] text-[#8E8EA0] mt-1.5">
            {metrics.monthlyOutcomesSummary.percentage}% strategic delivery
          </p>
        </div>
      </div>

      {/* Lower Row: Priority Breakdown & Long-term Goals Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-[#292936]">
        {/* Priority Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F3F3F7] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#9B7BFF]" />
            Task Execution by Priority
          </h3>
          <div className="space-y-2.5">
            {metrics.tasksByPriority.map(item => {
              const pct = item.count > 0 ? Math.round((item.completedCount / item.count) * 100) : 0;
              return (
                <div key={item.priority} className="p-3 bg-[#1B1B26] border border-[#292936] rounded-lg">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityColor(item.priority)}`}>
                      {item.priority} Priority
                    </span>
                    <span className="text-[#F3F3F7] font-semibold font-mono">
                      {item.completedCount} / {item.count} done ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#14141D] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#9B7BFF] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Long-Term Goals Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F3F3F7] flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-amber-400" />
              Long-Term Identity Goals Status
            </h3>
            <span className="text-xs text-[#8E8EA0]">
              Avg: <strong className="text-amber-400 font-mono">{metrics.goalsSummary.averageProgress}%</strong>
            </span>
          </div>

          <div className="space-y-2">
            {goals.length === 0 ? (
              <p className="text-xs text-[#8E8EA0]">No long-term goals registered.</p>
            ) : (
              goals.map(g => (
                <div key={g.id} className="p-2.5 bg-[#1B1B26] border border-[#292936] rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#F3F3F7] truncate">{g.title}</span>
                    <span className="font-bold text-amber-400 font-mono">{g.progress}%</span>
                  </div>
                  <div className="w-full bg-[#14141D] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                  {g.identityStatement && (
                    <p className="text-[10px] text-[#8E8EA0] italic truncate">
                      "{g.identityStatement}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
