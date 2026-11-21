import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DateRange,
  calculateStudyMetrics,
  buildStudyTimeSeries,
  buildSubjectDistribution,
} from '../../utils/analytics';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  TrendingUp,
  Brain,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { ChapterMastery } from '../../types';

interface StudyAnalyticsSectionProps {
  currentRange: DateRange;
}

export const StudyAnalyticsSection: React.FC<StudyAnalyticsSectionProps> = ({
  currentRange,
}) => {
  const { studySessions, subjects, chapters, setActivePage } = useApp();

  const [activeMetricTab, setActiveMetricTab] = useState<'hours' | 'questions'>('hours');

  // Compute metrics
  const studyMetrics = useMemo(() => {
    return calculateStudyMetrics(
      studySessions,
      subjects,
      currentRange.startDate,
      currentRange.endDate
    );
  }, [studySessions, subjects, currentRange.startDate, currentRange.endDate]);

  // Time series for charts
  const timeSeriesData = useMemo(() => {
    return buildStudyTimeSeries(
      studySessions,
      currentRange.startDate,
      currentRange.endDate,
      currentRange.dayCount
    );
  }, [studySessions, currentRange.startDate, currentRange.endDate, currentRange.dayCount]);

  // Subject distribution
  const subjectDistribution = useMemo(() => {
    return buildSubjectDistribution(
      studySessions,
      subjects,
      currentRange.startDate,
      currentRange.endDate
    );
  }, [studySessions, subjects, currentRange.startDate, currentRange.endDate]);

  // Chapter mastery counts
  const masteryCounts = useMemo(() => {
    const counts: Record<ChapterMastery, number> = {
      nil: 0,
      mains: 0,
      advanced: 0,
      extreme: 0,
    };
    chapters.forEach(c => {
      if (counts[c.mastery] !== undefined) {
        counts[c.mastery]++;
      } else {
        counts.nil++;
      }
    });
    return counts;
  }, [chapters]);

  const totalChapters = chapters.length;

  return (
    <section className="bg-[#14141D] border border-[#292936] rounded-xl p-5 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#292936]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#9B7BFF]/10 text-[#9B7BFF] flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#F3F3F7]">
              Study Performance Analytics
            </h2>
            <p className="text-xs text-[#8E8EA0]">
              Deep work hours, problem volume, subject allocation, and mastery states
            </p>
          </div>
        </div>

        {/* Chart View Toggle */}
        <div className="flex items-center bg-[#0B0B10] border border-[#292936] rounded-lg p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveMetricTab('hours')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeMetricTab === 'hours'
                ? 'bg-[#1B1B26] text-[#F3F3F7] font-semibold shadow-sm'
                : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
            }`}
          >
            Study Hours
          </button>
          <button
            type="button"
            onClick={() => setActiveMetricTab('questions')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeMetricTab === 'questions'
                ? 'bg-[#1B1B26] text-[#F3F3F7] font-semibold shadow-sm'
                : 'text-[#8E8EA0] hover:text-[#F3F3F7]'
            }`}
          >
            Questions Solved
          </button>
        </div>
      </div>

      {/* Chart 1 & 2: Time Series Chart */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F3F3F7]">
              {activeMetricTab === 'hours'
                ? 'Study Duration Trend (Hours / Day)'
                : 'Questions Attempted & Solved Trend'}
            </h3>
            <span className="text-[11px] text-[#8E8EA0]">
              {activeMetricTab === 'hours'
                ? `Total ${studyMetrics.totalHours} hrs over ${studyMetrics.activeStudyDays} active days`
                : `Total ${studyMetrics.totalQuestions} questions across all study sessions`}
            </span>
          </div>
        </div>

        {studyMetrics.totalMinutes === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-[#292936] rounded-xl bg-[#0B0B10]/20 text-center p-4">
            <Clock className="w-8 h-8 text-[#8E8EA0] mb-2 opacity-50" />
            <p className="text-xs text-[#8E8EA0]">No study sessions logged for this period.</p>
            <button
              type="button"
              onClick={() => setActivePage('study-log')}
              className="mt-2 text-xs font-medium text-[#9B7BFF] hover:underline"
            >
              Log a study session in Study Log →
            </button>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeMetricTab === 'hours' ? (
                <AreaChart
                  data={timeSeriesData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="studyHoursGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9B7BFF" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#9B7BFF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292936" vertical={false} />
                  <XAxis
                    dataKey="formattedDate"
                    stroke="#8E8EA0"
                    fontSize={11}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#8E8EA0"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={val => `${val}h`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#14141D] border border-[#292936] p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                            <p className="font-semibold text-[#F3F3F7]">{data.date}</p>
                            <p className="text-[#9B7BFF] font-medium">
                              {data.hours} hours ({data.minutes} mins)
                            </p>
                            <p className="text-[#8E8EA0]">
                              {data.questions} questions solved
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#9B7BFF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#studyHoursGrad)"
                  />
                </AreaChart>
              ) : (
                <BarChart
                  data={timeSeriesData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#292936" vertical={false} />
                  <XAxis
                    dataKey="formattedDate"
                    stroke="#8E8EA0"
                    fontSize={11}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#8E8EA0"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#14141D] border border-[#292936] p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                            <p className="font-semibold text-[#F3F3F7]">{data.date}</p>
                            <p className="text-[#38BDF8] font-medium">
                              {data.questions} questions
                            </p>
                            <p className="text-[#8E8EA0]">
                              Study time: {data.hours} hrs
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="questions" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Grid: Chart 3 (Subject Distribution) & Chart 4 (Chapter Mastery Overview) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4 border-t border-[#292936]">
        {/* Chart 3: Study Distribution by Subject */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F3F3F7] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#9B7BFF]" />
              Subject Time Distribution
            </h3>
            <span className="text-[11px] text-[#8E8EA0]">
              {subjectDistribution.length} active subjects
            </span>
          </div>

          {subjectDistribution.length === 0 ? (
            <div className="h-44 flex items-center justify-center border border-dashed border-[#292936] rounded-xl text-xs text-[#8E8EA0]">
              No subject study distribution available.
            </div>
          ) : (
            <div className="space-y-3">
              {subjectDistribution.map(subj => (
                <div key={subj.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#F3F3F7]">{subj.name}</span>
                    <span className="text-[#8E8EA0] font-mono">
                      {subj.hours} hrs ({subj.percentage}%) • {subj.questions} Qs
                    </span>
                  </div>
                  <div className="w-full bg-[#1B1B26] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${subj.percentage}%`,
                        backgroundColor: subj.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart 4: Chapter Mastery Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F3F3F7] flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-[#43D9A3]" />
              Syllabus Chapter Mastery
            </h3>
            <span className="text-[11px] text-[#8E8EA0]">
              {totalChapters} total chapters tracked
            </span>
          </div>

          {totalChapters === 0 ? (
            <div className="h-44 flex items-center justify-center border border-dashed border-[#292936] rounded-xl text-xs text-[#8E8EA0]">
              No chapters in syllabus.
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Mastery Categories */}
              <div className="p-3 bg-[#1B1B26] border border-[#292936] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-[#F3F3F7]">
                    Extreme Mastery
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#F3F3F7] font-mono">
                    {masteryCounts.extreme}
                  </span>
                  <span className="text-[10px] text-[#8E8EA0]">
                    ({Math.round((masteryCounts.extreme / totalChapters) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#1B1B26] border border-[#292936] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span className="text-xs font-semibold text-[#F3F3F7]">
                    Advanced Ready
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#F3F3F7] font-mono">
                    {masteryCounts.advanced}
                  </span>
                  <span className="text-[10px] text-[#8E8EA0]">
                    ({Math.round((masteryCounts.advanced / totalChapters) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#1B1B26] border border-[#292936] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  <span className="text-xs font-semibold text-[#F3F3F7]">
                    Mains Proficient
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#F3F3F7] font-mono">
                    {masteryCounts.mains}
                  </span>
                  <span className="text-[10px] text-[#8E8EA0]">
                    ({Math.round((masteryCounts.mains / totalChapters) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#1B1B26] border border-[#292936] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  <span className="text-xs font-semibold text-[#F3F3F7]">
                    Nil / Uncovered
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#F3F3F7] font-mono">
                    {masteryCounts.nil}
                  </span>
                  <span className="text-[10px] text-[#8E8EA0]">
                    ({Math.round((masteryCounts.nil / totalChapters) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calculated Study Observations / Insights */}
      {studyMetrics.totalMinutes > 0 && (
        <div className="pt-4 border-t border-[#292936] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {studyMetrics.mostStudiedSubject && (
            <div className="p-3 bg-[#1B1B26] border border-[#292936] rounded-lg">
              <span className="text-[10px] uppercase tracking-wider text-[#8E8EA0] block mb-1">
                Primary Academic Focus
              </span>
              <p className="text-xs font-bold text-[#F3F3F7]">
                {studyMetrics.mostStudiedSubject.name}
              </p>
              <span className="text-[11px] text-[#9B7BFF]">
                {Math.round(studyMetrics.mostStudiedSubject.minutes / 60)} hrs ({studyMetrics.mostStudiedSubject.percentage}% share)
              </span>
            </div>
          )}

          {studyMetrics.highestStudyDay && (
            <div className="p-3 bg-[#1B1B26] border border-[#292936] rounded-lg">
              <span className="text-[10px] uppercase tracking-wider text-[#8E8EA0] block mb-1">
                Peak Study Day
              </span>
              <p className="text-xs font-bold text-[#F3F3F7]">
                {studyMetrics.highestStudyDay.formattedDate}
              </p>
              <span className="text-[11px] text-[#43D9A3]">
                {studyMetrics.highestStudyDay.hours} hours logged
              </span>
            </div>
          )}

          <div className="p-3 bg-[#1B1B26] border border-[#292936] rounded-lg">
            <span className="text-[10px] uppercase tracking-wider text-[#8E8EA0] block mb-1">
              Active Day Output
            </span>
            <p className="text-xs font-bold text-[#F3F3F7]">
              {studyMetrics.avgHoursPerActiveDay} hrs / study day
            </p>
            <span className="text-[11px] text-[#8E8EA0]">
              {studyMetrics.activeStudyDays} study days recorded
            </span>
          </div>

          <div className="p-3 bg-[#1B1B26] border border-[#292936] rounded-lg">
            <span className="text-[10px] uppercase tracking-wider text-[#8E8EA0] block mb-1">
              Revision Density
            </span>
            <p className="text-xs font-bold text-[#F3F3F7]">
              {studyMetrics.revisionPercentage}% revision share
            </p>
            <span className="text-[11px] text-[#8E8EA0]">
              {studyMetrics.revisionSessionsCount} of {studyMetrics.totalSessions} sessions
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
