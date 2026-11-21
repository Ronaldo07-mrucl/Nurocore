import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DateRange,
  calculateTestMetrics,
  calculateErrorMetrics,
} from '../../utils/analytics';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  Award,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  FileText,
  Layers,
  Info,
} from 'lucide-react';
import { formatMonthDay, formatShortDate } from '../../utils/dates';
import { calculateTestPercentage } from '../../utils/metrics';

interface TestAnalyticsSectionProps {
  currentRange: DateRange;
}

export const TestAnalyticsSection: React.FC<TestAnalyticsSectionProps> = ({
  currentRange,
}) => {
  const { tests, testErrors, subjects, setActivePage } = useApp();

  const testMetrics = useMemo(() => {
    return calculateTestMetrics(tests, currentRange.startDate, currentRange.endDate);
  }, [tests, currentRange.startDate, currentRange.endDate]);

  const errorMetrics = useMemo(() => {
    return calculateErrorMetrics(
      testErrors,
      tests,
      subjects,
      currentRange.startDate,
      currentRange.endDate
    );
  }, [testErrors, tests, subjects, currentRange.startDate, currentRange.endDate]);

  // Chart data with normalized percentages and separate Mains / Advanced lines
  const scoreTrendData = useMemo(() => {
    return testMetrics.testsList.map(t => {
      const pct = calculateTestPercentage(t.marksObtained, t.totalMarks);
      return {
        id: t.id,
        rawDate: t.date,
        formattedDate: formatMonthDay(t.date),
        name: t.name,
        examType: t.examType,
        obtained: t.marksObtained,
        totalMarks: t.totalMarks,
        percentage: pct,
        mainsPercentage: t.examType === 'Mains' ? pct : null,
        advancedPercentage: t.examType === 'Advanced' ? pct : null,
      };
    });
  }, [testMetrics.testsList]);

  return (
    <section className="bg-[#14141D] border border-[#292936] rounded-xl p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#292936]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#F3F3F7]">
              Test & Exam Performance Analytics
            </h2>
            <p className="text-xs text-[#8E8EA0]">
              Normalized percentage scores, Mains vs. Advanced comparisons, and error patterns
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActivePage('test-error-log')}
          className="px-3 py-1 text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors self-start sm:self-auto"
        >
          View Test Log →
        </button>
      </div>

      {/* Chart 1: Test Score Normalized Percentage Trend */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F3F3F7]">
              Normalized Test Score Trend (% Performance)
            </h3>
            <span className="text-[11px] text-[#8E8EA0]">
              Normalized to percentages so tests with differing max marks (e.g. 300 vs 360) are fairly compared
            </span>
          </div>
          {testMetrics.totalTests > 0 && (
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-xs text-[#9B7BFF]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9B7BFF]" />
                Mains
              </span>
              <span className="flex items-center gap-1.5 text-xs text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Advanced
              </span>
            </div>
          )}
        </div>

        {scoreTrendData.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center border border-dashed border-[#292936] rounded-xl bg-[#0B0B10]/20 text-center p-4">
            <Award className="w-8 h-8 text-[#8E8EA0] mb-2 opacity-50" />
            <p className="text-xs text-[#8E8EA0]">No test records found for this period.</p>
          </div>
        ) : (
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={scoreTrendData}
                margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#292936" vertical={false} />
                <XAxis
                  dataKey="formattedDate"
                  stroke="#8E8EA0"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#8E8EA0"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={val => `${val}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#14141D] border border-[#292936] p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[180px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-[#8E8EA0]">{data.rawDate}</span>
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                                data.examType === 'Mains'
                                  ? 'bg-[#9B7BFF]/20 text-[#9B7BFF]'
                                  : 'bg-amber-400/20 text-amber-400'
                              }`}
                            >
                              {data.examType}
                            </span>
                          </div>
                          <p className="font-semibold text-[#F3F3F7]">{data.name}</p>
                          <div className="pt-1 border-t border-[#292936] flex items-center justify-between text-xs">
                            <span className="text-[#8E8EA0]">Score:</span>
                            <span className="font-bold text-[#F3F3F7]">
                              {data.obtained} / {data.totalMarks}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-semibold text-[#43D9A3]">
                            <span>Percentage:</span>
                            <span>{data.percentage}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="mainsPercentage"
                  name="JEE Mains"
                  stroke="#9B7BFF"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#9B7BFF' }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="advancedPercentage"
                  name="JEE Advanced"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#F59E0B' }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Chart 2: Mains vs Advanced Comparative Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#292936]">
        {/* Mains Summary */}
        <div className="p-4 bg-[#1B1B26] border border-[#292936] rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9B7BFF]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F3F3F7]">
                JEE Mains Simulations
              </h4>
            </div>
            <span className="text-xs text-[#8E8EA0] font-mono">
              {testMetrics.mainsCount} tests
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2 bg-[#14141D] rounded-lg border border-[#292936]/60">
            <div>
              <span className="text-[10px] text-[#8E8EA0] uppercase block">Tests</span>
              <span className="text-sm font-bold text-[#F3F3F7]">{testMetrics.mainsCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8E8EA0] uppercase block">Average %</span>
              <span className="text-sm font-bold text-[#9B7BFF]">
                {testMetrics.mainsCount > 0 ? `${testMetrics.mainsAvgPercentage}%` : '—'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#8E8EA0] uppercase block">Top Score</span>
              <span className="text-sm font-bold text-[#43D9A3]">
                {testMetrics.mainsCount > 0 ? `${testMetrics.mainsBestPercentage}%` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Advanced Summary */}
        <div className="p-4 bg-[#1B1B26] border border-[#292936] rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F3F3F7]">
                JEE Advanced Simulations
              </h4>
            </div>
            <span className="text-xs text-[#8E8EA0] font-mono">
              {testMetrics.advancedCount} tests
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2 bg-[#14141D] rounded-lg border border-[#292936]/60">
            <div>
              <span className="text-[10px] text-[#8E8EA0] uppercase block">Tests</span>
              <span className="text-sm font-bold text-[#F3F3F7]">{testMetrics.advancedCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8E8EA0] uppercase block">Average %</span>
              <span className="text-sm font-bold text-amber-400">
                {testMetrics.advancedCount > 0 ? `${testMetrics.advancedAvgPercentage}%` : '—'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#8E8EA0] uppercase block">Top Score</span>
              <span className="text-sm font-bold text-[#43D9A3]">
                {testMetrics.advancedCount > 0 ? `${testMetrics.advancedBestPercentage}%` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Analysis Subsection */}
      <div className="pt-4 border-t border-[#292936] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F3F3F7]">
              Error Classification & Resolution Audit
            </h3>
          </div>
          <span className="text-xs text-[#8E8EA0]">
            {errorMetrics.resolvedCount} of {errorMetrics.totalErrors} errors resolved ({errorMetrics.resolutionRate}%)
          </span>
        </div>

        {errorMetrics.totalErrors === 0 ? (
          <div className="py-6 px-4 text-center border border-dashed border-[#292936] rounded-xl bg-[#0B0B10]/20 text-xs text-[#8E8EA0]">
            No test errors logged for this date range. Error analysis activates once questions are logged in Test & Error Log.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Error Categories Bar Breakdown */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-medium text-[#8E8EA0] block">
                Mistake Types Breakdown
              </span>
              <div className="space-y-2">
                {errorMetrics.categoryBreakdown.map(cat => (
                  <div key={cat.type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#F3F3F7] font-medium">{cat.label}</span>
                      <span className="text-[#8E8EA0] font-mono">
                        {cat.count} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#1B1B26] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-rose-400 transition-all duration-300"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Resolution & Subject distribution */}
            <div className="space-y-3">
              <span className="text-[11px] font-medium text-[#8E8EA0] block">
                Resolution & Subject Heatmap
              </span>

              {/* Progress bar */}
              <div className="p-3 bg-[#1B1B26] border border-[#292936] rounded-lg">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#8E8EA0]">Resolution Rate</span>
                  <span className="font-bold text-[#43D9A3]">{errorMetrics.resolutionRate}%</span>
                </div>
                <div className="w-full bg-[#14141D] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#43D9A3] h-full rounded-full transition-all duration-300"
                    style={{ width: `${errorMetrics.resolutionRate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#8E8EA0] mt-2">
                  <span>{errorMetrics.resolvedCount} Resolved</span>
                  <span>{errorMetrics.unresolvedCount} Pending Attention</span>
                </div>
              </div>

              {/* Subject breakdown of errors */}
              {errorMetrics.subjectBreakdown.length > 0 && (
                <div className="p-3 bg-[#1B1B26] border border-[#292936] rounded-lg space-y-1.5">
                  <span className="text-[10px] uppercase text-[#8E8EA0] font-medium block">
                    Errors by Subject
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {errorMetrics.subjectBreakdown.map(sb => (
                      <span
                        key={sb.subjectId}
                        className="px-2 py-1 rounded bg-[#14141D] border border-[#292936] text-xs text-[#F3F3F7] flex items-center gap-1.5"
                      >
                        <span>{sb.subjectName}:</span>
                        <strong className="text-rose-400 font-mono">{sb.count}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Honest Note about Subject-Level Test Breakdown */}
      <div className="p-3 bg-[#1B1B26] border border-[#292936] rounded-lg flex items-start gap-2.5 text-xs text-[#8E8EA0]">
        <Info className="w-4 h-4 text-[#9B7BFF] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Subject-Level Score Notice:</strong> Full test records record total obtained marks and overall maximum marks. Specific subject allocations (Physics, Chemistry, Maths) are detailed in the Error Log and Question Drills above.
        </p>
      </div>
    </section>
  );
};
