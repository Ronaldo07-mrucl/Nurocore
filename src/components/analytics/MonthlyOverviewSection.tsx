import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { buildMonthlyOverview, MonthlyOverviewRow } from '../../utils/analytics';
import {
  Calendar,
  Clock,
  BookOpen,
  Award,
  Dumbbell,
  CheckSquare,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface MonthlyOverviewSectionProps {
  onSelectMonth?: (monthKey: string) => void;
}

export const MonthlyOverviewSection: React.FC<MonthlyOverviewSectionProps> = ({
  onSelectMonth,
}) => {
  const { studySessions, tests, workouts, habits, habitCompletions } = useApp();

  const monthlyRows = useMemo(() => {
    return buildMonthlyOverview(
      studySessions,
      tests,
      workouts,
      habits,
      habitCompletions,
      6
    );
  }, [studySessions, tests, workouts, habits, habitCompletions]);

  return (
    <section className="bg-[#14141D] border border-[#292936] rounded-xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#292936]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#F3F3F7]">
              Multi-Month Macro Overview (Last 6 Months)
            </h2>
            <p className="text-xs text-[#8E8EA0]">
              Historical cross-discipline trajectory across study hours, questions, test averages, fitness, and discipline
            </p>
          </div>
        </div>
      </div>

      {/* Table / Cards Grid */}
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-left text-xs border-collapse min-w-[650px]">
          <thead>
            <tr className="border-b border-[#292936] text-[#8E8EA0] uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3 font-semibold">Month</th>
              <th className="py-2.5 px-3 font-semibold text-right">Study Hours</th>
              <th className="py-2.5 px-3 font-semibold text-right">Questions</th>
              <th className="py-2.5 px-3 font-semibold text-right">Tests Taken</th>
              <th className="py-2.5 px-3 font-semibold text-right">Avg Test Score</th>
              <th className="py-2.5 px-3 font-semibold text-right">Workouts</th>
              <th className="py-2.5 px-3 font-semibold text-right">Habit Consistency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#292936]/60">
            {monthlyRows.map(row => (
              <tr
                key={row.monthKey}
                className="hover:bg-[#1B1B26]/50 transition-colors group"
              >
                {/* Month Name & Partial Badge */}
                <td className="py-3 px-3 font-medium text-[#F3F3F7]">
                  <div className="flex items-center gap-2">
                    <span>{row.label}</span>
                    {row.isPartial && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-semibold">
                        Partial
                      </span>
                    )}
                  </div>
                </td>

                {/* Study Hours */}
                <td className="py-3 px-3 text-right font-mono">
                  <span className={row.studyHours > 0 ? 'text-[#F3F3F7] font-semibold' : 'text-[#8E8EA0]'}>
                    {row.studyHours}h
                  </span>
                </td>

                {/* Questions */}
                <td className="py-3 px-3 text-right font-mono">
                  <span className={row.questionsSolved > 0 ? 'text-[#38BDF8] font-semibold' : 'text-[#8E8EA0]'}>
                    {row.questionsSolved.toLocaleString()}
                  </span>
                </td>

                {/* Tests Taken */}
                <td className="py-3 px-3 text-right font-mono">
                  <span className={row.testsTaken > 0 ? 'text-[#F3F3F7] font-semibold' : 'text-[#8E8EA0]'}>
                    {row.testsTaken}
                  </span>
                </td>

                {/* Avg Test Score */}
                <td className="py-3 px-3 text-right font-mono">
                  <span className={row.avgTestScore !== null ? 'text-amber-400 font-bold' : 'text-[#8E8EA0]'}>
                    {row.avgTestScore !== null ? `${row.avgTestScore}%` : '—'}
                  </span>
                </td>

                {/* Workouts */}
                <td className="py-3 px-3 text-right font-mono">
                  <span className={row.workoutsCount > 0 ? 'text-rose-400 font-semibold' : 'text-[#8E8EA0]'}>
                    {row.workoutsCount}
                  </span>
                </td>

                {/* Habit Consistency */}
                <td className="py-3 px-3 text-right font-mono">
                  <span className={row.habitConsistency > 0 ? 'text-[#43D9A3] font-bold' : 'text-[#8E8EA0]'}>
                    {row.habitConsistency > 0 ? `${row.habitConsistency}%` : '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2 text-[11px] text-[#8E8EA0] flex items-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>
          <strong>Note:</strong> Ongoing calendar months are tagged as <em>Partial</em> to maintain analytical fairness during cross-month comparisons.
        </span>
      </div>
    </section>
  );
};
